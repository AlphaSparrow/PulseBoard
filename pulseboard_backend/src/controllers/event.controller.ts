import type { Request, Response } from 'express';
import Event from '../models/Event.model';
import User from '../models/User.model';
import Club from '../models/Club.model';
import { sendPushNotification } from '../services/notification.service';

/**
 * --- Create Event ---
 * Triggered when the "Publish" button is clicked in React Native.
 * Saves the title, location, date, and the EMOJI icon to MongoDB.
 */
export const createEvent = async (req: Request, res: Response) => {
  try {
    const eventData = { ...req.body };
    if (req.file) {
      eventData.imageUrl = req.file.path;
    }
    const newEvent = new Event(eventData);
    const savedEvent = await newEvent.save();

    // Notify all followers of this club in the background
    const clubId = savedEvent.clubId;
    const [club, followers] = await Promise.all([
      Club.findOne({ clubId }).select('name').lean(),
      User.find({ following: clubId, expoPushToken: { $exists: true, $ne: null } })
          .select('expoPushToken').lean(),
    ]);

    if (followers.length > 0) {
      const clubName = (club as any)?.name || 'A club';
      console.log(`[Event] Notifying ${followers.length} follower(s) of club ${clubId}`);
      followers.forEach(user => {
        sendPushNotification(
          (user as any).expoPushToken,
          `${savedEvent.icon} New Event — ${clubName}`,
          savedEvent.title,
          { eventId: savedEvent._id?.toString() }
        ).catch(() => {});
      });
    }

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: 'Error creating event', error });
  }
};

/**
 * --- Get Event Feed ---
 * Fetches all events and joins them with Club data for the global feed.
 */
export const getEventFeed = async (req: Request, res: Response) => {
  try {
    const events = await Event.aggregate([
      // Only show active events
      { 
        $match: { 
          badge: { $in: ['LIVE', 'UPCOMING'] } 
        } 
      },
      // Join with the 'clubs' collection
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
      // Add club-specific names and categories to the event object
      {
        $addFields: {
          clubName: '$clubInfo.name',
          category: '$clubInfo.category'
        }
      },
      // Remove heavy club data before sending to mobile
      { $project: { clubInfo: 0 } },
      { $sort: { date: 1 } }
    ]);
    
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event feed', error });
  }
};

/**
 * --- Get Events for a Single Club ---
 * Used to display the list of events on a specific Club's profile page.
 */
export const getEventsByClubId = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params;
    
    // Find all events belonging to this specific clubId
    const events = await Event.find({ 
      clubId: Number(clubId),
      badge: { $in: ['LIVE', 'UPCOMING'] } 
    }).sort({ date: 1 });
    
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};