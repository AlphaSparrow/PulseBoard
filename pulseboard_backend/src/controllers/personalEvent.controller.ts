import { Request, Response } from 'express';
import mongoose from 'mongoose';
import PersonalEvent from '../models/PersonalEvent.model';
import ProcessedEmail from '../models/ProcessedEmail.model';

export const getPersonalEvents = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        const events = await PersonalEvent.find({ userId })
            .sort({ date: 1 })
            .lean();

        res.json({ events });
    } catch (err) {
        console.error('[PersonalEvent] Error fetching:', err);
        res.status(500).json({ message: 'Failed to fetch personal events' });
    }
};

/**
 * Clears all personal events for this user and removes them from the
 * ProcessedEmail cache so the Gmail watcher will re-process all emails
 * fresh on the next cycle (applying the updated filters).
 */
export const rescanPersonalEvents = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Delete all personal events for this user
        const { deletedCount } = await PersonalEvent.deleteMany({ userId });

        // Remove this user from all ProcessedEmail.processedByUsers arrays
        // so the watcher will re-analyse these emails fresh
        await ProcessedEmail.updateMany(
            { processedByUsers: userObjectId },
            { $pull: { processedByUsers: userObjectId } }
        );

        console.log(`[PersonalEvent] Re-scan: deleted ${deletedCount} events and cleared cache for user ${userId}`);

        res.json({
            message: 'Re-scan initiated. Your inbox will be refreshed in the next scan cycle (up to 5 minutes).',
            deletedEvents: deletedCount,
        });
    } catch (err) {
        console.error('[PersonalEvent] Error rescanning:', err);
        res.status(500).json({ message: 'Failed to initiate re-scan' });
    }
};
