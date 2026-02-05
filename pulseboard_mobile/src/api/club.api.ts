import api from './client';
import client from './client';

export const toggleFollowClubApi = (clubId: number) => {
  return client.post(`/api/clubs/follow/${clubId}`);
};

export const getClubById = async (id: string) => {
  const res = await client.get(`/clubs/${id}`);
  return res.data;
};

export const getAllClubs = async () => {
  const res = await client.get('/clubs');
  return res.data;
};
