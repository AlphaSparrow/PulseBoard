// import express from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getGoogleUser } from "../services/googleOAuth.service.ts";
import User from "../models/User.model.ts";

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.body as { code?: string };

    if (!code) {
      return res.status(400).json({ error: "Authorization code missing" });
    }

    const googleUser = await getGoogleUser(code);

    let user = await User.findOne({ googleId: googleUser.sub });

    if (!user) {
      user = await User.create({
        googleId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({ token, user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OAuth failed!!!" });
  }
};
