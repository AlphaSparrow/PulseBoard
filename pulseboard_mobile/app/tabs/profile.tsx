import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Alert, ActivityIndicator, Platform
} from 'react-native';
import {
  Bell, Calendar, LogOut, ChevronRight, Sparkles
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import UserAvatar from 'react-native-user-avatar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';

// API Imports
import { getUserProfile } from '../../src/api/user.api';

// --- THEME CONSTANTS ---
const THEME_ACCENT = '#CCF900';
const BG_MAIN = '#050505';
const BG_CARD = '#0F0F0F';
const BORDER_COLOR = 'rgba(255,255,255,0.08)';

// --- UTILS ---
const getRgba = (hex: string, opacity: number) => {
  if (!hex) return `rgba(255, 255, 255, ${opacity})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// --- TYPE DEFINITIONS ---
interface UserData {
  _id: string;
  name: string;
  email: string;
}

// --- COMPONENT: Styled Menu Item ---
const ProfileMenuItem = ({ icon: Icon, label, value, color = "#fff", onPress, isDestructive = false }: any) => (
  <TouchableOpacity
    activeOpacity={0.6}
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: hp('1.8%'),
      paddingHorizontal: wp('4%'),
      backgroundColor: BG_CARD,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDestructive ? 'rgba(239, 68, 68, 0.3)' : BORDER_COLOR,
      marginBottom: hp('1.2%')
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        width: wp('11%'), height: wp('11%'),
        borderRadius: 14,
        backgroundColor: isDestructive ? 'rgba(239, 68, 68, 0.1)' : getRgba(color, 0.1),
        alignItems: 'center', justifyContent: 'center',
        marginRight: wp('4%'),
        borderWidth: 1,
        borderColor: isDestructive ? 'rgba(239, 68, 68, 0.2)' : getRgba(color, 0.15)
      }}>
        <Icon color={isDestructive ? '#EF4444' : color} size={hp('2.2%')} strokeWidth={2.5} />
      </View>

      <View>
        <Text style={{
          color: isDestructive ? '#EF4444' : '#E5E5E5',
          fontSize: hp('1.8%'),
          fontWeight: '700',
          letterSpacing: 0.3
        }}>
          {label}
        </Text>
        {value && (
          <Text style={{ color: '#737373', fontSize: hp('1.3%'), fontWeight: '600', marginTop: 2 }}>
            {value}
          </Text>
        )}
      </View>
    </View>
    {!isDestructive && <ChevronRight color="#333" size={hp('2%')} />}
  </TouchableOpacity>
);

// --- COMPONENT: Section Header ---
const SectionHeader = ({ title, icon: Icon }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp('2%'), marginTop: hp('2%') }}>
    {Icon && <Icon color={THEME_ACCENT} size={hp('2%')} style={{ marginRight: wp('2%') }} />}
    <Text style={{
      color: '#737373',
      fontSize: hp('1.4%'),
      fontWeight: '900',
      letterSpacing: 2,
      textTransform: 'uppercase'
    }}>
      {title}
    </Text>
  </View>
);

export default function ProfileScreen() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionSeed] = useState(Math.random().toString(36).substring(7));

  // FIX: Using useFocusEffect to refresh data automatically on navigation
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const [profileRes] = await Promise.all([
            getUserProfile(),
          ]);

          setUser(profileRes);

        } catch (error: any) {
          if (error.response?.status === 401) {
            Alert.alert("Session Expired", "Please login again.");
            await AsyncStorage.removeItem('token');
            router.replace('/login');
          } else {
            console.error("Profile Load Error:", error);
          }
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/');
  };

  const displayName = user?.name || "Guest User";
  const displayEmail = user?.email || "guest@example.com";
  const avatarSeed = `${user?._id || 'guest'}-${sessionSeed}`;
  const displayAvatar = `https://api.dicebear.com/9.x/bottts/png?seed=${avatarSeed}`;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: BG_MAIN, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME_ACCENT} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG_MAIN }}>
      <StatusBar barStyle="light-content" backgroundColor={BG_MAIN} />
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? hp('1%') : 0 }}>

        {/* --- Header --- */}
        <View style={{ paddingHorizontal: wp('7%'), paddingTop: hp('3%'), paddingBottom: hp('2%'), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: '#737373', fontWeight: 'bold', fontSize: hp('1.5%'), letterSpacing: 3, textTransform: 'uppercase', marginBottom: hp('0.5%') }}>
              Account
            </Text>
            <Text style={{ color: 'white', fontSize: hp('4%'), fontWeight: '900', letterSpacing: -1 }}>
              PROFILE
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp('6%'), paddingBottom: hp('5%') }}>

          {/* --- Profile Identity Card --- */}
          <View style={{
            backgroundColor: BG_CARD,
            borderRadius: 32,
            paddingVertical: hp('4%'),
            paddingHorizontal: wp('6%'),
            borderWidth: 1,
            borderColor: BORDER_COLOR,
            marginBottom: hp('4%'),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Avatar with Glow */}
            <View style={{
              padding: 6,
              backgroundColor: 'rgba(204, 249, 0, 0.05)',
              borderRadius: 999,
              borderWidth: 1,
              borderColor: 'rgba(204, 249, 0, 0.2)',
              marginLeft: wp('2%'),
              marginRight: wp('16%')
            }}>
              <UserAvatar
                size={hp('10%')}
                name={displayName}
                src={displayAvatar}
                bgColor="#000"
              />
            </View>

            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp('0.5%') }}>
                <Text style={{ color: 'white', fontSize: hp('2.8%'), fontWeight: '900', marginRight: 8 }}>
                  {displayName}
                </Text>
                <Sparkles color={THEME_ACCENT} size={16} fill={THEME_ACCENT} />
              </View>
              <Text style={{ color: '#A3A3A3', fontSize: hp('1.6%'), fontWeight: '500', marginBottom: hp('1.5%') }}>
                {displayEmail}
              </Text>

              <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <Text style={{ color: THEME_ACCENT, fontSize: hp('1.2%'), fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Student</Text>
              </View>
            </View>
          </View>

          {/* --- Dashboard Actions --- */}
          <SectionHeader title="Dashboard" />

          <ProfileMenuItem
            icon={Bell}
            label="Notifications"
            value="3 New"
            color={THEME_ACCENT}
            onPress={() => { }}
          />
          <ProfileMenuItem
            icon={Calendar}
            label="My Calendar"
            color="#38BDF8"
            onPress={() => { }}
          />

          {/* --- Logout Section --- */}
          <View style={{ marginTop: hp('4%') }}>
            <ProfileMenuItem
              icon={LogOut}
              label="Log Out"
              isDestructive={true}
              onPress={handleLogout}
            />
            <Text style={{ textAlign: 'center', color: '#333', fontSize: hp('1.2%'), fontWeight: 'bold', marginTop: hp('2%'), textTransform: 'uppercase', letterSpacing: 2 }}>
              Version 1.0.4 • PulseBoard
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_BG,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME_BG,
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
    backgroundColor: THEME_CARD,
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
    backgroundColor: THEME_CARD,
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
    backgroundColor: THEME_CARD,
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