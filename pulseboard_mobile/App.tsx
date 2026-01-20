import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screens
import MainScreen from './mainpage'; 
import RegisterScreen from './registerpage';

// 1. Define the screen names and their params for TypeScript
export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ headerShown: false }} // Hides the default white top bar
      >
        <Stack.Screen name="Home" component={MainScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}