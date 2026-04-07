import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
    getPersonalEvents,
    deletePersonalEvent,
    createManualEvent,
    updateCategoryPreferences,
    rescanPersonalEvents,
} from '../controllers/personalEvent.controller';

const router = Router();

// GET /api/personal-events
router.get('/', authenticate, getPersonalEvents);

// POST /api/personal-events — create manual event
router.post('/', authenticate, createManualEvent);

// DELETE /api/personal-events/:id
router.delete('/:id', authenticate, deletePersonalEvent);

// PATCH /api/personal-events/preferences — mute/unmute categories
router.patch('/preferences', authenticate, updateCategoryPreferences);

// POST /api/personal-events/rescan — clears cache and triggers fresh scan
router.post('/rescan', authenticate, rescanPersonalEvents);

export default router;
