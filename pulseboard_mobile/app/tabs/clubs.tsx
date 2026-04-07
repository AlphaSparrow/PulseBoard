import React, { useState, useCallback, useEffect } from 'react';
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
  StyleSheet,
  FlatList
} from 'react-native';
import { Search, Check, Plus } from 'lucide-react-native';
import { useFocusEffect, router } from 'expo-router';
import { toggleFollowClubApi, getAllClubs } from '../../src/api/club.api';
import { getUserProfile } from '../../src/api/user.api';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../src/context/ThemeContext';

const THEME = {
  ACCENT: '#CCF900',
  ACCENT_GLOW: 'rgba(204, 249, 0, 0.15)',
  BG: '#050505',
  CARD_BG: '#09090B',
};

const iconMap: Record<number, string> = {
  1: '📈', 2: '💻', 3: '🤖', 4: '👾', 5: '📱',
  6: '⌨️', 7: '🎸', 8: '📸', 9: '🎨', 10: '🎬',
  11: '📐', 12: '🎭', 13: '💼', 14: '💡', 15: '🎮',
};

const ClubItem = React.memo(({ club, isFollowed, isLoading, onToggleFollow, onPress }: any) => {
  const { isDark } = useTheme();
  
  return (
    <View style={{ width: wp('42%'), marginBottom: hp('2%') }}>
      <View className={`rounded-[20px] border justify-between relative overflow-hidden ${
          isFollowed 
            ? (isDark ? 'bg-[#0E0E10] border-[#CCF900]/30' : 'bg-white border-[#CCF900]/40') 
            : (isDark ? 'bg-[#09090B] border-white/5' : 'bg-[#FAFAFA] border-black/5')
        }`}
        style={{ 
          padding: wp('4%'), 
          height: hp('26%'),
          ...(isDark ? {} : { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 })
        }}>

        {isFollowed && (
          <View className="absolute -top-10 -right-10 w-32 h-32 bg-[#CCF900] opacity-5 blur-3xl rounded-full" />
        )}

        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={0.9}
          onPress={onPress}
        >
          <View>
            <View className="flex-row justify-between items-start"
              style={{ marginBottom: hp('2%') }}>
              <Text style={{ fontSize: hp('3.5%') }}>{club.icon}</Text>
              {isFollowed && (
                <View className="bg-[#CCF900]/10 p-1 rounded-full">
                  <Check size={hp('1.5%')} color="#CCF900" strokeWidth={4} />
                </View>
              )}
            </View>

            <Text className={`font-extrabold ${isDark ? 'text-white' : 'text-black'}`}
              style={{ fontSize: hp('2%'), marginBottom: hp('1%') }}>
              {club.name}
            </Text>

            <Text className={`font-medium ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}
              style={{ fontSize: hp('1.3%') }}
              numberOfLines={3}>
              {club.description}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleFollow}
          disabled={isLoading}
          activeOpacity={0.8}
          className={`w-full rounded-lg items-center justify-center ${
              isFollowed ? (isDark ? 'bg-white/5 border border-white/10' : 'bg-neutral-100 border border-black/5') : 'bg-[#CCF900]'
            }`}
          style={{ paddingVertical: hp('1.2%') }}>
          {isLoading ? (
            <ActivityIndicator size="small" color={isFollowed ? (isDark ? "white" : "black") : "black"} />
          ) : (
            <Text className={`font-bold uppercase ${
                isFollowed ? (isDark ? 'text-white/60' : 'text-neutral-500') : 'text-black'
              }`}
              style={{ fontSize: hp('1.1%') }}>
              {isFollowed ? 'Following' : 'Follow'}
            </Text>
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
});

export default function ClubsScreen() {
  const { isDark } = useTheme();
  const [clubs, setClubs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [followedClubs, setFollowedClubs] = useState<number[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // FETCH CLUBS FROM DB
  useEffect(() => {
    const fetch = async () => {
      try {
        console.log("fetching clubs...");
        const data = await getAllClubs();
        const mapped = data.map((club: any) => ({
          id: club.clubId,
          _id: club._id,
          name: club.name,
          category: club.category,
          description: club.description,
          icon: iconMap[club.clubId] || '🔥',
        }));

        setClubs(mapped);
      } catch (e) {
        console.log('Club fetch error', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // FOLLOW SYNC
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
    } catch {
      Alert.alert("Connection Error", "Could not update follow status.");
    } finally {
      setLoadingId(null);
    }
  };

  const categories = ['all', ...new Set(clubs.map(c => c.category))];

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

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-[#050505]' : 'bg-white'}`}>
        <ActivityIndicator size="large" color="#CCF900" />
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#050505]' : 'bg-white'}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* HEADER */}
      <View style={{ paddingHorizontal: wp('7%'), paddingTop: hp('3.5%'), paddingBottom: hp('2%') }}>
        <Text className={`${isDark ? 'text-neutral-500' : 'text-neutral-400'} font-bold uppercase`}
          style={{ fontSize: hp('1.5%'), letterSpacing: 4, marginBottom: hp('0.5%') }}>
          Explore
        </Text>
        <Text className={`${isDark ? 'text-white' : 'text-black'} font-black tracking-tight`}
          style={{ fontSize: hp('4%') }}>
          DIRECTORY
        </Text>
      </View>

      {/* STATS STRIP */}
      <View style={{ paddingHorizontal: wp('6%'), marginBottom: hp('3%') }}>
        <View className={`flex-row border rounded-2xl overflow-hidden ${isDark ? 'bg-[#09090B] border-white/10' : 'bg-[#FAFAFA] border-black/5'}`}
          style={{ height: hp('10%') }}>

          <View className={`flex-1 justify-center border-r ${isDark ? 'border-white/5' : 'border-black/5'}`}
            style={{ paddingHorizontal: wp('5%') }}>
            <Text className="text-neutral-500 font-bold uppercase tracking-wider"
              style={{ fontSize: hp('1.2%'), marginBottom: hp('0.5%') }}>
              Total Clubs
            </Text>
            <Text className={`${isDark ? 'text-white' : 'text-black'} font-black`}
              style={{ fontSize: hp('3%') }}>
              {clubs.length}
            </Text>
          </View>

          <View className="flex-1 justify-center relative"
            style={{ paddingHorizontal: wp('5%') }}>
            {isDark && (
              <LinearGradient
                colors={[THEME.ACCENT_GLOW, 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="absolute inset-0 opacity-50"
              />
            )}
            <Text className="text-[#CCF900] font-bold uppercase tracking-wider"
              style={{ fontSize: hp('1.2%'), marginBottom: hp('0.5%') }}>
              Following
            </Text>
            <Text className={`${isDark ? 'text-white' : 'text-black'} font-black`}
              style={{ fontSize: hp('3%') }}>
              {followedClubs.length}
            </Text>
          </View>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={{ paddingHorizontal: wp('6%'), marginBottom: hp('3%') }}>
        <View className={`flex-row items-center border rounded-xl px-4 ${isDark ? 'bg-[#121212] border-white/10' : 'bg-neutral-100 border-black/5'}`}
          style={{ height: hp('6%') }}>
          <Search color={isDark ? THEME.ACCENT : '#888'} size={hp('2.2%')} />
          <TextInput
            className={`flex-1 font-medium ${isDark ? 'text-white' : 'text-black'}`}
            style={{ fontSize: hp('1.6%') }}
            placeholder="Search for clubs..."
            placeholderTextColor={isDark ? "#52525B" : "#A1A1A1"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* CATEGORY STRIP */}
      <View style={{ marginBottom: hp('3%') }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: wp('6%') }}>
          {categories.map(category => {
            const isActive = activeCategory === category;
            return (
              <TouchableOpacity key={category}
                onPress={() => setActiveCategory(category)}
                style={{ marginRight: wp('3%') }}>
                <View className={`rounded-full border ${
                    isActive 
                      ? 'bg-[#CCF900] border-[#CCF900]' 
                      : (isDark ? 'border-white/15' : 'border-black/5 bg-neutral-100')
                  }`}
                  style={{ paddingHorizontal: wp('5%'), paddingVertical: hp('1.2%') }}>
                  <Text className={`font-bold uppercase ${
                      isActive ? 'text-black' : (isDark ? 'text-neutral-400' : 'text-neutral-500')
                    }`}
                    style={{ fontSize: hp('1.4%') }}>
                    {category}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={displayedClubs}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: wp('6%') }}
        contentContainerStyle={{ paddingBottom: hp('15%') }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: club }) => (
          <ClubItem
            club={club}
            isFollowed={followedClubs.includes(club.id)}
            isLoading={loadingId === club.id}
            onToggleFollow={() => toggleFollow(club.id)}
            onPress={() => router.push(`/clubs/${club.id}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}
