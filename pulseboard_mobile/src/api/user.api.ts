import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure this matches your IP in .env (e.g., http://192.168.1.5:3000)
// NO trailing slash
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'; 

const api = axios.create({
  baseURL: API_URL,
});

// Auto-add token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getUserProfile = async () => {
  try {
    // FIX: Added '/api' because server.ts has app.use("/api/users", ...)
    const response = await api.get('/api/users/me'); 
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};