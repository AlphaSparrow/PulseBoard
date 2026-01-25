import { Router } from "express";
import { createClub } from "../controllers/club.controller.ts";

const router = Router();

router.post("/", createClub); 

export default router;