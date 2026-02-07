import { Router } from 'express';
import { createEvent, getEventFeed } from '../controllers/event.controller'; // .ts extension needed

const router = Router();

// POST /api/events - Create a new event
router.post('/', createEvent);

// GET /api/events/feed - Get the merged feed
router.get('/feed', getEventFeed);

export default router;