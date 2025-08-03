// /**
//  * Project: yahyaoncloud Official Blog Platform
//  * File: app/models/Post.ts
//  * Description: MongoDB schema for blog posts
//  */

// import mongoose, { Schema, model, models } from "mongoose";

// export interface IPost {
//   postId: string;
//   title: string;
//   content: string;
//   summary: string;
//   date: Date;
//   authorId: string;
//   catids: string[];          // category IDs for querying
//   tagids: string[];          // tag IDs for querying
//   typeids: string[];         // type IDs for querying
//   coverImage?: {
//     id: string;
//     url: string;
//     altText?: string;
//     uploadedBy: string;
//     type: "image" | "video" | "file";
//     createdAt: Date;
//   };
//   gallery?: {
//     id: string;
//     url: string;
//     altText?: string;
//     uploadedBy: string;
//     type: "image" | "video" | "file";
//     createdAt: Date;
//   }[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// const MediaAssetSchema = new Schema(
//   {
//     id: { type: String, required: true },
//     url: { type: String, required: true },
//     altText: String,
//     uploadedBy: { type: String, required: true },
//     postId: { type: String },
//     type: { type: String, enum: ["image", "video", "file"], required: true },
//     createdAt: { type: Date, default: Date.now },
//   },
//   { _id: false }
// );

// const PostSchema = new Schema<IPost>(
//   {
//     postId: { type: String, unique: true, required: true },
//     title: { type: String, required: true },
//     content: { type: String, required: true },
//     summary: { type: String, required: true },
//     date: { type: Date, default: Date.now },
//     authorId: { type: String, required: true },

//     catids: [{ type: String }],
//     tagids: [{ type: String }],
//     typeids: [{ type: String }],

//     coverImage: MediaAssetSchema,
//     gallery: [MediaAssetSchema],

//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },
//   },
//   {
//     collection: "articles",
//   }
// );

// const Post = models.Post || model<IPost>("Post", PostSchema);
// export default Post;
