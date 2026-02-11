import client from './client';

export const toggleFollowClubApi = (clubId: number) => {
  return client.post(`/api/clubs/follow/${clubId}`);
};

export const getFollowedClubs = async () => {
  try {
    const response = await client.get('/api/clubs/followed'); 
    return response.data;
  } catch (error) {
    console.error("Error fetching followed clubs:", error);
    return [];
  }
};