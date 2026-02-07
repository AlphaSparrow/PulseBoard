import { Router } from "express";
<<<<<<< HEAD
// NOTE: removed the '.ts' extension from imports (standard practice in Node/TS)
import { createClub, toggleFollowClub } from "../controllers/club.controller";
// FIX: Import 'authenticate' (that's the real name inside your file)
import { authenticate } from '../middlewares/auth.middleware';
=======

import { authenticate } from '../middlewares/auth.middleware.ts';
import { createClub , getClubById , toggleFollowClub, getAllClubs } from "../controllers/club.controller.ts";

>>>>>>> fb0f8f7e5eb0e497f59eaeb1c3e4ad69b595bd3f

const router = Router();
router.get("/", getAllClubs);     // 👈 ADD THIS
router.get("/:id", getClubById);
router.post("/", createClub);

// FIX: Use 'authenticate' variable here
router.post('/follow/:clubId', authenticate, toggleFollowClub);

export default router;