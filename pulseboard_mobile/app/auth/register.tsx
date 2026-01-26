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
import { Eye, EyeOff } from 'lucide-react-native';
import { registerUser } from '../../src/services/auth.service';


export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // Derived state for password validation visibility
  const isPasswordShort = password.length > 0 && password.length < 8;

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
      // YOUR PATH: Redirect to login after successful registration
      router.push('/auth/interests');
    } catch (err: any) {
      // --- NEW: Handle Duplicate Email Logic ---
      const status = err?.response?.status;
      const errorMsg = err?.response?.data?.message || '';

      // If Backend returns 409 (Conflict) or message says "already exists"
      if (status === 409 || errorMsg.toLowerCase().includes('already exists')) {
        Alert.alert(
          'Account Exists',
          'This email is already registered with us.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Login Instead', 
              onPress: () => router.push('/auth/login') // Redirects user to login
            }
          ]
        );
      } else {
        // Generic Error
        Alert.alert('Registration Error', errorMsg || 'Signup Failed. Please try again.');
      }
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
            <Text className="text-cyber-green text-base font-bold">
              ← BACK
            </Text>
          </TouchableOpacity>
        </SafeAreaView>

        <View className="items-center mt-4">
          <Text className="text-cyber-green text-[34px] font-black tracking-wide">
            REGISTER
          </Text>
          <Text className="text-cyber-cyan text-sm mt-2 tracking-widest">
            IITJ STUDENT PORTAL
          </Text>
        </View>
      </View>

      {/* Form */}
      <View className="flex-1 px-8 pt-8">
        {/* Name */}
        <View className="mb-5">
          <Text className="text-[12px] text-cyber-cyan mb-2 font-bold tracking-widest">
            FULL NAME
          </Text>
          <TextInput
            className="h-[50px] bg-cyber-green/5 border border-cyber-green/30 rounded-xl px-5 text-base text-white"
            placeholder="John Doe"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <View className="mb-5">
          <Text className="text-[12px] text-cyber-cyan mb-2 font-bold tracking-widest">
            INSTITUTE EMAIL
          </Text>
          <TextInput
            className="h-[50px] bg-cyber-green/5 border border-cyber-green/30 rounded-xl px-5 text-base text-white"
            placeholder="student@iitj.ac.in"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password */}
        <View className="mb-2">
          <Text className="text-[12px] text-cyber-cyan mb-2 font-bold tracking-widest">
            PASSWORD
          </Text>
          <View className="h-[50px] bg-cyber-green/5 border border-cyber-green/30 rounded-xl px-5 flex-row items-center">
            <TextInput
              className="flex-1 text-base text-white h-full"
              placeholder="Min 8 characters"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff color="#00ff88" size={20} /> : <Eye color="#00ff88" size={20} />}
            </TouchableOpacity>
          </View>
          
          {/* Dynamic Error Message */}
          {isPasswordShort && (
            <Text className="text-cyber-red text-xs mt-1 ml-1">
              ⚠️ Password must be at least 8 characters
            </Text>
          )}
        </View>

        {/* Confirm Password */}
        <View className="mb-8 mt-3">
          <Text className="text-[12px] text-cyber-cyan mb-2 font-bold tracking-widest">
            CONFIRM PASSWORD
          </Text>
          <View className="h-[50px] bg-cyber-green/5 border border-cyber-green/30 rounded-xl px-5 flex-row items-center">
            <TextInput
              className="flex-1 text-base text-white h-full"
              placeholder="Repeat Password"
              placeholderTextColor="#666"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff color="#00ff88" size={20} /> : <Eye color="#00ff88" size={20} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          className={`bg-cyber-green h-14 rounded-full justify-center items-center ${loading ? 'opacity-70' : ''}`}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text className="text-black text-base font-black tracking-widest">
              SIGN UP
            </Text>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text className="text-center mt-6 text-neutral-300 text-sm">
            Already have an account?{' '}
            <Text className="text-cyber-green font-bold">LOGIN</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}