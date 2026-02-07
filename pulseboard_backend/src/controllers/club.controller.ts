import type { Request, Response } from "express";
<<<<<<< HEAD
import Club from "../models/Club.model"; // removed .ts extension for cleaner import
import User from "../models/User.model"; // removed .ts extension for cleaner import
=======
import mongoose from "mongoose";
import Club from "../models/Club.model.ts";
import User from "../models/User.model.ts";
>>>>>>> fb0f8f7e5eb0e497f59eaeb1c3e4ad69b595bd3f

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

// --- Create Club ---
export const createClub = async (req: Request, res: Response) => {
  try {
    const { clubId, name, description, category } = req.body;

    if (!clubId || !name || !description || !category) {
      return res.status(400).json({
        message: "Please provide clubId, name, description, and category",
      });
    }

    const existingClub = await Club.findOne({ $or: [{ name }, { clubId }] });
    if (existingClub) {
      return res.status(400).json({ message: "Club or ID already exists" });
    }

    const newClub = new Club({ clubId, name, description, category });
    const savedClub = await newClub.save();

    res.status(201).json({
      message: "Club created successfully",
      club: savedClub,
    });
  } catch (error) {
    console.error("Error creating club:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Toggle Follow ---
export const toggleFollowClub = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { clubId } = req.params;
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const numericId = Number(clubId);
    if (isNaN(numericId)) {
      return res.status(400).json({ message: "Invalid Club ID format" });
    }

    const followingList = (user.following as number[]) || [];
    const isFollowing = followingList.includes(numericId);

    if (isFollowing) {
      await Promise.all([
        User.findByIdAndUpdate(userId, {
          $pull: { following: numericId },
        }),
        Club.findOneAndUpdate(
          { clubId: numericId },
          { $inc: { followers: -1 } }
        ),
      ]);
    } else {
      await Promise.all([
        User.findByIdAndUpdate(userId, {
          $addToSet: { following: numericId },
        }),
        Club.findOneAndUpdate(
          { clubId: numericId },
          { $inc: { followers: 1 } }
        ),
      ]);
    }

    const updatedUser = await User.findById(userId).select("following");

    res.json({ following: updatedUser?.following || [] });
  } catch (error) {
    console.error("Toggle Follow Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- Get Club by Mongo _id ---
export const getClubById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid club id" });
    }

    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    return res.status(200).json(club);
  } catch (error) {
    console.error("Get club error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// --- Get All Clubs ---
export const getAllClubs = async (_req: Request, res: Response) => {
  try {
    const clubs = await Club.find();
    return res.status(200).json(clubs);
  } catch (error) {
    console.error("Get all clubs error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
