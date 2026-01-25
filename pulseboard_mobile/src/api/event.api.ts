import api from './client';

export const getEventFeed = async () => {
  try {
    const response = await api.get('/api/events/feed');
    return response.data;
  } catch (error) {
    console.error('Error fetching event feed:', error);
    throw error;
  }
};