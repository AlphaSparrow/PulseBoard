import React, { useState } from 'react';
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
import { Eye, EyeOff } from 'lucide-react-native'; // Import Icons
import { loginUser } from '../../src/services/auth.service';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for visibility

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await loginUser({ email, password });
      router.replace('/tabs/home');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="h-[30vh] bg-black justify-center items-center border-b-2 border-cyber-green/30">
        <SafeAreaView className="absolute top-5 left-5">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-cyber-green text-base font-bold">
              ← BACK
            </Text>
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

      {/* Form */}
      <View className="flex-1 px-8 pt-10">
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

        {/* Password - Modified with Eye Icon */}
        <View className="mb-8">
          <Text className="text-[12px] text-cyber-cyan mb-2 font-bold tracking-widest">
            PASSWORD
          </Text>
          
          {/* Container acts as the input box now */}
          <View className="h-[54px] bg-cyber-green/5 border border-cyber-green/30 rounded-xl px-5 flex-row items-center">
            <TextInput
              className="flex-1 text-base text-white h-full"
              placeholder="••••••••"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword} // Toggle based on state
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff color="#00ff88" size={20} />
              ) : (
                <Eye color="#00ff88" size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          className={`bg-cyber-green h-14 rounded-full justify-center items-center mt-2 ${loading ? 'opacity-70' : ''}`}
          onPress={handleLogin}
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

        {/* Footer */}
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