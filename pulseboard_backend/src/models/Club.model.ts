import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClub extends Document {
  name: string;
  description: string;
  category: "Technical" | "Cultural" | "Sports" | "Literary" | "Other";
  followers: mongoose.Types.ObjectId[];
}

const ClubSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Technical", "Cultural", "Sports", "Literary", "Other"],
      required: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Club: Model<IClub> = mongoose.model<IClub>("Club", ClubSchema);
export default Club;