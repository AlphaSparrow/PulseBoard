import { Router } from 'express';
import { createEvent, getEventFeed, getMyEventsCount } from '../controllers/event.controller.ts'; // .ts extension needed
import { authenticate } from '../middlewares/auth.middleware.ts';
const router = Router();

// POST /api/events - Create a new event
router.post('/', createEvent);

// GET /api/events/feed - Get the merged feed
router.get('/feed', getEventFeed);
router.get('/my-count', authenticate, getMyEventsCount);

export default router;