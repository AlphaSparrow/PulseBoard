import { Request, Response } from 'express';
import mongoose from 'mongoose';
import PersonalEvent from '../models/PersonalEvent.model';
import ProcessedEmail from '../models/ProcessedEmail.model';
import User from '../models/User.model';

const VALID_CATEGORIES = ['clubs', 'interviews', 'mess', 'google_classroom', 'lost_found', 'academic', 'general'];

export const getPersonalEvents = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        const user = await User.findById(userId).select('mutedCategories').lean();
        const muted: string[] = (user as any)?.mutedCategories || [];

        const query: any = { userId };
        if (muted.length > 0) {
            query.category = { $nin: muted };
        }

        const events = await PersonalEvent.find(query)
            .sort({ date: 1 })
            .lean();

        res.json({ events, mutedCategories: muted });
    } catch (err) {
        console.error('[PersonalEvent] Error fetching:', err);
        res.status(500).json({ message: 'Failed to fetch personal events' });
    }
};

export const deletePersonalEvent = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;

        const event = await PersonalEvent.findOneAndDelete({ _id: id, userId });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted' });
    } catch (err) {
        console.error('[PersonalEvent] Error deleting:', err);
        res.status(500).json({ message: 'Failed to delete event' });
    }
};

export const createManualEvent = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { title, description, date, timeDisplay, location, category, icon, color } = req.body;

        if (!title || !date || !timeDisplay || !location) {
            return res.status(400).json({ message: 'title, date, timeDisplay and location are required' });
        }

        const validCategory = VALID_CATEGORIES.includes(category) ? category : 'general';

        const event = await PersonalEvent.create({
            userId,
            gmailMessageId: `manual_${userId}_${Date.now()}`,
            title,
            description: description || '',
            date: new Date(date),
            timeDisplay,
            location,
            category: validCategory,
            icon: icon || '📅',
            color: color || '#6B7280',
            badge: new Date(date) <= new Date() ? 'LIVE' : 'UPCOMING',
            sourceFrom: 'Manual Entry',
            sourceSubject: 'Added by you',
        });

        res.status(201).json({ event });
    } catch (err) {
        console.error('[PersonalEvent] Error creating:', err);
        res.status(500).json({ message: 'Failed to create event' });
    }
};

export const updateCategoryPreferences = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { mutedCategories } = req.body;

        if (!Array.isArray(mutedCategories)) {
            return res.status(400).json({ message: 'mutedCategories must be an array' });
        }

        const filtered = mutedCategories.filter((c: string) => VALID_CATEGORIES.includes(c));

        await User.findByIdAndUpdate(userId, { mutedCategories: filtered });

        res.json({ mutedCategories: filtered });
    } catch (err) {
        console.error('[PersonalEvent] Error updating preferences:', err);
        res.status(500).json({ message: 'Failed to update preferences' });
    }
};

export const rescanPersonalEvents = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const { deletedCount } = await PersonalEvent.deleteMany({ userId });

        await ProcessedEmail.updateMany(
            { processedByUsers: userObjectId },
            { $pull: { processedByUsers: userObjectId } }
        );

        res.json({
            message: 'Re-scan initiated. Your inbox will be refreshed within 5 minutes.',
            deletedEvents: deletedCount,
        });
    } catch (err) {
        console.error('[PersonalEvent] Error rescanning:', err);
        res.status(500).json({ message: 'Failed to initiate re-scan' });
    }
};
