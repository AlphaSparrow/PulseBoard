import { Router } from 'express';
import { getMyProfile } from '../controllers/user.controller.ts';
import { authenticate } from '../middlewares/auth.middleware.ts';

const router = Router();

// GET /api/users/me
router.get('/me', authenticate, getMyProfile);

export default router;