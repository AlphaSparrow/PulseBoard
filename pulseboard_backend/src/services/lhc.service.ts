import Event from '../models/Event.model';
import PersonalEvent from '../models/PersonalEvent.model';

export const LHC_ROOMS = ['110', '205', '206', '305', '306', '308'];

export interface LHCBooking {
  room: string;
  title: string;
  start: Date;
  end: Date;
  type: 'club' | 'personal';
  color?: string;
}

/**
 * Extracts the room number from a location string if it's an LHC room.
 * e.g. "LHC 110" -> "110", "Lecture Hall 205" -> "205"
 */
export function extractLHCRoom(location: string): string | null {
  const loc = location.toUpperCase();
  if (!loc.includes('LHC') && !loc.includes('LECTURE HALL')) return null;

  for (const room of LHC_ROOMS) {
    if (loc.includes(room)) return room;
  }
  return null;
}

/**
 * Checks if a room is available for a given time block.
 * Returns true if available, false if there's an overlap.
 */
export async function isLHCRoomAvailable(
  room: string,
  start: Date,
  end: Date,
  excludeEventId?: string
): Promise<{ available: boolean; conflict?: any }> {
  // Check Club Events
  const clubConflict = await Event.findOne({
    location: new RegExp(room, 'i'),
    _id: { $ne: excludeEventId },
    $or: [
      { date: { $lt: end }, endDate: { $gt: start } }
    ]
  });

  if (clubConflict) return { available: false, conflict: clubConflict };

  // Check Personal Events (parsed from emails)
  const personalConflict = await PersonalEvent.findOne({
    location: new RegExp(room, 'i'),
    _id: { $ne: excludeEventId },
    $or: [
      { date: { $lt: end }, endDate: { $gt: start } }
    ]
  });

  if (personalConflict) return { available: false, conflict: personalConflict };

  return { available: true };
}

/**
 * Gets all bookings for the LHC on a specific date for the Heatmap.
 */
export async function getLHCHeatmap(date: Date): Promise<LHCBooking[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const [clubEvents, personalEvents] = await Promise.all([
    Event.find({ 
      location: /LHC|Lecture Hall/i,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).lean(),
    PersonalEvent.find({
      location: /LHC|Lecture Hall/i,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).lean()
  ]);

  const bookings: LHCBooking[] = [];

  clubEvents.forEach(e => {
    const room = extractLHCRoom(e.location);
    if (room) {
      bookings.push({
        room,
        title: e.title,
        start: e.date,
        end: e.endDate || new Date(e.date.getTime() + 3600000),
        type: 'club',
        color: e.color
      });
    }
  });

  personalEvents.forEach(e => {
    const room = extractLHCRoom(e.location);
    if (room) {
      bookings.push({
        room,
        title: e.title,
        start: e.date,
        end: e.endDate || new Date(e.date.getTime() + 3600000),
        type: 'personal',
        color: e.color
      });
    }
  });

  return bookings;
}
