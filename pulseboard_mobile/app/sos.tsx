import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet, Linking, Platform } from 'react-native';
import { ChevronLeft, Phone, Shield, HeartPulse, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react-native';
import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../src/context/ThemeContext';

// Theme Constants
const THEME_BG_DARK = '#050505';
const THEME_BG_LIGHT = '#F5F5F7';
const THEME_CARD_DARK = '#121212';
const THEME_CARD_LIGHT = '#FFFFFF';
const THEME_ACCENT = '#F87171'; // Red for SOS
const THEME_ACCENT_ALT = '#EF4444'; 
const THEME_TEXT_SEC = '#737373';
const THEME_BORDER_DARK = '#1A1A1A';
const THEME_BORDER_LIGHT = '#E5E5E5';

export default function SOSScreen() {
  const { isDark } = useTheme();
  
  const colors = {
    bg: isDark ? THEME_BG_DARK : THEME_BG_LIGHT,
    card: isDark ? THEME_CARD_DARK : THEME_CARD_LIGHT,
    text: isDark ? 'white' : 'black',
    border: isDark ? THEME_BORDER_DARK : THEME_BORDER_LIGHT,
  };

  const handleCall = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const ContactCard = ({ title, subTitle, number, icon: Icon, isEmergency = false }: any) => (
    <TouchableOpacity 
      style={[
        styles.contactCard, 
        { backgroundColor: colors.card, borderColor: colors.border },
        isEmergency && styles.emergencyCard
      ]}
      onPress={() => handleCall(number)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: isDark ? '#050505' : '#F5F5F7', borderColor: colors.border },
          isEmergency && styles.emergencyIconContainer
        ]}>
          <Icon color={isEmergency ? 'white' : THEME_ACCENT} size={20} strokeWidth={2.5} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }, isEmergency && styles.emergencyText]}>{title}</Text>
          {subTitle && <Text style={styles.cardSubTitle}>{subTitle}</Text>}
          <Text style={styles.cardNumber}>{number}</Text>
        </View>
      </View>
      <View style={[styles.callIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
         <Phone color={isEmergency ? (isDark ? 'white' : 'red') : THEME_TEXT_SEC} size={18} fill={isEmergency ? (isDark ? 'white' : 'red') : 'transparent'} />
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, icon: Icon }: any) => (
    <View style={styles.sectionHeader}>
      {Icon && <Icon color={THEME_ACCENT} size={16} style={{ marginRight: 8 }} />}
      <Text style={[styles.sectionTitle, { color: isDark ? '#D1D5DB' : '#4B5563' }]}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar hidden={true} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft color={colors.text} size={20} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>S.O.S PROTOCOL</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.alertBanner}>
          <AlertTriangle color="black" size={20} style={{ marginRight: 12 }} />
          <Text style={styles.alertText}>IIT JODHPUR EMERGENCY DIRECTORY</Text>
        </View>

        {/* Medical & Health */}
        <SectionHeader title="MEDICAL & HEALTH SERVICES" icon={HeartPulse} />
        <ContactCard 
          title="24/7 Ambulance (ACLS/BLS)" 
          subTitle="Primary Health Center (On-Campus)"
          number="0291-280 1190" 
          icon={HeartPulse} 
          isEmergency={true} 
        />
        <ContactCard 
          title="Alternative Ambulance Line" 
          number="0291-280 1178" 
          icon={HeartPulse} 
        />
        <ContactCard 
          title="Pharmacy (AMRIT)" 
          subTitle="24/7 Available at PHC"
          number="0291-280 1183" 
          icon={Sparkles} 
        />

        {/* Security & Safety */}
        <SectionHeader title="CAMPUS SECURITY & HELP DESKS" icon={Shield} />
        <ContactCard 
          title="Main Security Office" 
          number="0291-280 1591" 
          icon={Shield} 
          isEmergency={true} 
        />
        <ContactCard 
          title="Security Help Desk (Gate 1)" 
          number="0291-280 1961" 
          icon={Shield} 
        />
        
        {/* Support Lines */}
        <View style={styles.cardGroup}>
          <View style={{ flex: 1 }}>
            <ContactCard 
              title="Security 01" 
              number="0291-280 1592" 
              icon={Phone} 
            />
          </View>
          <View style={{ flex: 1 }}>
            <ContactCard 
              title="Security 02" 
              number="0291-280 1593" 
              icon={Phone} 
            />
          </View>
        </View>

        {/* Counseling & Wellbeing */}
        <SectionHeader title="WELLBEING & COUNSELING" icon={Sparkles} />
        <View style={[styles.infoBox, { backgroundColor: isDark ? '#0A0A0A' : '#FAFAFA' }]}>
          <Text style={[styles.infoBoxText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>SWC dedicated counseling team for mental health support.</Text>
        </View>
        
        <ContactCard 
          title="Ms. Nabeelah Siddiqui" 
          subTitle="Student Wellbeing Committee"
          number="+91 8770205067" 
          icon={Phone} 
        />
        <ContactCard 
          title="Mr. Sahib Kumar Sunani" 
          number="+91 7073685694" 
          icon={Phone} 
        />
        <ContactCard 
          title="Mr. Sachin Nanda" 
          number="+91 7751885222" 
          icon={Phone} 
        />
        <ContactCard 
          title="Ms. Elizabeth Wilson" 
          number="+91 7877634342" 
          icon={Phone} 
        />

        <View style={styles.footerNote}>
          <Text style={styles.noteText}>
            Note: For internal campus phones, dial the last four digits (extension).
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
  },
  backButton: {
    width: 40, height: 40,
    borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('5%'),
  },
  alertBanner: {
    backgroundColor: THEME_ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: hp('3%'),
  },
  alertText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('1.5%'),
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  contactCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emergencyCard: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44, height: 44,
    borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
  },
  emergencyIconContainer: {
    backgroundColor: THEME_ACCENT,
    borderColor: THEME_ACCENT_ALT,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  emergencyText: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardSubTitle: {
    color: THEME_TEXT_SEC,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardNumber: {
    color: THEME_ACCENT,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },
  callIconContainer: {
    width: 36, height: 36,
    borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  cardGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoBox: {
    padding: 12, borderLeftWidth: 3, borderLeftColor: THEME_ACCENT,
    marginBottom: 16, borderRadius: 8,
  },
  infoBoxText: {
    fontSize: 12, fontWeight: '600',
    lineHeight: 18,
  },
  footerNote: {
    marginTop: hp('3%'),
    alignItems: 'center',
  },
  noteText: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
