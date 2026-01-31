import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  SafeAreaView, StatusBar, Modal, ActivityIndicator, Platform 
} from 'react-native';
import { 
  Menu, Calendar, PlayCircle, MapPin, LogOut
} from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router'; 
import { getEventFeed } from '../../src/api/event.api'; 
import { getUserProfile } from '../../src/api/user.api';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const THEME_ACCENT = '#CCF900'; 

const getRgba = (hex: string, opacity: number) => {
    if(!hex) return `rgba(255, 255, 255, ${opacity})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const SectionHeader = ({ title, icon: Icon, color = "white" }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp('6%'), marginBottom: hp('2.5%'), marginTop: hp('1%') }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp('3%') }}>
      {Icon && <Icon color={color} size={hp('2.5%')} />}
      <Text style={{ color: 'white', fontSize: hp('2%'), fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>
        {title}
      </Text>
    </View>
  </View>
);

export default function HomeScreen() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- REAL USER STATE
  const [user, setUser] = useState({
    name: "Loading...",  
    following: [],       
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      if (events.length === 0) setLoading(true);

      const [userData, eventData] = await Promise.all([
        getUserProfile(),
        getEventFeed()
      ]);

      const followingList = userData.following || userData.data?.following || [];

      setUser({
        name: userData.name,
        following: followingList
      });

      setEvents(eventData);

    } catch (err) {
      console.log("Failed to load home data", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Sorting Logic ---
  const sortEventsByFollowing = (eventsList: any[]) => {
    return [...eventsList].sort((a, b) => {
      const aFollowed = (user as any).following.includes(a.clubId);
      const bFollowed = (user as any).following.includes(b.clubId);
      
      if (aFollowed && !bFollowed) return -1;
      if (!aFollowed && bFollowed) return 1;
      return 0;
    });
  };

  const liveEvents = useMemo(() => 
    sortEventsByFollowing(events.filter((e: any) => e.badge === 'LIVE')), 
  [(user as any).following, events]);

  const upcomingEvents = useMemo(() => 
    sortEventsByFollowing(events.filter((e: any) => e.badge === 'UPCOMING')), 
  [(user as any).following, events]);

  if (loading && events.length === 0) {
    return (
      <View className="flex-1 bg-[#050505] justify-center items-center">
        <ActivityIndicator size="large" color={THEME_ACCENT} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#050505]">
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <SafeAreaView className="flex-1" style={{ paddingTop: Platform.OS === 'android' ? hp('1%') : 0 }}>
        
        {/* Header */}
        <View style={{ paddingHorizontal: wp('7%'), paddingTop: hp('3%'), paddingBottom: hp('3%'), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#737373', fontWeight: 'bold', fontSize: hp('1.5%'), letterSpacing: 3, textTransform: 'uppercase', marginBottom: hp('0.5%') }}>
              Welcome Back
            </Text>
            <Text style={{ color: 'white', fontSize: hp('3.7%'), fontWeight: '900', letterSpacing: -1 }}>
              {(user as any).name}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: wp('4%') }}>
             <TouchableOpacity 
                onPress={() => setShowSidebar(true)} 
                style={{ width: wp('12%'), height: wp('12%'), backgroundColor: '#121212', borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
             >
              <Menu color="white" size={hp('2.5%')} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: hp('5%') }}>
          
          {/* LIVE NOW SECTION */}
          <SectionHeader title="Happening Now" icon={PlayCircle} color={THEME_ACCENT} />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: wp('6%') }} 
            style={{ marginBottom: hp('5%') }}
          >
            {liveEvents.map((event: any) => {
              const isFollowed = (user as any).following.includes(event.clubId);
              const cardColor = event.color || THEME_ACCENT; 
              
              return (
                <TouchableOpacity 
                  key={event._id} 
                  activeOpacity={0.8}
                  style={{ 
                    width: wp('55%'), 
                    height: hp('32%'), 
                    backgroundColor: '#121212', 
                    borderRadius: 32, 
                    marginRight: wp('4%'), 
                    padding: wp('5%'), 
                    justifyContent: 'space-between', 
                    overflow: 'hidden',
                    borderWidth: isFollowed ? 1 : 0,
                    borderColor: isFollowed ? getRgba(cardColor, 0.4) : 'transparent'
                  }}
                >
                  {isFollowed ? (
                      <View style={{ position: 'absolute', right: -40, top: -40, width: wp('40%'), height: wp('40%'), borderRadius: 999, backgroundColor: getRgba(cardColor, 0.2), opacity: 0.5 }} className="blur-3xl" />
                  ) : (
                      <View style={{ position: 'absolute', right: -40, top: -40, width: wp('30%'), height: wp('30%'), backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 999 }} className="blur-3xl" />
                  )}

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ 
                        paddingHorizontal: wp('3%'), 
                        paddingVertical: hp('0.5%'), 
                        borderRadius: 999, 
                        borderWidth: 1,
                        backgroundColor: getRgba(cardColor, 0.2), 
                        borderColor: getRgba(cardColor, 0.3) 
                      }}>
                      <Text style={{ fontSize: hp('1.2%'), fontWeight: '900', letterSpacing: 2, color: cardColor }}>LIVE</Text>
                    </View>
                    <Text style={{ fontSize: hp('3.5%') }}>{event.icon}</Text>
                  </View>

                  <View>
                      <Text style={{ color: '#737373', fontSize: hp('1.2%'), fontWeight: 'bold', letterSpacing: 2, marginBottom: hp('0.5%'), textTransform: 'uppercase' }}>
                      {event.clubName}
                    </Text>
                    <Text style={{ color: 'white', fontSize: hp('2.8%'), fontWeight: '900', lineHeight: hp('3.2%'), marginBottom: hp('1%') }} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp('0.5%') }}>
                      <MapPin size={hp('1.5%')} color="#666" />
                      <Text style={{ color: '#A3A3A3', fontSize: hp('1.4%'), fontWeight: 'bold', marginLeft: wp('1%') }}>{event.location}</Text>
                    </View>
                  </View>

                  <View style={{ 
                      width: '100%', 
                      height: hp('5%'), 
                      borderRadius: 12, 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginTop: hp('1%'),
                      backgroundColor: cardColor 
                    }}>
                    <Text style={{ color: 'black', fontWeight: 'bold', fontSize: hp('1.4%'), textTransform: 'uppercase', letterSpacing: 1 }}>Join Now</Text>
                  </View>
                </TouchableOpacity>
            )})}
          </ScrollView>

          {/* UPCOMING SECTION */}
          <SectionHeader title="Coming Up" icon={Calendar} color="#A0A0A0" />
          
          <View style={{ paddingHorizontal: wp('6%'), marginBottom: hp('5%'), gap: hp('1.5%') }}>
            {upcomingEvents.map((event: any) => {
               const isFollowed = (user as any).following.includes(event.clubId);
               const cardColor = event.color || '#fff';
               const dateObj = new Date(event.date);
               const day = dateObj.getDate();
               const month = dateObj.toLocaleString('default', { month: 'short' });

               return (
                <TouchableOpacity 
                  key={event._id}
                  activeOpacity={0.7}
                  style={{ 
                    width: '100%', 
                    backgroundColor: '#121212', 
                    borderRadius: 24, 
                    padding: wp('4%'), 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    borderWidth: isFollowed ? 1 : 0,
                    borderColor: isFollowed ? getRgba(cardColor, 0.3) : 'transparent'
                  }}
                >
                  <View style={{ 
                      width: wp('16%'), 
                      height: wp('16%'), 
                      borderRadius: 16, 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: wp('4%'),
                      backgroundColor: isFollowed ? getRgba(cardColor, 0.1) : '#1A1A1A' 
                    }}>
                    <Text style={{ fontSize: hp('1.2%'), fontWeight: '900', textTransform: 'uppercase', marginBottom: 2, color: isFollowed ? cardColor : '#737373' }}>
                      {month}
                    </Text>
                    <Text style={{ color: 'white', fontSize: hp('2.5%'), fontWeight: '900' }}>{day}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: hp('2%'), fontWeight: 'bold', marginBottom: hp('0.5%') }}>{event.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: hp('1.4%'), fontWeight: 'bold', marginRight: wp('2%'), color: cardColor }}>{event.timeDisplay}</Text>
                      <Text style={{ color: '#52525B', fontSize: hp('1.4%'), fontWeight: 'bold' }}>@ {event.location}</Text>
                    </View>
                  </View>
                  
                  <View style={{ width: wp('10%'), height: wp('10%'), borderRadius: 999, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', borderColor: '#262626', borderWidth: 1 }}>
                    <Text style={{ fontSize: hp('2.2%') }}>{event.icon}</Text>
                  </View>
                </TouchableOpacity>
            )})}
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Sidebar (Log Out) */}
      <Modal visible={showSidebar} animationType="fade" transparent={true} onRequestClose={() => setShowSidebar(false)}>
        <View className="flex-1 bg-black/90 flex-row">
          <View style={{ width: wp('80%'), backgroundColor: '#0A0A0A', height: '100%', paddingTop: hp('10%'), paddingHorizontal: wp('8%'), borderRightWidth: 1, borderColor: '#171717' }}>
             <Text style={{ color: 'white', fontSize: hp('4%'), fontWeight: '900', marginBottom: hp('5%') }}>Menu</Text>
             <TouchableOpacity onPress={() => router.replace('/')} style={{ flexDirection: 'row', alignItems: 'center' }}>
               <LogOut color="#EF4444" size={hp('3%')} />
               <Text style={{ color: 'white', fontSize: hp('2.2%'), fontWeight: 'bold', marginLeft: wp('4%') }}>Log Out</Text>
             </TouchableOpacity>
          </View>
          <TouchableOpacity className="flex-1" onPress={() => setShowSidebar(false)} />
        </View>
      </Modal>

    </View>
  );
}