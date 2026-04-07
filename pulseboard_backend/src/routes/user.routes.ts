import { Router } from "express";
import {
  getMyProfile,
  savePushToken,
  updateMyProfile,
} from "../controllers/user.controller";
import { getUserEmails } from "../controllers/userEmail.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// GET /api/users/me
router.get("/me", authenticate, getMyProfile);

// PATCH /api/users/me
router.patch("/me", authenticate, updateMyProfile);

// GET /api/users/emails
router.get("/emails", authenticate, getUserEmails);

// POST /api/users/save-push-token
router.post(
  "/save-push-token",
  authenticate,
  savePushToken

);

export default router;
