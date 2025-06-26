/**
 * Project: yahyaoncloud Official Blog Platform
 * File: app/lib/db/mongoose.server.ts
 * Description: MongoDB connection using Mongoose
 */

import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    // Replace with your actual MongoDB connection string in your .env file
    const MONGODB_URI =
      process.env.MONGODB_URI ||
      "mongodb+srv://ykinwork1:Almightypush%40123@blogdb.5oxjqec.mongodb.net/";

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(MONGODB_URI);

    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("MongoDB disconnected successfully");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
    throw error;
  }
};
