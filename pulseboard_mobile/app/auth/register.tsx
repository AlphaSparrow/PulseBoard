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

// --- Theme Constants ---
const LN_VOLT = '#CCF900'; 

// --- Load the Image ---
const BG_IMAGE = require('../../assets/disc.jpg'); 

export default function RegisterScreen() {
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

  const handleRegister = async () => {
    // 1. Check for empty fields
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'All fields are required!');
      return;
    }

    // 2. Domain Validation
    if (!email.endsWith('@iitj.ac.in')) {
      Alert.alert('Restricted Access', 'Only emails ending in @iitj.ac.in are allowed.');
      return;
    }

    // 3. Length Validation
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    // 4. Match Validation
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({ name, email, password });
      
      Alert.alert('Success', 'Account created successfully');
      // Redirect to login after successful registration
      router.push('/auth/login');
    } catch (err: any) {
      const status = err?.response?.status;
      const errorMsg = err?.response?.data?.message || '';

      if (status === 409 || errorMsg.toLowerCase().includes('already exists')) {
        Alert.alert(
          'Account Exists',
          'This email is already registered.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Login Instead', 
              onPress: () => router.push('/auth/login') 
            }
          ]
        );
      } else {
        Alert.alert('Registration Error', errorMsg || 'Signup Failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#050505]">
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      {/* LAYER 1: The Image (Lion) */}
      <ImageBackground 
        source={BG_IMAGE} 
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ opacity: 0.35 }} 
      >
        
        {/* LAYER 2: The Gradient Mask */}
        <LinearGradient
            colors={['transparent', 'rgba(5, 5, 5, 0.8)', '#050505']}
            locations={[0, 0.4, 0.9]}
            className="absolute w-full h-full"
        />

        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 px-6"
          >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              
              {/* --- Header Section --- */}
              <View className="mt-4 mb-8">
                <TouchableOpacity 
                  onPress={() => router.back()} 
                  className="w-12 h-12 bg-[#121212]/80 border border-neutral-800 rounded-full justify-center items-center mb-6"
                >
                  <ChevronLeft color="white" size={24} />
                </TouchableOpacity>

                <View>
                  <View className="flex-row items-center space-x-2 mb-2">
                    <View className="w-2 h-2 bg-[#CCF900] rounded-full animate-pulse" />
                    <Text className="text-[#CCF900] font-mono text-[10px] tracking-[3px] uppercase">
                      New Entry
                    </Text>
                  </View>

                  <Text className="text-white text-5xl font-black italic tracking-tighter uppercase leading-[0.9] mb-4">
                    Create<Text className="text-[#CCF900]">.</Text>{"\n"}Account
                  </Text>
                  
                  <Text className="text-neutral-400 text-sm font-medium leading-5 max-w-[90%]">
                    Join the PulseBoard network. Exclusive to IIT Jodhpur students.
                  </Text>
                </View>
              </View>

              {/* --- Form Section --- */}
              <View className="space-y-5">
                
                {/* Name Input */}
                <View>
                  <Text className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">
                    Full Name
                  </Text>
                  <View 
                    className={`h-16 bg-[#121212]/90 rounded-xl border flex-row items-center px-4 ${
                      focusedInput === 'name' ? 'border-[#CCF900]' : 'border-neutral-800'
                    }`}
                  >
                    <User color={focusedInput === 'name' ? LN_VOLT : '#555'} size={20} className="mr-3" />
                    <TextInput
                      className="flex-1 text-base text-white font-bold h-full"
                      placeholder="John Doe"
                      placeholderTextColor="#444"
                      value={name}
                      onChangeText={setName}
                      selectionColor={LN_VOLT}
                      onFocus={() => setFocusedInput('name')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View>
                  <Text className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">
                    Institute Email
                  </Text>
                  <View 
                    className={`h-16 bg-[#121212]/90 rounded-xl border flex-row items-center px-4 ${
                      focusedInput === 'email' ? 'border-[#CCF900]' : 'border-neutral-800'
                    }`}
                  >
                    <Mail color={focusedInput === 'email' ? LN_VOLT : '#555'} size={20} className="mr-3" />
                    <TextInput
                      className="flex-1 text-base text-white font-bold h-full"
                      placeholder="student@iitj.ac.in"
                      placeholderTextColor="#444"
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

                {/* Password Input */}
                <View>
                  <Text className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">
                    Set Password
                  </Text>
                  <View 
                    className={`h-16 bg-[#121212]/90 rounded-xl border flex-row items-center px-4 ${
                      focusedInput === 'password' ? 'border-[#CCF900]' : 'border-neutral-800'
                    }`}
                  >
                    <Lock color={focusedInput === 'password' ? LN_VOLT : '#555'} size={20} className="mr-3" />
                    <TextInput
                      className="flex-1 text-base text-white font-bold h-full"
                      placeholder="Min 8 chars"
                      placeholderTextColor="#444"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      selectionColor={LN_VOLT}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                      {showPassword ? <EyeOff color="#555" size={20} /> : <Eye color="#555" size={20} />}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View>
                  <Text className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">
                    Confirm Password
                  </Text>
                  <View 
                    className={`h-16 bg-[#121212]/90 rounded-xl border flex-row items-center px-4 ${
                      focusedInput === 'confirm' ? 'border-[#CCF900]' : 'border-neutral-800'
                    }`}
                  >
                    <Lock color={focusedInput === 'confirm' ? LN_VOLT : '#555'} size={20} className="mr-3" />
                    <TextInput
                      className="flex-1 text-base text-white font-bold h-full"
                      placeholder="Repeat Password"
                      placeholderTextColor="#444"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      selectionColor={LN_VOLT}
                      onFocus={() => setFocusedInput('confirm')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-2">
                      {showConfirmPassword ? <EyeOff color="#555" size={20} /> : <Eye color="#555" size={20} />}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Register Button */}
                <TouchableOpacity
                  className={`h-16 bg-[#CCF900] justify-center items-center mt-6 group ${loading ? 'opacity-70' : ''}`}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.9}
                  style={{ transform: [{ skewX: '-12deg' }], borderRadius: 4 }}
                >
                  {loading ? (
                    <View style={{ transform: [{ skewX: '12deg' }] }}>
                      <ActivityIndicator color="black" />
                    </View>
                  ) : (
                    <View className="flex-row items-center" style={{ transform: [{ skewX: '12deg' }] }}>
                      <Text className="text-black text-lg font-black uppercase tracking-widest mr-2">
                        REGISTER SYSTEM
                      </Text>
                      <Zap color="black" size={20} fill="black" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Footer */}
                <View className="py-4 items-center">
                  <View className="flex-row items-center">
                    <Text className="text-neutral-400 text-xs font-medium mr-2">
                      Already have an account?
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/auth/login')}>
                      <Text className="text-white font-black text-xs uppercase tracking-wider border-b border-[#CCF900]">
                        LOGIN
                      </Text>
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