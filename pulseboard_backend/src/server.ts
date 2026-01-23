import dotenv from "dotenv"; // This executes immediately upon import
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import router from "../src/routes/auth.routes.ts";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", router);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
