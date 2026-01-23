import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  googleId: string;
  password?: string;
  year?: number;
  branch?: string;
  preferences: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, required: true },
    // Set to false so OAuth doesn't crash
    password: { type: String, required: false }, 
    year: { type: Number, required: false },
    branch: { type: String, required: false },
    preferences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
      },
    ],
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;