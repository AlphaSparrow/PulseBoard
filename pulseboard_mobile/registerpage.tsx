import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  TextInput,
  ViewStyle,
  TextStyle
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './App'; // Adjust path based on your file structure

const { width, height } = Dimensions.get('window');
const PRIMARY_PURPLE = '#8A56F1';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      {/* Top Section: Header */}
      <View style={styles.header}>
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>{"<"} Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.logoWrapper}>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>
      </View>

      {/* Wave Transition */}
      <View style={styles.waveWrapper}>
        <Svg height="120" width={width} viewBox={`0 0 ${width} 120`} preserveAspectRatio="none">
          <Path
            fill={PRIMARY_PURPLE}
            d={`M0,0 L${width},0 L${width},40 C${width * 0.8},120 ${width * 0.2},120 0,40 Z`}
          />
        </Svg>
      </View>

      {/* Input Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="John Doe" 
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput 
            style={styles.input} 
            placeholder="example@mail.com" 
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="••••••••" 
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => console.log('Registering user...')}
        >
          <Text style={styles.registerButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.linkText}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: height * 0.25,
    backgroundColor: PRIMARY_PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    position: 'absolute',
    top: 10,
    left: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoWrapper: {
    marginTop: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  waveWrapper: {
    marginTop: -1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    height: 50,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  registerButton: {
    backgroundColor: PRIMARY_PURPLE,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: PRIMARY_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 25,
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: PRIMARY_PURPLE,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;