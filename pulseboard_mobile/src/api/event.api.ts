import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const getEventFeed = async () => {
  try {
    // FIX: Explicit full path to match server.ts app.use("/api/events", ...)
    const response = await axios.get(`${API_URL}/api/events/feed`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event feed:', error);
    throw error;
  }
};