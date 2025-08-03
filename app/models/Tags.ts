// app/models/Tag.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface ITag {
  tagID: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    tagID: { type: String },
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "tags",
  }
);

const Tag = models.Tag || model<ITag>("Tag", TagSchema);
export default Tag;
