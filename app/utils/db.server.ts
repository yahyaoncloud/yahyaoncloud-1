import mongoose from "mongoose";
import { getEnv } from "../environments/environment"; // adjust path if needed

let isConnected = false;

export const initMongoDB = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    return mongoose;
  }

  const { MONGODB_URI } = getEnv();

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      autoIndex: true, // enable/disable depending on your needs
      maxPoolSize: 10, // control connection pool size
    });

    isConnected = true;
    console.log("✅ Connected to MongoDB");
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};
