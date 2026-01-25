import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  SafeAreaView, StatusBar, Modal, ActivityIndicator 
} from 'react-native';
import { 
  Menu, Calendar, PlayCircle, MapPin, LogOut 
} from 'lucide-react-native';
import { router } from 'expo-router';
// Make sure this path matches your project structure!
import { getEventFeed } from '../../src/api/event.api'; 

const THEME_ACCENT = '#CCF900'; 

// Helper to add opacity to Hex colors
const getRgba = (hex: string, opacity: number) => {
    if(!hex) return `rgba(255, 255, 255, ${opacity})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const SectionHeader = ({ title, icon: Icon, color = "white" }: any) => (
  <View className="flex-row items-center justify-between px-6 mb-5 mt-2">
    <View className="flex-row items-center gap-3">
      {Icon && <Icon color={color} size={20} />}
      <Text className="text-white text-lg font-black tracking-wider uppercase">
        {title}
      </Text>
    </View>
  </View>
);

export default function HomeScreen() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // 🚧 TEMPORARY: Simulated User State
  // In the next step, we will fetch the REAL logged-in user here.
  // For now, this tests if the "Interests Sorting" works.
  const [user, setUser] = useState({
    name: "Amisha",
    // Matches: Quant, RAID, Inside, PSOC, Designerds, Respawn
    interests: [1, 3, 4, 6, 11, 15] 
  });
  // ---------------------------------------------------------

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const data = await getEventFeed();
      // The backend now returns data with 'clubName' and 'category' populated!
      setEvents(data);
    } catch (err) {
      console.log("Failed to load feed", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Sorting Logic (Plan PP3) ---
  const sortEventsByInterest = (eventsList: any[]) => {
    return [...eventsList].sort((a, b) => {
      const aInterested = user.interests.includes(a.clubId);
      const bInterested = user.interests.includes(b.clubId);
      // If A is interesting and B is not, A goes first (-1)
      if (aInterested && !bInterested) return -1;
      // If B is interesting and A is not, B goes first (1)
      if (!aInterested && bInterested) return 1;
      return 0;
    });
  };

  const liveEvents = useMemo(() => 
    sortEventsByInterest(events.filter((e: any) => e.badge === 'LIVE')), 
  [user.interests, events]);

  const upcomingEvents = useMemo(() => 
    sortEventsByInterest(events.filter((e: any) => e.badge === 'UPCOMING')), 
  [user.interests, events]);

  if (loading) {
    return (
      <View className="flex-1 bg-[#050505] justify-center items-center">
        <ActivityIndicator size="large" color={THEME_ACCENT} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#050505]">
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <SafeAreaView className="flex-1 pt-2">
        
        {/* Header */}
        <View className="px-6 pt-4 pb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-neutral-500 font-bold text-xs tracking-[3px] uppercase mb-1">
              Welcome Back
            </Text>
            <Text className="text-white text-3xl font-black tracking-tight">
              {user.name}.
            </Text>
          </View>
          <View className="flex-row gap-4">
             <TouchableOpacity onPress={() => setShowSidebar(true)} className="w-12 h-12 bg-[#121212] rounded-full items-center justify-center">
              <Menu color="white" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          
          {/* LIVE NOW SECTION */}
          <SectionHeader title="Happening Now" icon={PlayCircle} color={THEME_ACCENT} />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }} className="mb-10">
            {liveEvents.map((event: any) => {
              const isInterested = user.interests.includes(event.clubId);
              // Use event color from DB, fallback to accent
              const cardColor = event.color || THEME_ACCENT; 
              
              return (
                <TouchableOpacity 
                  key={event._id} 
                  activeOpacity={0.8}
                  className="w-[220px] h-[260px] bg-[#121212] rounded-[32px] mr-4 p-5 justify-between overflow-hidden"
                  style={{ 
                    borderWidth: isInterested ? 1 : 0,
                    borderColor: isInterested ? getRgba(cardColor, 0.4) : 'transparent'
                  }}
                >
                  {/* Dynamic Glow Effect */}
                  {isInterested ? (
                     <View className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl" 
                           style={{ backgroundColor: getRgba(cardColor, 0.2) }} />
                  ) : (
                     <View className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                  )}

                  <View className="flex-row justify-between items-start">
                    <View className="px-3 py-1 rounded-full border"
                          style={{ 
                            backgroundColor: getRgba(cardColor, 0.2), 
                            borderColor: getRgba(cardColor, 0.3) 
                          }}>
                      <Text className="text-[10px] font-black tracking-widest" style={{ color: cardColor }}>LIVE</Text>
                    </View>
                    <Text className="text-3xl">{event.icon}</Text>
                  </View>

                  <View>
                     <Text className="text-neutral-500 text-[10px] font-bold tracking-widest mb-1 uppercase">
                      {event.clubName} {/* Fetched via Lookup! */}
                    </Text>
                    <Text className="text-white text-2xl font-black leading-7 mb-2">
                      {event.title}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <MapPin size={12} color="#666" />
                      <Text className="text-neutral-400 text-xs font-bold ml-1">{event.location}</Text>
                    </View>
                  </View>

                  <View className="w-full h-10 rounded-xl items-center justify-center mt-2"
                        style={{ backgroundColor: cardColor }}>
                    <Text className="text-black font-bold text-xs uppercase tracking-wide">Join Now</Text>
                  </View>
                </TouchableOpacity>
            )})}
          </ScrollView>

          {/* UPCOMING SECTION */}
          <SectionHeader title="Coming Up" icon={Calendar} color="#A0A0A0" />
          
          <View className="px-6 mb-10 space-y-3">
            {upcomingEvents.map((event: any) => {
               const isInterested = user.interests.includes(event.clubId);
               const cardColor = event.color || '#fff';
               const dateObj = new Date(event.date);
               const day = dateObj.getDate();
               const month = dateObj.toLocaleString('default', { month: 'short' });

               return (
                <TouchableOpacity 
                  key={event._id}
                  activeOpacity={0.7}
                  className="w-full bg-[#121212] rounded-[24px] p-4 flex-row items-center"
                  style={{ 
                    borderWidth: isInterested ? 1 : 0,
                    borderColor: isInterested ? getRgba(cardColor, 0.3) : 'transparent'
                  }}
                >
                  <View className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                        style={{ backgroundColor: isInterested ? getRgba(cardColor, 0.1) : '#1A1A1A' }}>
                    <Text className="text-[10px] font-black uppercase mb-0.5"
                          style={{ color: isInterested ? cardColor : '#737373' }}>
                      {month}
                    </Text>
                    <Text className="text-white text-xl font-black">{day}</Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold mb-1">{event.title}</Text>
                    <View className="flex-row items-center">
                      <Text className="text-xs font-bold mr-2" style={{ color: cardColor }}>{event.timeDisplay}</Text>
                      <Text className="text-neutral-600 text-xs font-bold">@ {event.location}</Text>
                    </View>
                  </View>
                  
                  <View className="w-10 h-10 rounded-full bg-[#1A1A1A] items-center justify-center border border-neutral-800">
                    <Text className="text-lg">{event.icon}</Text>
                  </View>
                </TouchableOpacity>
            )})}
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Sidebar (Log Out) */}
      <Modal visible={showSidebar} animationType="fade" transparent={true} onRequestClose={() => setShowSidebar(false)}>
        <View className="flex-1 bg-black/90 flex-row">
          <View className="w-[80%] bg-[#0A0A0A] h-full pt-20 px-8 border-r border-neutral-900">
             <Text className="text-white text-3xl font-black mb-10">Menu</Text>
             <TouchableOpacity onPress={() => router.replace('/')} className="flex-row items-center">
               <LogOut color="#EF4444" size={24} />
               <Text className="text-white text-lg font-bold ml-4">Log Out</Text>
             </TouchableOpacity>
          </View>
          <TouchableOpacity className="flex-1" onPress={() => setShowSidebar(false)} />
        </View>
      </Modal>

    </View>
  );
}