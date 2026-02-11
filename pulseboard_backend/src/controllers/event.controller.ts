import type { Request, Response } from 'express';
// FIX: Added .ts extension back because your Node environment requires it
import Event from '../models/Event.model.ts'; 
import User from '../models/User.model.ts';   

// --- Get My Events Count (FIXED) ---
export const getMyEventsCount = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const user = await User.findById(userId).select('following');
    const followingRaw = user?.following || [];

    // Mixed Type Logic (Matches both Numbers and Strings)
    const followingMixed = [
      ...followingRaw.map((id: any) => Number(id)), 
      ...followingRaw.map((id: any) => String(id))
    ];

    const count = await Event.countDocuments({ 
      clubId: { $in: followingMixed as any },
      badge: { $in: ['LIVE', 'UPCOMING'] } 
    });

    console.log(`User ${userId} follows ${followingRaw.length} clubs. Found ${count} active events.`);
    res.json({ count });

  } catch (error) {
    console.error("Error counting events:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// --- Create Event ---
export const createEvent = async (req: Request, res: Response) => {
  try {
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
};

// --- Get Feed ---
export const getEventFeed = async (req: Request, res: Response) => {
  try {
    const events = await Event.aggregate([
      { 
        $match: { 
          badge: { $in: ['LIVE', 'UPCOMING'] } 
        } 
      },
      {
        $lookup: {
          from: 'clubs',          
          localField: 'clubId',   
          foreignField: 'clubId', 
          as: 'clubInfo'          
        }
      },
      { 
        $unwind: {
          path: '$clubInfo',
          preserveNullAndEmptyArrays: true 
        }
      },
      {
        $addFields: {
          clubName: '$clubInfo.name',
          category: '$clubInfo.category'
        }
      },
      {
        $project: {
          clubInfo: 0 
        }
      },
      { 
        $sort: { date: 1 } 
      }
    ]);
    
    res.status(200).json(events);
  } catch (error) {
    console.error("Aggregation Error:", error);
    res.status(500).json({ message: 'Error fetching event feed', error });
  }
};