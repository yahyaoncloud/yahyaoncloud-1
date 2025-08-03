import mongoose from "mongoose";
import { environment } from "../environments/environment";

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(`${environment.MONGODB_URI}`);
    console.log("MongoDB connected");
    console.log("MONGOOOOOOOOOO", environment.MONGODB_URI);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};


