import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  StatusBar, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, ChevronLeft, User, Mail, Lock, Zap } from 'lucide-react-native';
import { registerUser } from '../../src/services/auth.service';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../src/context/ThemeContext';

// --- Theme Constants ---
const LN_VOLT = '#CCF900'; 

// --- Load the Image ---
const BG_IMAGE = require('../../assets/disc.jpg'); 

export default function RegisterScreen() {
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Focus State
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const colors = {
    bg: isDark ? '#050505' : '#FFFFFF',
    card: isDark ? '#121212' : '#F5F5F7',
    text: isDark ? 'white' : 'black',
    border: isDark ? '#262626' : '#E5E5E5',
    subtext: isDark ? '#A1A1A1' : '#666666',
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'All fields are required!');
      return;
    }

    if (!email.endsWith('@iitj.ac.in')) {
      Alert.alert('Restricted Access', 'Only emails ending in @iitj.ac.in are allowed.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({ name, email, password });
      Alert.alert('OTP Sent! 📧', 'A verification code has been sent to your email.');
      router.push({ pathname: '/auth/verify-otp', params: { email } });
    } catch (err: any) {
      const status = err?.response?.status;
      const errorMsg = err?.response?.data?.message || '';

      if (status === 409 || errorMsg.toLowerCase().includes('already exists')) {
        Alert.alert('Account Exists', 'This email is already registered.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login Instead', onPress: () => router.push('/auth/login') }
        ]);
      } else {
        Alert.alert('Registration Error', errorMsg || 'Signup Failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ImageBackground 
        source={BG_IMAGE} 
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ opacity: isDark ? 0.35 : 0.08 }} 
      >
        <LinearGradient
            colors={isDark 
                ? ['transparent', 'rgba(5, 5, 5, 0.8)', '#050505'] 
                : ['transparent', 'rgba(255, 255, 255, 0.6)', '#FFFFFF']}
            locations={[0, 0.4, 0.9]}
            className="absolute w-full h-full"
        />

        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ paddingHorizontal: wp('6%') }}
          >
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingBottom: hp('5%') }}
            >
              <View style={{ marginTop: hp('2%'), marginBottom: hp('2%') }}>
                <TouchableOpacity 
                  onPress={() => router.back()} 
                  style={{ width: wp('12%'), height: wp('12%'), marginBottom: hp('2%'), backgroundColor: colors.card, borderColor: colors.border }}
                  className="border rounded-full justify-center items-center"
                >
                  <ChevronLeft color={colors.text} size={wp('6%')} />
                </TouchableOpacity>

                <View>
                  <View className="flex-row items-center space-x-2 mb-2">
                    <View className="rounded-full animate-pulse" style={{ width: wp('2%'), height: wp('2%'), backgroundColor: '#CCF900' }} />
                    <Text className="text-[#CCF900] font-mono uppercase" style={{ fontSize: hp('1.4%'), letterSpacing: 3 }}>New Entry</Text>
                  </View>

                  <Text className="font-black italic tracking-tighter uppercase" style={{ color: colors.text, fontSize: hp('5%'), lineHeight: hp('5.5%'), marginBottom: hp('1.5%') }}>
                    Create<Text className="text-[#CCF900]">.</Text>{"\n"}Account
                  </Text>
                  
                  <Text className="font-medium" style={{ color: colors.subtext, fontSize: hp('1.8%'), lineHeight: hp('2.4%'), maxWidth: wp('90%') }}>
                    Join the PulseBoard network. Exclusive to IIT Jodhpur students.
                  </Text>
                </View>
              </View>

              <View style={{ gap: hp('2%') }}>
                <View>
                  <Text className="text-neutral-500 font-bold uppercase" style={{ fontSize: hp('1.2%'), letterSpacing: 2, marginBottom: hp('0.8%'), marginLeft: wp('1%') }}>
                    Full Name
                  </Text>
                  <View style={{ height: hp('6.5%'), backgroundColor: colors.card, borderColor: focusedInput === 'name' ? LN_VOLT : colors.border }} className="rounded-xl border flex-row items-center px-4">
                    <User color={focusedInput === 'name' ? LN_VOLT : '#888'} size={hp('2.5%')} style={{ marginRight: wp('3%') }} />
                    <TextInput
                      className="flex-1 font-bold h-full"
                      style={{ color: colors.text, fontSize: hp('1.8%') }}
                      placeholder="John Doe"
                      placeholderTextColor="#888"
                      value={name}
                      onChangeText={setName}
                      selectionColor={LN_VOLT}
                      onFocus={() => setFocusedInput('name')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-neutral-500 font-bold uppercase" style={{ fontSize: hp('1.2%'), letterSpacing: 2, marginBottom: hp('0.8%'), marginLeft: wp('1%') }}>
                    Institute Email
                  </Text>
                  <View style={{ height: hp('6.5%'), backgroundColor: colors.card, borderColor: focusedInput === 'email' ? LN_VOLT : colors.border }} className="rounded-xl border flex-row items-center px-4">
                    <Mail color={focusedInput === 'email' ? LN_VOLT : '#888'} size={hp('2.5%')} style={{ marginRight: wp('3%') }} />
                    <TextInput
                      className="flex-1 font-bold h-full"
                      style={{ color: colors.text, fontSize: hp('1.8%') }}
                      placeholder="student@iitj.ac.in"
                      placeholderTextColor="#888"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      selectionColor={LN_VOLT}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-neutral-500 font-bold uppercase" style={{ fontSize: hp('1.2%'), letterSpacing: 2, marginBottom: hp('0.8%'), marginLeft: wp('1%') }}>
                    Set Password
                  </Text>
                  <View style={{ height: hp('6.5%'), backgroundColor: colors.card, borderColor: focusedInput === 'password' ? LN_VOLT : colors.border }} className="rounded-xl border flex-row items-center px-4">
                    <Lock color={focusedInput === 'password' ? LN_VOLT : '#888'} size={hp('2.5%')} style={{ marginRight: wp('3%') }} />
                    <TextInput
                      className="flex-1 font-bold h-full"
                      style={{ color: colors.text, fontSize: hp('1.8%') }}
                      placeholder="Min 8 chars"
                      placeholderTextColor="#888"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      selectionColor={LN_VOLT}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: wp('2%') }}>
                      <Eye color="#888" size={hp('2.5%')} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View>
                  <Text className="text-neutral-500 font-bold uppercase" style={{ fontSize: hp('1.2%'), letterSpacing: 2, marginBottom: hp('0.8%'), marginLeft: wp('1%') }}>
                    Confirm Password
                  </Text>
                  <View style={{ height: hp('6.5%'), backgroundColor: colors.card, borderColor: focusedInput === 'confirm' ? LN_VOLT : colors.border }} className="rounded-xl border flex-row items-center px-4">
                    <Lock color={focusedInput === 'confirm' ? LN_VOLT : '#888'} size={hp('2.5%')} style={{ marginRight: wp('3%') }} />
                    <TextInput
                      className="flex-1 font-bold h-full"
                      style={{ color: colors.text, fontSize: hp('1.8%') }}
                      placeholder="Repeat Password"
                      placeholderTextColor="#888"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      selectionColor={LN_VOLT}
                      onFocus={() => setFocusedInput('confirm')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: wp('2%') }}>
                      <Eye color="#888" size={hp('2.5%')} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  className={`bg-[#CCF900] justify-center items-center group ${loading ? 'opacity-70' : ''}`}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.9}
                  style={{ height: hp('6.5%'), marginTop: hp('2%'), transform: [{ skewX: '-12deg' }], borderRadius: 4 }}
                >
                  {loading ? (
                    <View style={{ transform: [{ skewX: '12deg' }] }}>
                      <ActivityIndicator color="black" />
                    </View>
                  ) : (
                    <View className="flex-row items-center" style={{ transform: [{ skewX: '12deg' }] }}>
                      <Text className="text-black font-black uppercase mr-2" style={{ fontSize: hp('2%'), letterSpacing: 2 }}>REGISTER SYSTEM</Text>
                      <Zap color="black" size={hp('2.5%')} fill="black" />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={{ paddingVertical: hp('2%'), alignItems: 'center' }}>
                  <View className="flex-row items-center">
                    <Text className="font-medium mr-2" style={{ color: colors.subtext, fontSize: hp('1.6%') }}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/auth/login')}>
                      <Text className="font-black uppercase border-b border-[#CCF900]" style={{ color: colors.text, fontSize: hp('1.6%'), letterSpacing: 1 }}>LOGIN</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}