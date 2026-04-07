import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, StyleSheet } from 'react-native';
import { Settings, Calendar, LogOut, ChevronRight, Edit2, Share2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import UserAvatar from 'react-native-user-avatar';
import { getUserProfile } from '../../src/api/user.api'; 
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/context/ThemeContext';

// Theme Constants
const THEME_BG_DARK = '#050505';
const THEME_BG_LIGHT = '#F5F5F7';
const THEME_CARD_DARK = '#121212';
const THEME_CARD_LIGHT = '#FFFFFF';
const THEME_ACCENT = '#CCF900';
const THEME_TEXT_SEC = '#737373';

interface UserData {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const colors = {
    bg: isDark ? THEME_BG_DARK : THEME_BG_LIGHT,
    card: isDark ? THEME_CARD_DARK : THEME_CARD_LIGHT,
    text: isDark ? 'white' : '#000000',
    border: isDark ? '#262626' : '#E5E5E5',
    button: isDark ? '#1A1A1A' : '#F0F0F0',
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await getUserProfile();
        setUser(userData);
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          await AsyncStorage.removeItem('token');
          router.replace('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      router.replace('/');
    } catch (e) { console.error(e); }
  };

  const MenuItem = ({ icon: Icon, title, onPress, isDestructive = false }: any) => (
    <TouchableOpacity 
      style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: isDestructive ? 'rgba(239, 68, 68, 0.1)' : (isDark ? '#1A1A1A' : '#F5F5F7') }
        ]}>
           <Icon color={isDestructive ? '#ef4444' : THEME_ACCENT} size={16} strokeWidth={2.5} />
        </View>
        <Text style={[
          styles.menuItemText, 
          { color: isDestructive ? '#ef4444' : colors.text }
        ]}>
          {title}
        </Text>
      </View>
      {!isDestructive && <ChevronRight color={isDark ? "#333" : "#CCC"} size={16} />}
    </TouchableOpacity>
  );

  const displayName = user?.name || "Guest";
  const displayEmail = user?.email || "guest@example.com";
  const avatarSeed = user?.name || "default-seed"; 
  const displayAvatar = `https://api.dicebear.com/9.x/bottts/png?seed=${avatarSeed}`;

  if (loading) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
          <ActivityIndicator size="small" color={THEME_ACCENT} />
        </View>
      );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* This hides the top status bar (battery/wifi icons) */}
      <StatusBar hidden={true} /> 
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Compact Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>PROFILE</Text>
        <TouchableOpacity 
          style={[styles.settingsButton, { backgroundColor: colors.button, borderColor: colors.border }]} 
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
        >
          <Settings color={colors.text} size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* Compact Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.ambientGlow} />

            {/* Smaller Avatar */}
            <LinearGradient
              colors={[THEME_ACCENT, '#8EAD00', THEME_ACCENT]} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradientBorder}
            >
              <View style={[styles.avatarInnerContainer, { backgroundColor: colors.card }]}>
                <UserAvatar 
                  size={hp('8%')} 
                  name={displayName} 
                  src={displayAvatar} 
                  bgColor={colors.bg}
                />
              </View>
            </LinearGradient>

            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
              <Text style={styles.userEmail}>{displayEmail}</Text>
            </View>

            {/* Small Action Buttons */}
            <View style={styles.miniActionRow}>
                <TouchableOpacity style={[styles.miniBtn, { backgroundColor: colors.button, borderColor: colors.border }]}>
                    <Edit2 size={12} color={colors.text} />
                    <Text style={[styles.miniBtnText, { color: colors.text }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.miniBtn, { backgroundColor: colors.button, borderColor: colors.border }]}>
                    <Share2 size={12} color={colors.text} />
                    <Text style={[styles.miniBtnText, { color: colors.text }]}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Preferences */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>GENERAL</Text>
          <MenuItem icon={Calendar} title="My Calendar" onPress={() => router.push('/calendar')} />
        </View>

        {/* Account */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>SYSTEM</Text>
          <MenuItem icon={LogOut} title="Logout" isDestructive={true} onPress={handleLogout} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  settingsButton: {
    padding: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262626',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('5%'),
  },
  
  // Compact Profile Card
  profileCard: {
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 24,
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('5%'),
    marginBottom: hp('3%'),
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(204, 249, 0, 0.04)',
    borderRadius: 50,
    filter: 'blur(30px)',
  },
  avatarGradientBorder: {
    width: hp('9%'),
    height: hp('9%'),
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  avatarInnerContainer: {
    width: hp('8.6%'),
    height: hp('8.6%'),
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    color: THEME_TEXT_SEC,
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Small Action Buttons Row
  miniActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  miniBtnText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },

  // Sections
  sectionContainer: {
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    color: '#525252',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  
  // Compact Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
});