import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet
} from 'react-native';
import { Search, Check, Plus, Filter, Grid, Zap } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { toggleFollowClubApi } from '../../src/api/club.api';
import { getUserProfile } from '../../src/api/user.api';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// --- THEME CONSTANTS ---
const THEME_ACCENT = '#CCF900'; 
const BG_MAIN = '#050505';
const BG_CARD = '#121212';
const BORDER_COLOR = 'rgba(255,255,255,0.08)';

// --- UTILS ---
const getRgba = (hex: string, opacity: number) => {
    if(!hex) return `rgba(255, 255, 255, ${opacity})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function ClubsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [followedClubs, setFollowedClubs] = useState<number[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // DATA: Manual IDs 1-15
  const clubs = [
    { id: 1, name: 'Quant Club', icon: '📈', category: 'Technical', description: 'Algorithmic Trading & Finance' },
    { id: 2, name: 'Devlup Labs', icon: '💻', category: 'Technical', description: 'Open Source Development' },
    { id: 3, name: 'RAID', icon: '🤖', category: 'Technical', description: 'AI & Deep Learning' },
    { id: 4, name: 'Inside', icon: '👾', category: 'Technical', description: 'Game Development Society' },
    { id: 5, name: 'Product Club', icon: '📱', category: 'Technical', description: 'Product Design & Mgmt' },
    { id: 6, name: 'PSOC', icon: '⌨️', category: 'Technical', description: 'Competitive Programming' },
    { id: 7, name: 'TGT', icon: '🎸', category: 'Cultural', description: 'The Groove Theory (Music)' },
    { id: 8, name: 'Shutterbugs', icon: '📸', category: 'Cultural', description: 'Photography Society' },
    { id: 9, name: 'Ateliers', icon: '🎨', category: 'Cultural', description: 'Fine Arts & Crafts' },
    { id: 10, name: 'FrameX', icon: '🎬', category: 'Cultural', description: 'Filmmaking & Editing' },
    { id: 11, name: 'Designerds', icon: '📐', category: 'Cultural', description: 'UI/UX & Graphic Design' },
    { id: 12, name: 'Dramebaaz', icon: '🎭', category: 'Cultural', description: 'Drama & Theatrics' },
    { id: 13, name: 'E-Cell', icon: '💼', category: 'Other', description: 'Entrepreneurship Cell' },
    { id: 14, name: 'Nexus', icon: '💡', category: 'Other', description: 'Innovation & Ideas' },
    { id: 15, name: 'Respawn', icon: '🎮', category: 'Other', description: 'eSports & Gaming' },
  ];

  const categories = ['all', 'Technical', 'Cultural', 'Other'];

  // --- Real-Time Sync Logic ---
  useFocusEffect(
    useCallback(() => {
      fetchUserFollowing();
    }, [])
  );

  const fetchUserFollowing = async () => {
    try {
      const res: any = await getUserProfile();
      const list = res.following || res.data?.following || [];
      setFollowedClubs(list);
    } catch (err) {
      console.error("Profile Sync Error:", err);
    }
  };

  const toggleFollow = async (clubId: number) => {
    setLoadingId(clubId);
    try {
      const res: any = await toggleFollowClubApi(clubId);
      const updatedList = res.following || res.data?.following || [];
      setFollowedClubs(updatedList);
    } catch (err) {
      Alert.alert("Connection Error", "Could not update follow status.");
    } finally {
      setLoadingId(null);
    }
  };

  const filterClubs = () => {
    let filtered = clubs;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(club => club.category === activeCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const displayedClubs = filterClubs();

  return (
    <View style={{ flex: 1, backgroundColor: BG_MAIN }}>
      <StatusBar barStyle="light-content" backgroundColor={BG_MAIN} />
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? hp('1%') : 0 }}>

        {/* --- Header --- */}
        <View style={{ paddingHorizontal: wp('7%'), paddingTop: hp('3%'), paddingBottom: hp('2%'), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
                <Text style={{ color: '#737373', fontWeight: 'bold', fontSize: hp('1.5%'), letterSpacing: 3, textTransform: 'uppercase', marginBottom: hp('0.5%') }}>
                    Explore
                </Text>
                <Text style={{ color: 'white', fontSize: hp('4%'), fontWeight: '900', letterSpacing: -1 }}>
                    DIRECTORY
                </Text>
            </View>
            <View style={{ 
              width: wp('12%'), height: wp('12%'), 
              backgroundColor: BG_CARD, 
              borderRadius: 999, 
              alignItems: 'center', justifyContent: 'center', 
              marginTop: hp('1%'), 
              borderWidth: 1, borderColor: '#222' 
            }}>
                <Grid color={THEME_ACCENT} size={hp('2.4%')} />
            </View>
        </View>

        {/* --- Stats Strip --- */}
        <View style={{ paddingHorizontal: wp('6%'), marginBottom: hp('3%') }}>
            <View style={{ 
                flexDirection: 'row', 
                backgroundColor: BG_CARD, 
                borderWidth: 1, 
                borderColor: BORDER_COLOR, 
                borderRadius: 24, 
                height: hp('10%'),
                overflow: 'hidden'
            }}>
                {/* Total */}
                <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: wp('6%'), borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                    <Text style={{ color: '#737373', fontSize: hp('1.2%'), fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        Total Clubs
                    </Text>
                    <Text style={{ color: 'white', fontSize: hp('3.2%'), fontWeight: '900' }}>
                        {clubs.length}
                    </Text>
                </View>

                {/* Following */}
                <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: wp('6%'), position: 'relative' }}>
                     <LinearGradient 
                        colors={[getRgba(THEME_ACCENT, 0.1), 'transparent']} 
                        start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} 
                        style={StyleSheet.absoluteFill} 
                     />
                     <Text style={{ color: THEME_ACCENT, fontSize: hp('1.2%'), fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        Following
                    </Text>
                    <Text style={{ color: 'white', fontSize: hp('3.2%'), fontWeight: '900' }}>
                        {followedClubs.length}
                    </Text>
                </View>
            </View>
        </View>

        {/* --- Search & Filter --- */}
        <View style={{ paddingHorizontal: wp('6%'), marginBottom: hp('2.5%'), flexDirection: 'row', gap: wp('3%') }}>
            <View style={{ 
                flex: 1, 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: BG_CARD, 
                borderWidth: 1, 
                borderColor: BORDER_COLOR, 
                borderRadius: 16, 
                paddingHorizontal: wp('4%'),
                height: hp('6%')
            }}>
                <Search color={THEME_ACCENT} size={hp('2.2%')} style={{ opacity: 0.8, marginRight: wp('3%') }} />
                <TextInput
                    style={{ flex: 1, color: 'white', fontSize: hp('1.6%'), fontWeight: '600' }}
                    placeholder="Search clubs..."
                    placeholderTextColor="#52525B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <TouchableOpacity style={{ 
                width: hp('6%'), height: hp('6%'), 
                backgroundColor: BG_CARD, 
                borderRadius: 16, 
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: BORDER_COLOR
            }}>
                <Filter color="#737373" size={hp('2.2%')} />
            </TouchableOpacity>
        </View>

        {/* --- Category Tabs --- */}
        <View style={{ marginBottom: hp('3%') }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp('6%') }}>
                {categories.map(category => {
                    const isActive = activeCategory === category;
                    return (
                        <TouchableOpacity
                            key={category}
                            onPress={() => setActiveCategory(category)}
                            activeOpacity={0.7}
                            style={{ 
                                marginRight: wp('3%'),
                                paddingHorizontal: wp('5%'),
                                paddingVertical: hp('1%'),
                                borderRadius: 999,
                                backgroundColor: isActive ? THEME_ACCENT : 'transparent',
                                borderWidth: 1,
                                borderColor: isActive ? THEME_ACCENT : BORDER_COLOR
                            }}
                        >
                            <Text style={{ 
                                color: isActive ? 'black' : '#737373', 
                                fontWeight: '800', 
                                fontSize: hp('1.4%'), 
                                textTransform: 'uppercase',
                                letterSpacing: 0.5
                            }}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>

        {/* --- Club Grid --- */}
        <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: wp('6%'), paddingBottom: hp('15%') }}
        >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {displayedClubs.map(club => {
                    const isFollowed = followedClubs.includes(club.id);
                    const isLoading = loadingId === club.id;

                    return (
                        <View key={club.id} style={{ width: wp('42%'), marginBottom: hp('2%') }}>
                            <View style={{ 
                                backgroundColor: isFollowed ? '#0E0E10' : BG_CARD,
                                borderRadius: 24,
                                borderWidth: 1,
                                borderColor: isFollowed ? getRgba(THEME_ACCENT, 0.3) : BORDER_COLOR,
                                padding: wp('4%'),
                                height: hp('24%'),
                                justifyContent: 'space-between',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {/* Followed Glow */}
                                {isFollowed && (
                                    <View style={{ position: 'absolute', top: -40, right: -40, width: 100, height: 100, backgroundColor: THEME_ACCENT, opacity: 0.15, borderRadius: 999 }} className="blur-3xl" />
                                )}

                                {/* Top Section */}
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: hp('1.5%') }}>
                                        <Text style={{ fontSize: hp('3.5%') }}>{club.icon}</Text>
                                        {isFollowed && (
                                            <View style={{ backgroundColor: getRgba(THEME_ACCENT, 0.15), padding: 4, borderRadius: 999 }}>
                                                <Check size={hp('1.4%')} color={THEME_ACCENT} strokeWidth={4} />
                                            </View>
                                        )}
                                    </View>
                                    
                                    <Text style={{ color: 'white', fontSize: hp('1.8%'), fontWeight: '900', lineHeight: hp('2.2%'), marginBottom: hp('0.5%') }}>
                                        {club.name}
                                    </Text>
                                    <Text style={{ color: '#737373', fontSize: hp('1.3%'), fontWeight: '600' }} numberOfLines={2}>
                                        {club.description}
                                    </Text>
                                </View>

                                {/* Action Button */}
                                <TouchableOpacity
                                    onPress={() => toggleFollow(club.id)}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                    style={{ 
                                        width: '100%', 
                                        paddingVertical: hp('1.2%'),
                                        borderRadius: 12,
                                        backgroundColor: isFollowed ? 'rgba(255,255,255,0.05)' : THEME_ACCENT,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                        borderWidth: isFollowed ? 1 : 0,
                                        borderColor: 'rgba(255,255,255,0.1)'
                                    }}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={isFollowed ? "white" : "black"} />
                                    ) : isFollowed ? (
                                        <Text style={{ color: '#A3A3A3', fontSize: hp('1.1%'), fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>
                                            Following
                                        </Text>
                                    ) : (
                                        <>
                                            <Plus size={hp('1.4%')} color="black" strokeWidth={4} style={{ marginRight: 4 }} />
                                            <Text style={{ color: 'black', fontSize: hp('1.1%'), fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                Follow
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Empty State */}
            {displayedClubs.length === 0 && (
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: hp('5%'), opacity: 0.5 }}>
                    <Zap size={hp('6%')} color="#333" style={{ marginBottom: hp('2%') }} />
                    <Text style={{ color: '#52525B', fontSize: hp('1.6%'), fontWeight: 'bold' }}>
                        No clubs found.
                    </Text>
                </View>
            )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}