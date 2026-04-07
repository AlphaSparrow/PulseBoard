import { Request, Response } from 'express';
import { getLHCHeatmap } from '../services/lhc.service';

/**
 * --- Get LHC Heatmap ---
 * Fetches all bookings for a given date for the Heatmap.
 */
export const getHeatmap = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const searchDate = date ? new Date(date as string) : new Date();
    
    if (isNaN(searchDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date provided.' });
    }

    const bookings = await getLHCHeatmap(searchDate);
    res.status(200).json(bookings);
  } catch (error) {
    console.error('[LHC] Error fetching heatmap:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
