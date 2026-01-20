import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  StatusBar,
  ViewStyle,
  TextStyle
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './App';

const { width, height } = Dimensions.get('window');

// Define specific Purple color from image
const PRIMARY_PURPLE = '#8A56F1';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const MainScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Section: Branding */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.logoWrapper}>
            <View style={styles.hexagon}>
              <Text style={styles.logoChar}>PB</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* The Wave Transition */}
      <View style={styles.waveWrapper}>
  <Svg 
    height="150" // Increased height to allow for a deeper wave
    width={width} 
    viewBox={`0 0 ${width} 150`}
    preserveAspectRatio="none"
  >
    <Path
      fill={PRIMARY_PURPLE}
      /* M0,0 -> Start top left
         Lwidth,0 -> Draw to top right
         Lwidth,100 -> Drop down slightly
         C... -> First curve (the "dip")
         C... -> Second curve (the "rise")
      */
      d={`M0,0 
          L${width},0 
          L${width},90 
          C${width * 0.8},150 ${width * 0.6},150 ${width * 0.5},90 
          C${width * 0.4},30 ${width * 0.2},30 0,90 
          Z`}
    />
  </Svg>
</View>

      {/* Bottom Section: Welcome Text & Actions */}
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to PulseBoard</Text>
          <Text style={styles.subtitle}>
            Experience the best way to manage your tasks and stay productive.
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate('Login' as any)}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.button, styles.registerButton]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>Register Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  logoWrapper: ViewStyle;
  hexagon: ViewStyle;
  logoChar: TextStyle;
  waveWrapper: ViewStyle;
  content: ViewStyle;
  textContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  buttonRow: ViewStyle;
  button: ViewStyle;
  loginButton: ViewStyle;
  registerButton: ViewStyle;
  loginText: TextStyle;
  registerText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: height * 0.35,
    backgroundColor: PRIMARY_PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
  },
  hexagon: {
    width: 110,
    height: 110,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    borderRadius: 22,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoChar: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    transform: [{ rotate: '-45deg' }],
  },
  waveWrapper: {
    marginTop: -1, // Remove gaps
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    paddingBottom: 50,
  },
  textContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '48%',
  },
  loginButton: {
    backgroundColor: '#F3EFFF', // Light purple tint
    borderWidth: 1,
    borderColor: PRIMARY_PURPLE,
    marginBottom: 30,
  },
  registerButton: {
    backgroundColor: PRIMARY_PURPLE,
  },
  loginText: {
    color: PRIMARY_PURPLE,
    fontWeight: '700',
    fontSize: 16,
  },
  registerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default MainScreen;