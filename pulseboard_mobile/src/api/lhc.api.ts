import api from './client';

export interface LHCBooking {
  room: string;
  title: string;
  start: string;
  end: string;
  type: 'club' | 'personal';
  color?: string;
}

/**
 * Fetches the room bookings for the Lecture Hall Complex for a given date.
 */
export async function fetchLHCHeatmap(date: Date): Promise<LHCBooking[]> {
  try {
    const response = await api.get('/lhc/heatmap', {
      params: { date: date.toISOString().split('T')[0] }
    });
    return response.data;
  } catch (error) {
    console.error('[LHC API] Error fetching heatmap:', error);
    return [];
  }
}
