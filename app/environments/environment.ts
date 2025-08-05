// /environemnts/environment.ts

import { config } from "dotenv";
import mongoose from "mongoose";

// Load .env file
config();

export const getEnv = () => {
  const environment = {
    GO_BACKEND_URL: "https://yahyaoncloud.onrender.com/api",
    MONGODB_URI: process.env.MONGODB_URI,
    NODE_ENV: process.env.NODE_ENV,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,

    // Firebase Configuration
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  };

  // Validate required environment variables
  if (!environment.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env file");
  }
  if (!environment.FIREBASE_API_KEY) {
    throw new Error("FIREBASE_API_KEY is not defined in .env file");
  }
  if (!environment.FIREBASE_AUTH_DOMAIN) {
    throw new Error("FIREBASE_AUTH_DOMAIN is not defined in .env file");
  }
  if (!environment.FIREBASE_DATABASE_URL) {
    throw new Error("FIREBASE_DATABASE_URL is not defined in .env file");
  }
  if (!environment.FIREBASE_PROJECT_ID) {
    throw new Error("FIREBASE_PROJECT_ID is not defined in .env file");
  }
  if (!environment.FIREBASE_STORAGE_BUCKET) {
    throw new Error("FIREBASE_STORAGE_BUCKET is not defined in .env file");
  }
  if (!environment.FIREBASE_MESSAGING_SENDER_ID) {
    throw new Error("FIREBASE_MESSAGING_SENDER_ID is not defined in .env file");
  }
  if (!environment.FIREBASE_APP_ID) {
    throw new Error("FIREBASE_APP_ID is not defined in .env file");
  }

  return environment;
};

export const initMongoDB = async () => {
  const { MONGODB_URI } = getEnv();
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export const environment = getEnv();
