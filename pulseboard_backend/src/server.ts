import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import router from "../src/routes/auth.routes.ts";
import clubRoutes from "./routes/club.routes.ts";
import eventRoutes from "./routes/event.routes.ts";
import userRoutes from "./routes/user.routes.ts";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", router);
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
