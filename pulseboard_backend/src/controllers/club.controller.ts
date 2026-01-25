import type { Request, Response } from "express"; // <--- Added 'type' here
import Club from "../models/Club.model.ts"; 

export const createClub = async (req: Request, res: Response) => {
  try {
    const { name, description, category } = req.body;

    // 1. Basic Validation
    if (!name || !description || !category) {
      return res.status(400).json({ message: "Please provide name, description, and category" });
    }

    // 2. Check if club already exists
    const existingClub = await Club.findOne({ name });
    if (existingClub) {
      return res.status(400).json({ message: "Club already exists" });
    }

    // 3. Create new club
    const newClub = new Club({
      name,
      description,
      category,
    });

    const savedClub = await newClub.save();

    res.status(201).json({
      message: "Club created successfully",
      club: savedClub,
    });
  } catch (error) {
    console.error("Error creating club:", error);
    res.status(500).json({ message: "Server error", error });
  }
};