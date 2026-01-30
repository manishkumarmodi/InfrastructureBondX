import mongoose from "mongoose";
import { env } from "./env";

mongoose.set("strictQuery", true);

export async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to MongoDB cluster");
  } catch (error) {
    console.error("MongoDB connection error", error);
    throw error;
  }
}
