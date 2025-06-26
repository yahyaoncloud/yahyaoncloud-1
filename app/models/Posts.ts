/**
 * Project: yahyaoncloud Official Blog Platform
 * File: app/models/Post.ts
 * Description: MongoDB schema for blog posts
 */

import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export interface IPost {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: "Featured" | "Latest" | "General";
  tags: string[];
  coverImage?: string;
  author: string;
  createdAt: Date;
  updatedAt?: Date;
  isPublished: boolean;
  views: number;
}

export const getPostModel = async () => {
  if (!mongoose.models.Post) {
    const PostSchema = new mongoose.Schema<IPost>({
      // schema fields
    });
    return mongoose.model<IPost>("Post", PostSchema);
  }
  return mongoose.models.Post;
};

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    excerpt: String,
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["Featured", "Latest", "General"],
      default: "General",
    },
    tags: [String],
    coverImage: String,
    author: { type: String, default: "Tunkstun" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    isPublished: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
  },
  {
    collection: "articles", // 👈 Add this line
  }
);

// This helps with hot module reloading in development
const Post = models.Post || model<IPost>("Posts", PostSchema);

export default Post;
