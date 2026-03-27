import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getPersonalEvents, rescanPersonalEvents } from '../controllers/personalEvent.controller';

const router = Router();

// GET /api/personal-events — returns personal events for the logged-in user
router.get('/', authenticate, getPersonalEvents);

// POST /api/personal-events/rescan — clears cache and triggers fresh scan
router.post('/rescan', authenticate, rescanPersonalEvents);

export default router;
