import { config } from "dotenv";
import mongoose from "mongoose";

// Load .env file
config();

export const getEnv = () => {
  const environment = {
    GO_BACKEND_URL: "https://yahyaoncloud.onrender.com/api",
    MONGODB_URI: process.env.MONGODB_URI,
    NODE_ENV: process.env.NODE_ENV,
    // GO_BACKEND_URL: process.env.GO_BACKEND_URL ,
    // GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ,
    // GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    // SESSION_SECRET: process.env.SESSION_SECRET,
    // GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ,
  };

  if (!environment.MONGODB_URI)
    throw new Error("MONGODB_URI is not defined in .env file");
  // if (!environment.SESSION_SECRET)
  //   throw new Error("SESSION_SECRET is not defined in .env file");
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
