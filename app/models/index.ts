import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { PostType } from "../constants/Constants";

// Interfaces
interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user" | "guest";
  contactDetails: IContactDetails;
  createdAt: Date;
  updatedAt: Date;
}

interface ICategory extends Document {
  _id: Types.ObjectId;
  catID: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface ITag extends Document {
  _id: Types.ObjectId;
  tagID: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface IType extends Document {
  _id: Types.ObjectId;
  type: PostType; // enforce the enum here
  createdAt: string;
  updatedAt: string;
}

interface IMediaAsset extends Document {
  _id: Types.ObjectId; // MongoDB-generated ObjectId
  mediaId: string; // Custom string field, replacing 'id'
  url: string;
  altText: string;
  uploadedBy: string;
  postId: string;
  type: "image" | "video" | "file";
  createdAt: string;
  updatedAt: string;
}

interface IComment extends Document {
  _id: Types.ObjectId;
  postId: string;
  author: {
    id: string;
    name: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
  approved: boolean;
}

interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  summary: string;
  date: Date;
  author: Types.ObjectId; // Changed from IAuthor to Types.ObjectId
  authorId: string;
  categories: ICategory[];
  tags: ITag[];
  types: IType;
  coverImage: string;
  gallery: IMediaAsset[];
  minuteRead: number;
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  commentsCount: number;
  status: "draft" | "published";
  seo: ISEO;
}

interface ISEO extends Document {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface IPortfolio extends Document {
  name: string;
  bio: string;
  portraitUrl: string;
  experiences: {
    title: string;
    description: string[];
    period: string;
  }[];
  certifications: {
    title: string;
    issuer: string;
    year: string;
  }[];
  hobbies: {
    name: string;
    description: string;
  }[];
  skills: string[];
  currentWorks: {
    title: string;
    description: string;
  }[];
  socialLinks: {
    linkedin: string;
    github: string;
    twitter: string;
    youtube: string;
    instagram: string;
    email: string;
  };
}

interface IExperience extends Document {
  title: string;
  company: string;
  skills: string[];
}

interface ICertification extends Document {
  title: string;
  issuer: string;
  year: string;
}

interface IHobby extends Document {
  name: string;
  description: string;
}

interface ISettings extends Document {
  _id: Types.ObjectId;
  siteTitle: string;
  siteDescription: string;
  logoUrl: string;
  socialLinks: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface IGuestbook extends Document {
  author: string;
  content: string;
}

interface IContactDetails extends Document {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  twitter: string;
  website: string;
  createdAt: string;
  updatedAt: string;
}

interface IAuthor extends Document {
  _id: Types.ObjectId;
  authorId: string;
  authorName: string;
  authorProfession: string;
  userId: Types.ObjectId;
  contactDetails: IContactDetails;
  createdAt: string;
  updatedAt: string;
}

// Schemas
const defaultOptions = { timestamps: true };

export type IUserDoc = IUser & Document;
export type ICategoryDoc = ICategory & Document;
export type ITagDoc = ITag & Document;
export type ITypeDoc = IType & Document;
export type IMediaAssetDoc = IMediaAsset & Document;
export type ICommentDoc = IComment & Document;
export type IPostDoc = IPost & Document;
export type IPortfolioDoc = IPortfolio & Document;
export type IExperienceDoc = IExperience & Document;
export type ICertificationDoc = ICertification & Document;
export type IHobbyDoc = IHobby & Document;
export type ISettingsDoc = ISettings & Document;
export type IGuestbookDoc = IGuestbook & Document;
export type IContactDetailsDoc = IContactDetails & Document;
export type IAuthorDoc = IAuthor & Document;
export type ISEODoc = ISEO & Document;

const UserSchema = new Schema<IUser>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user", "guest"], default: "user" },
    ContactDetails: {
      type: Schema.Types.ObjectId,
      ref: "ContactDetails",
      required: true,
    },
  },
  defaultOptions
);

const CategorySchema = new Schema<ICategory>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    catID: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  defaultOptions
);

const TagSchema = new Schema<ITag>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    tagID: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  defaultOptions
);

const TypeSchema = new Schema<IType>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    type: {
      type: String,
      required: true,
      enum: Object.values(PostType), // enforce enum
    },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  defaultOptions
);

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    mediaId: { type: String, required: true, unique: true }, // Renamed from 'id'
    url: { type: String, required: true },
    altText: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    postId: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "file"], required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: true }
);

const CommentSchema = new Schema<IComment>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    postId: { type: String, required: true },
    author: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
    content: { type: String, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  defaultOptions
);

const PostSchema = new Schema<IPost>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true },
    summary: { type: String, required: true },
    date: { type: Date, required: true },
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    types: [{ type: Schema.Types.ObjectId, ref: "Type" }],
    coverImage: { type: String, required: true },
    gallery: [{ type: Schema.Types.ObjectId, ref: "MediaAsset" }],
    minuteRead: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    seo: { type: Schema.Types.ObjectId, ref: "SEO", required: true },
  },
  defaultOptions
);

const SEOSchema = new Schema<ISEO>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: [{ type: String, required: true }],
    canonicalUrl: { type: String, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  defaultOptions
);

const PortfolioSchema = new Schema<IPortfolio>(
  {
    name: { type: String, required: true },
    bio: { type: String, required: true },
    portraitUrl: { type: String, required: true },
    experiences: [
      {
        title: { type: String, required: true },
        description: [{ type: String, required: true }],
        period: { type: String, required: true },
      },
    ],
    certifications: [
      {
        title: { type: String, required: true },
        issuer: { type: String, required: true },
        year: { type: String, required: true },
      },
    ],
    hobbies: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    skills: [{ type: String, required: true }],
    currentWorks: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    socialLinks: {
      linkedin: { type: String, required: false },
      github: { type: String, required: false },
      twitter: { type: String, required: false },
      youtube: { type: String, required: false },
      instagram: { type: String, required: false },
      email: { type: String, required: false },
    },
  },
  defaultOptions
);

const ExperienceSchema = new Schema<IExperience>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    skills: [String],
  },
  defaultOptions
);

const CertificationSchema = new Schema<ICertification>(
  {
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    year: { type: String, required: true },
  },
  defaultOptions
);

const HobbySchema = new Schema<IHobby>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  defaultOptions
);

const SettingsSchema = new Schema<ISettings>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    siteTitle: { type: String, required: true },
    siteDescription: { type: String, required: true },
    logoUrl: { type: String, required: true },
    socialLinks: [String],
  },
  defaultOptions
);

const GuestbookSchema = new Schema<IGuestbook>(
  {
    author: { type: String, required: true },
    content: { type: String, required: true },
  },
  defaultOptions
);

const AuthorSchema = new Schema<IAuthor>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    authorId: { type: String, unique: true },
    authorName: { type: String, required: true },
    authorProfession: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    contactDetails: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      linkedin: { type: String, required: true },
      github: { type: String, required: true },
      twitter: { type: String, required: true },
      website: { type: String, required: true },
      createdAt: { type: String, required: true },
      updatedAt: { type: String, required: true },
    },
  },
  defaultOptions
);

// Models
export const User: Model<IUserDoc> =
  mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema);
export const Category: Model<ICategoryDoc> =
  mongoose.models.Category ||
  mongoose.model<ICategoryDoc>("Category", CategorySchema);
export const Tag: Model<ITagDoc> =
  mongoose.models.Tag || mongoose.model<ITagDoc>("Tag", TagSchema);
export const Type: Model<ITypeDoc> =
  mongoose.models.Type || mongoose.model<ITypeDoc>("Type", TypeSchema);
export const MediaAsset =
  mongoose.models.MediaAsset ||
  mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);
export const Comment: Model<ICommentDoc> =
  mongoose.models.Comment ||
  mongoose.model<ICommentDoc>("Comment", CommentSchema);
export const Post: Model<IPostDoc> =
  mongoose.models.Post || mongoose.model<IPostDoc>("Post", PostSchema);
export const Portfolio: Model<IPortfolioDoc> =
  mongoose.models.Portfolio ||
  mongoose.model<IPortfolioDoc>("Portfolio", PortfolioSchema);
export const Experience: Model<IExperienceDoc> =
  mongoose.models.Experience ||
  mongoose.model<IExperienceDoc>("Experience", ExperienceSchema);
export const Certification: Model<ICertificationDoc> =
  mongoose.models.Certification ||
  mongoose.model<ICertificationDoc>("Certification", CertificationSchema);
export const Hobby: Model<IHobbyDoc> =
  mongoose.models.Hobby || mongoose.model<IHobbyDoc>("Hobby", HobbySchema);
export const Settings: Model<ISettingsDoc> =
  mongoose.models.Settings ||
  mongoose.model<ISettingsDoc>("Settings", SettingsSchema);
export const Guestbook: Model<IGuestbookDoc> =
  mongoose.models.Guestbook ||
  mongoose.model<IGuestbookDoc>("Guestbook", GuestbookSchema);
export const Author: Model<IAuthorDoc> =
  mongoose.models.Author || mongoose.model<IAuthorDoc>("Author", AuthorSchema);
export const SEO: Model<ISEODoc> =
  mongoose.models.SEO || mongoose.model<ISEODoc>("SEO", SEOSchema);
