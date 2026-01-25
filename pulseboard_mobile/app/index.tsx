import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Target } from 'lucide-react-native';

// --- Theme Constants ---
const LN_VOLT = '#CCF900'; 
const LN_BLACK = '#050505';

export default function WelcomeScreen() {
  return (
    // OUTER FRAME: Pitch Black Background
    <View className="flex-1 bg-black justify-center items-center p-2">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* INNER FRAME: The "Card" with the Border Design */}
      <View className="w-full h-full bg-[#050505] rounded-[20px] border border-neutral-800 relative overflow-hidden">
        
        {/* --- DECORATION: Corner Accents (The "HUD" Look) --- */}
        {/* Top Left */}
        <View className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-[#CCF900]" />
        {/* Top Right */}
        <View className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-[#CCF900]" />
        {/* Bottom Left */}
        <View className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-[#CCF900]" />
        {/* Bottom Right */}
        <View className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-[#CCF900]" />

        {/* --- BACKGROUND ACCENT: Subtle Grid Line --- */}
        <View className="absolute top-[30%] w-full h-[1px] bg-[#CCF900]/10" />
        <View className="absolute left-[20%] h-full w-[1px] bg-[#CCF900]/5" />

        <SafeAreaView className="flex-1 justify-between py-6">
          
          {/* --- TOP: Telemetry Header --- */}
          <View className="px-8 pt-4">
            {/* Header Status Line (Version Removed) */}
            <View className="flex-row justify-start items-center mb-16 opacity-60">
              <View className="flex-row items-center gap-2">
                <Target size={14} color={LN_VOLT} />
                <Text className="text-neutral-400 font-mono text-[10px] tracking-[2px]">SYS.READY</Text>
              </View>
            </View>

            {/* LOGO AREA */}
            <View className="items-center relative">
               {/* Glitch Shadow */}
               <Text className="text-[130px] font-black italic tracking-tighter text-[#CCF900]/10 absolute top-4 left-4 -z-10" 
                     style={{ transform: [{ skewX: '-12deg' }] }}>
                 PB
               </Text>
               {/* Main Logo */}
               <Text className="text-[130px] font-black italic tracking-tighter text-white" 
                     style={{ transform: [{ skewX: '-12deg' }] }}>
                 PB
               </Text>
               
               {/* Speed Strip */}
               <View className="mt-2 bg-[#CCF900] px-4 py-1 -skew-x-12">
                 <Text className="text-black font-black text-sm tracking-[6px] skew-x-12">
                   PULSEBOARD
                 </Text>
               </View>
            </View>
          </View>

          {/* --- MIDDLE: Impact Text --- */}
          <View className="px-10">
             <Text className="text-neutral-600 text-sm font-bold tracking-widest mb-2 uppercase">
               Mission Status
             </Text>
             <Text className="text-white text-5xl font-black italic uppercase leading-[0.9]"
                   style={{ transform: [{ skewX: '-6deg' }] }}>
               ALL IN.
               <Text className="text-[#CCF900]">{"\n"}ALL OUT.</Text>
             </Text>
          </View>

          {/* --- BOTTOM: Controls --- */}
          <View className="px-8 pb-8 gap-5">
            
            {/* Primary Button: Sign Up */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/auth/register')}
              className="h-16 bg-[#CCF900] justify-center items-center flex-row group border-b-4 border-[#9dbf00]"
              style={{ transform: [{ skewX: '-12deg' }], borderRadius: 4 }}
            >
              <View className="skew-x-12 flex-row items-center">
                 <Text className="text-black font-black text-lg tracking-widest mr-3 uppercase">
                   Sign Up
                 </Text>
                 <ArrowRight color="black" size={24} strokeWidth={3} />
              </View>
            </TouchableOpacity>

            {/* Secondary Button: Login */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/auth/login')}
              className="h-16 justify-center items-center flex-row border border-neutral-700 bg-neutral-900/50"
              style={{ transform: [{ skewX: '-12deg' }], borderRadius: 4 }}
            >
              <View className="skew-x-12 flex-row items-center">
                <Text className="text-neutral-300 font-bold text-base tracking-[3px] uppercase">
                  Login / Access
                </Text>
              </View>
            </TouchableOpacity>

            <View className="items-center mt-2">
              <Text className="text-neutral-700 text-[9px] font-mono">
                SECURE CONNECTION ESTABLISHED
              </Text>
            </View>

          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}