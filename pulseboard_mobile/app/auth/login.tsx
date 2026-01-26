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
  ImageBackground
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, ChevronLeft, Mail, Lock, Zap } from 'lucide-react-native';
import { loginUser } from '../../src/services/auth.service';
import { LinearGradient } from 'expo-linear-gradient'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Theme Constants ---
const LN_VOLT = '#CCF900'; 

// --- Load the Image ---
const BG_IMAGE = require('../../assets/roll.jpg'); 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert('Missing Data', 'Please enter both identifier and security key.');
        return;
    }
  
    setLoading(true);
    try {
      // 1. Attempt Login
      const response = await loginUser({ email, password });
      
      // 2. Save Token (CRITICAL for Home Screen to work)
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        router.replace('/tabs/home');
      } else {
        throw new Error("No token received");
      }

    } catch (error: any) {
      console.log("Login Error Full:", error);
      
      // Handle Network Errors specifically
      if (error.message === 'Network Error') {
        Alert.alert(
          'Connection Failed', 
          'Cannot reach the server. \n\n1. Check if backend is running.\n2. Ensure API_URL uses your IP (not localhost).'
        );
      } else {
        const msg = error?.response?.data?.message || 'Access Denied. Check credentials.';
        Alert.alert('System Error', msg);
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
            colors={['transparent', 'rgba(5, 5, 5, 0.6)', '#050505']}
            locations={[0, 0.4, 0.8]}
            className="absolute w-full h-full"
        />

        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 px-6 justify-between"
          >
            {/* --- Header Section --- */}
            <View className="mt-4">
              <TouchableOpacity 
                onPress={() => router.back()} 
                className="w-12 h-12 bg-[#121212]/80 border border-neutral-800 rounded-full justify-center items-center mb-8"
              >
                <ChevronLeft color="white" size={24} />
              </TouchableOpacity>

              <View>
                <View className="flex-row items-center space-x-2 mb-2">
                  <View className="w-2 h-2 bg-[#CCF900] rounded-full animate-pulse" />
                  <Text className="text-[#CCF900] font-mono text-[10px] tracking-[3px] uppercase">
                    Secure Access
                  </Text>
                </View>

                <Text className="text-white text-5xl font-black italic tracking-tighter uppercase leading-[0.9] mb-4">
                  System<Text className="text-[#CCF900]">.</Text>{"\n"}Login
                </Text>
                
                <Text className="text-neutral-400 text-sm font-medium leading-5 max-w-[80%]">
                  Enter your credentials to sync with the campus network.
                </Text>
              </View>
            </View>

            {/* --- Form Section --- */}
            <View className="space-y-6 mt-4">
              
              {/* Email Input */}
              <View>
                <Text className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">
                  Identifier // Email
                </Text>
                <View 
                  className={`h-16 bg-[#121212]/90 rounded-xl border flex-row items-center px-4 ${
                    focusedInput === 'email' ? 'border-[#CCF900]' : 'border-neutral-800'
                  }`}
                >
                  <Mail color={focusedInput === 'email' ? LN_VOLT : '#555'} size={20} className="mr-3" />
                  <TextInput
                    className="flex-1 text-base text-white font-bold h-full"
                    placeholder="user@iitj.ac.in"
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
                  Security Key // Password
                </Text>
                <View 
                  className={`h-16 bg-[#121212]/90 rounded-xl border flex-row items-center px-4 ${
                    focusedInput === 'password' ? 'border-[#CCF900]' : 'border-neutral-800'
                  }`}
                >
                  <Lock color={focusedInput === 'password' ? LN_VOLT : '#555'} size={20} className="mr-3" />
                  <TextInput
                    className="flex-1 text-base text-white font-bold h-full"
                    placeholder="••••••••"
                    placeholderTextColor="#444"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    selectionColor={LN_VOLT}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                    {showPassword ? (
                      <EyeOff color="#555" size={20} />
                    ) : (
                      <Eye color="#555" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity className="items-end mt-2">
                <Text className="text-neutral-400 text-sm font-bold uppercase tracking-wider border-b border-[#CCF900]/50 pb-0.5">
                  Reset Credentials?
                </Text>
              </TouchableOpacity>

              {/* Main Action Button */}
              <TouchableOpacity
                className={`h-16 bg-[#CCF900] justify-center items-center mt-4 group ${loading ? 'opacity-70' : ''}`}
                onPress={handleLogin}
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
                      INITIATE SESSION
                    </Text>
                    <Zap color="black" size={20} fill="black" />
                  </View>
                )}
              </TouchableOpacity>

            </View>

            {/* --- Footer --- */}
            <View className="pb-8 items-center">
               <View className="flex-row items-center">
                  <Text className="text-neutral-400 text-xs font-medium mr-2">
                    New to PulseBoard?
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/auth/register')}>
                    <Text className="text-white font-black text-xs uppercase tracking-wider border-b border-[#CCF900]">
                      Create Account
                    </Text>
                  </TouchableOpacity>
               </View>
            </View>

          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}