import mongoose from "mongoose";
import { cloudinary } from "../config/cloudinary"; // Assume cloudinary config is in a separate file
import { MediaAsset } from "../models";
import { environment } from "../environments/environment";

const connectDB = async () => {
  try {
    await mongoose.connect(environment.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const uploadToCloudinary = async (
  file: Buffer,
  filename: string,
  resourceType: "raw" = "raw"
) => {
  try {
    const result = await cloudinary.uploader.upload_stream(
      { resource_type: resourceType, public_id: filename.split(".")[0] },
      (error, result) => {
        if (error) throw error;
        return result;
      }
    );
    const mediaAsset = new MediaAsset({
      url: result.secure_url,
      altText: filename,
      type: resourceType === "raw" ? "md" : resourceType,
      filename,
    });
    await mediaAsset.save();
    return mediaAsset;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export { connectDB, uploadToCloudinary };
