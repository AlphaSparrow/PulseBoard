import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, StatusBar } from 'react-native';
import { Search, Filter, Check, Plus } from 'lucide-react-native';

// --- Theme Constants (Matches Home Screen) ---
const THEME_ACCENT = '#CCF900'; // Volt Yellow
const THEME_BLACK = '#050505';
const THEME_CARD = '#121212';

export default function ClubsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // FIX 1: Explicitly type the state as an array of strings
  const [followedClubs, setFollowedClubs] = useState<string[]>([]); 

  // FIX 3: Real Data (IDs 1-15) - Synced with your backend data
  const clubs = [
    { id: 1, name: 'Quant Club', icon: '📈', category: 'Technical', followers: '450', description: 'Algorithmic Trading & Finance' },
    { id: 2, name: 'Devlup Labs', icon: '💻', category: 'Technical', followers: '1.2K', description: 'Open Source Development' },
    { id: 3, name: 'RAID', icon: '🤖', category: 'Technical', followers: '890', description: 'AI & Deep Learning' },
    { id: 4, name: 'Inside', icon: '👾', category: 'Technical', followers: '620', description: 'Game Development Society' },
    { id: 5, name: 'Product Club', icon: '📱', category: 'Technical', followers: '340', description: 'Product Design & Mgmt' },
    { id: 6, name: 'PSOC', icon: '⌨️', category: 'Technical', followers: '1.1K', description: 'Competitive Programming' },
    { id: 7, name: 'TGT', icon: '🎸', category: 'Cultural', followers: '950', description: 'The Groove Theory (Music)' },
    { id: 8, name: 'Shutterbugs', icon: '📸', category: 'Cultural', followers: '780', description: 'Photography Society' },
    { id: 9, name: 'Ateliers', icon: '🎨', category: 'Cultural', followers: '560', description: 'Fine Arts & Crafts' },
    { id: 10, name: 'FrameX', icon: '🎬', category: 'Cultural', followers: '820', description: 'Filmmaking & Editing' },
    { id: 11, name: 'Designerds', icon: '📐', category: 'Cultural', followers: '910', description: 'UI/UX & Graphic Design' },
    { id: 12, name: 'Dramebaaz', icon: '🎭', category: 'Cultural', followers: '850', description: 'Drama & Theatrics' },
    { id: 13, name: 'E-Cell', icon: '💼', category: 'Other', followers: '1.5K', description: 'Entrepreneurship Cell' },
    { id: 14, name: 'Nexus', icon: '💡', category: 'Other', followers: '670', description: 'Innovation & Ideas' },
    { id: 15, name: 'Respawn', icon: '🎮', category: 'Other', followers: '2.1K', description: 'eSports & Gaming' },
  ];

  const categories = ['all', 'Technical', 'Cultural', 'Other'];

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

  // FIX 1 (Part 2): TypeScript requires explicit type here. kept as requested.
  const toggleFollow = (clubName: string) => {
    setFollowedClubs(prev => 
      prev.includes(clubName) 
        ? prev.filter(c => c !== clubName)
        : [...prev, clubName]
    );
  };

  const displayedClubs = filterClubs();

  return (
    <SafeAreaView className="flex-1 bg-[#050505]">
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      
      {/* Header */}
      <View className="px-6 py-4">
        <Text className="text-neutral-500 font-bold text-xs tracking-[3px] uppercase mb-1">
          Directory
        </Text>
        <Text className="text-white text-3xl font-black tracking-tight">
          CLUBS.
        </Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-[#1A1A1A] rounded-2xl mx-6 mb-6 px-4 py-1">
        <Search color={THEME_ACCENT} size={20} className="mr-3" />
        <TextInput
          className="flex-1 text-white text-base py-3 font-medium"
          placeholder="Find a club..."
          placeholderTextColor="#555"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {/* Visual decoration only */}
        <View className="h-4 w-[1px] bg-neutral-700 mx-3" />
        <Filter color="#555" size={20} />
      </View>

      {/* Categories Pills */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}>
          {categories.map(category => {
            const isActive = activeCategory === category;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => setActiveCategory(category)}
                className={`px-6 py-2.5 rounded-full mr-3 border ${
                  isActive 
                    ? 'bg-[#CCF900] border-[#CCF900]' 
                    : 'bg-[#121212] border-neutral-800'
                }`}
              >
                <Text className={`text-xs font-bold uppercase tracking-wider ${
                  isActive ? 'text-black' : 'text-neutral-400'
                }`}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Stats Row */}
      <View className="flex-row px-6 mb-6 justify-between">
        <View className="w-[48%] bg-[#121212] rounded-2xl p-4 border border-neutral-900">
           <Text className="text-neutral-500 text-[10px] font-black tracking-widest uppercase mb-1">Total Clubs</Text>
           <Text className="text-white text-2xl font-black">{clubs.length}</Text>
        </View>
        <View className="w-[48%] bg-[#121212] rounded-2xl p-4 border border-neutral-900">
           <Text className="text-[#CCF900] text-[10px] font-black tracking-widest uppercase mb-1">Following</Text>
           <Text className="text-white text-2xl font-black">{followedClubs.length}</Text>
        </View>
      </View>

      {/* Clubs Grid */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        <View className="flex-row flex-wrap justify-between pb-20">
          {displayedClubs.map(club => {
            const isFollowed = followedClubs.includes(club.name);
            return (
              <View 
                key={club.id} 
                className={`w-[48%] bg-[#121212] rounded-[24px] p-5 mb-4 justify-between border ${isFollowed ? 'border-[#CCF900]/50' : 'border-neutral-900'}`}
              >
                <View>
                  <View className="flex-row justify-between items-start mb-4">
                    <Text className="text-4xl">{club.icon}</Text>
                    {isFollowed && (
                      <View className="w-6 h-6 bg-[#CCF900]/20 rounded-full items-center justify-center">
                        <Check size={12} color="#CCF900" strokeWidth={4} />
                      </View>
                    )}
                  </View>
                  
                  <Text className="text-white text-lg font-black leading-6 mb-2">
                    {club.name}
                  </Text>
                  <Text className="text-neutral-500 text-xs leading-4 mb-4" numberOfLines={2}>
                    {club.description}
                  </Text>
                </View>

                <View>
                  <Text className="text-neutral-600 text-[10px] font-bold uppercase tracking-wider mb-3">
                    {club.followers} Followers
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => toggleFollow(club.name)}
                    className={`w-full py-3 rounded-xl flex-row items-center justify-center ${
                      isFollowed 
                        ? 'bg-[#1A1A1A]' 
                        : 'bg-[#CCF900]'
                    }`}
                  >
                    {isFollowed ? (
                      <Text className="text-neutral-400 text-xs font-bold uppercase">Following</Text>
                    ) : (
                      <>
                        <Plus size={14} color="black" strokeWidth={4} style={{ marginRight: 4 }} />
                        <Text className="text-black text-xs font-bold uppercase">Follow</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {displayedClubs.length === 0 && (
          <View className="items-center justify-center py-20 opacity-50">
            <Text className="text-6xl mb-4 grayscale">🔭</Text>
            <Text className="text-neutral-400 text-base font-bold">No signals found.</Text>
            <Text className="text-neutral-600 text-sm mt-2">Adjust your filters.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}