// app/models/Category.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface ICategory {
  catID: string; // human readable id (optional)
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    catID: { type: String },
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "categories",
  }
);

const Category = models.Category || model<ICategory>("Category", CategorySchema);
export default Category;
