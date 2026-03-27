import PersonalEvent from '../models/PersonalEvent.model';
import User from '../models/User.model';
import { sendPushNotification } from './notification.service';

/**
 * Runs every 5 minutes.
 * Finds events happening within the next 55–65 minutes (10-min window around the 1-hour mark)
 * and sends a reminder push notification to the event owner.
 */
async function sendReminders() {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 55 * 60 * 1000); // 55 min from now
    const windowEnd   = new Date(now.getTime() + 65 * 60 * 1000); // 65 min from now

    const upcomingEvents = await PersonalEvent.find({
        date: { $gte: windowStart, $lte: windowEnd },
        reminderSent: false,
    });

    if (upcomingEvents.length === 0) return;

    console.log(`[Reminder] Found ${upcomingEvents.length} event(s) starting in ~1 hour`);

    for (const event of upcomingEvents) {
        try {
            const user = await User.findById(event.userId).select('expoPushToken');
            if (!user?.expoPushToken) continue;

            await sendPushNotification(
                user.expoPushToken,
                `${event.icon} Starting in 1 hour!`,
                `${event.title}${event.location !== 'TBD' ? ` · ${event.location}` : ''}`,
                { eventId: event._id.toString() }
            );

            await PersonalEvent.updateOne({ _id: event._id }, { reminderSent: true });
            console.log(`[Reminder] Sent reminder for "${event.title}" to user ${event.userId}`);
        } catch (err) {
            console.error(`[Reminder] Failed for event ${event._id}:`, (err as Error).message);
        }
    }
}

export function startReminderScheduler(intervalMs = 5 * 60 * 1000) {
    console.log('[Reminder] Scheduler started — checking every 5 minutes');
    sendReminders(); // run immediately on boot
    setInterval(sendReminders, intervalMs);
}
