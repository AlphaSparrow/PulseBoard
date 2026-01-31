import React from 'react';
import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Users, User } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// --- THEME CONSTANTS ---
const THEME = {
  ACCENT: '#CCF900',      // Volt Yellow
  BG: '#09090B',          // Deep Matte Black
  BORDER: 'rgba(255, 255, 255, 0.1)', // Subtle Glass Edge
  INACTIVE: '#52525B',    // Zinc 600
};

export default function TabLayout() {
  // Define standard responsive sizes
  const iconSize = hp('3%'); // Scales icon size relative to screen height
  const fontSize = hp('1.2%');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        
        // --- TAB BAR STYLING ---
        tabBarStyle: {
          backgroundColor: THEME.BG,
          borderTopColor: THEME.BORDER,
          borderTopWidth: 1,
          // Use hp for height so it scales. 
          // iOS needs more height (approx 10-11%) to clear the home indicator.
          // Android is fine with less (approx 8%).
          height: Platform.OS === 'ios' ? hp('11%') : hp('8%'), 
          paddingBottom: Platform.OS === 'ios' ? hp('3.5%') : hp('1%'),
          paddingTop: hp('1%'),
          elevation: 0, 
        },
        
        // --- TEXT STYLING ---
        tabBarActiveTintColor: THEME.ACCENT,
        tabBarInactiveTintColor: THEME.INACTIVE,
        tabBarLabelStyle: {
          fontSize: fontSize,
          fontWeight: '700',
          letterSpacing: 1,
          // Use responsive margin to pull text closer to icon consistently
          marginTop: -hp('0.5%'), 
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color }) => (
            <Home color={color} size={iconSize} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'CLUBS',
          tabBarIcon: ({ color }) => (
            <Users color={color} size={iconSize} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color }) => (
            <User color={color} size={iconSize} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}