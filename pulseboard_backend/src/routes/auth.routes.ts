import { Router } from "express";
import { googleCallback } from "../controllers/googleAuth.controller.ts";

const router = Router();

/**
 * POST /auth/google/callback
 * Body: { code: string }
 */
router.post("/google/callback", googleCallback);

export default router;
