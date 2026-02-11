import { Router } from "express";
// NOTE: removed the '.ts' extension from imports (standard practice in Node/TS)
import { createClub, toggleFollowClub, getFollowedClubs } from "../controllers/club.controller.ts";
// FIX: Import 'authenticate' (that's the real name inside your file)
import { authenticate } from '../middlewares/auth.middleware.ts';

const router = Router();

router.post("/", createClub); 
router.get('/followed', authenticate, getFollowedClubs);
router.post('/follow/:clubId', authenticate, toggleFollowClub);

export default router;