import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  StatusBar, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { loginUser, googleLoginUser } from '../../src/services/auth.service';

// 1. Initialize WebBrowser (Required for the popup to close correctly)
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. GOOGLE AUTH SETUP (Expo Docs Standard)
  const [request, response, promptAsync] = Google.useAuthRequest({
    // Use the SAME Web Client ID for all three to satisfy the library on Expo Go~
    webClientId: '30701888812-1csksgh0cd481rblpbo8okbi2u8kt779.apps.googleusercontent.com',
    androidClientId: '30701888812-1csksgh0cd481rblpbo8okbi2u8kt779.apps.googleusercontent.com',
    iosClientId: '30701888812-1csksgh0cd481rblpbo8okbi2u8kt779.apps.googleusercontent.com',
    
    // The "Bridge" Link
    // Matches: https://auth.expo.io/@<YOUR_USERNAME>/<YOUR_SCHEME>
    redirectUri: 'https://auth.expo.io/@krishthevaelrion/pulseboard_mobile',
    
    scopes: ['profile', 'email'],
    responseType: 'code', // We need the 'code' to send to the backend
  });

  // 3. Handle the Google Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      if (code) {
        handleGoogleBackendSync(code);
      }
    } else if (response?.type === 'error') {
      Alert.alert('Authentication Error', 'Could not connect to Google.');
    }
  }, [response]);

  const handleGoogleBackendSync = async (code: string) => {
    setLoading(true);
    try {
      console.log("Sending Google Code to Backend:", code);
      // Calls your existing backend service
      await googleLoginUser(code);
      
      // Navigate to Home on success
      router.replace('/tabs/home');
    } catch (error: any) {
      console.error("Backend Sync Error:", error);
      Alert.alert('Login Failed', 'Could not verify account with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginUser({ email, password });
      router.replace('/tabs/home');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Login failed.';
      Alert.alert('Login Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="h-[25vh] bg-black justify-center items-center border-b-2 border-cyber-green/30">
        <SafeAreaView className="absolute top-5 left-5">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-cyber-green text-base font-bold">← BACK</Text>
          </TouchableOpacity>
        </SafeAreaView>

        <View className="items-center">
          <Text className="text-cyber-green text-[34px] font-black tracking-wide">
            LOGIN
          </Text>
          <Text className="text-cyber-cyan text-sm mt-2 tracking-widest">
            ACCESS YOUR ACCOUNT
          </Text>
        </View>
      </View>

      <View className="flex-1 px-8 pt-8">
        
        {/* --- GOOGLE BUTTON --- */}
        <TouchableOpacity 
          className={`bg-white h-[54px] rounded-full flex-row justify-center items-center shadow-sm border border-gray-300 mb-8 ${!request ? 'opacity-50' : ''}`}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          {/* Visual G icon */}
          <Text className="text-red-500 font-bold text-xl mr-3">G</Text>
          <Text className="text-gray-600 text-base font-bold font-sans">
            Connect with Google
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-[1px] bg-cyber-green/30" />
          <Text className="mx-4 text-gray-500 text-xs font-bold">OR LOGIN WITH EMAIL</Text>
          <View className="flex-1 h-[1px] bg-cyber-green/30" />
        </View>
        
        {/* Email */}
        <View className="mb-6">
          <Text className="text-[12px] text-cyber-cyan mb-2 font-bold tracking-widest">
            EMAIL ADDRESS
          </Text>
          <TextInput
            className="h-[54px] bg-cyber-green/5 border border-cyber-green/30 rounded-xl px-5 text-base text-white"
            placeholder="example@mail.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password */}
        <View className="mb-8">
          <Text className="text-[12px] text-cyber-cyan mb-2 font-bold tracking-widest">
            PASSWORD
          </Text>
          <TextInput
            className="h-[54px] bg-cyber-green/5 border border-cyber-green/30 rounded-xl px-5 text-base text-white"
            placeholder="••••••••"
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          className={`bg-cyber-green h-14 rounded-full justify-center items-center mt-2 ${loading ? 'opacity-70' : ''}`}
          onPress={handleLocalLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text className="text-black text-base font-black tracking-widest">
              LOGIN
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text className="text-center mt-6 text-neutral-300 text-sm">
            Don't have an account?{' '}
            <Text className="text-cyber-green font-bold">REGISTER</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}