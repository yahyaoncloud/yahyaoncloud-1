import { Schema, model, Types, Document, Model } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user" | "guest";
  createdAt: Date;
  updatedAt: Date;
}

export type IUserDoc = IUser & Document;

const UserSchema = new Schema<IUserDoc>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user", "guest"], default: "user" },
  },
  { timestamps: true }
);

export const User: Model<IUserDoc> = model<IUserDoc>("User", UserSchema);
