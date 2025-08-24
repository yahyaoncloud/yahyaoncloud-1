import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { PostType } from "../constants/Constants";

// Interfaces
interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
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
  createdAt: Date;
  updatedAt: Date;
}

interface ITag extends Document {
  _id: Types.ObjectId;
  tagID: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IType extends Document {
  _id: Types.ObjectId;
  type: PostType; // enforce the enum here
  createdAt: Date;
  updatedAt: Date;
}

interface IMediaAsset extends Document {
  _id: Types.ObjectId; // MongoDB-generated ObjectId
  mediaId: string; // Custom string field, replacing 'id'
  url: string;
  altText: string;
  uploadedBy: string;
  postId: string;
  type: "image" | "video" | "file";
  createdAt: Date;
  updatedAt: Date;
}

interface IComment extends Document {
  _id: Types.ObjectId;
  postId: string;
  author: {
    id: string;
    name: string;
  };
  content: string;
  createdAt: Date;
  updatedAt: Date;
  approved: boolean;
}

interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  summary: string;
  date: Date;
  authorId: string;
  categories: ICategory[];
  tags: ITag[];
  types: IType[];
  coverImage: string;
  gallery: string[];
  minuteRead: number;
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  commentsCount: number;
  status: "draft" | "published";
}

// interface ISEO extends Document {
//   title: string;
//   description: string;
//   keywords: string[];
//   canonicalUrl: string;
//   createdAt: string;
//   updatedAt: string;
// }

interface IPortfolio extends Document {
  _id: Types.ObjectId;
  name: string;
  bio: string[];
  portraitUrl: string;
  experiences: {
    title: string;
    year: string;
    isWorking: number;
    company: string;
    location: string;
    role: string;
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
  _id: Types.ObjectId;
  title: string;
  company: string;
  skills: string[];
  isWorking: number;
  year: string;
  description: string[];
  location: string;
  role: string;
  period: string;
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

interface IContactDetails {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  twitter: string;
  website: string;
  buyCoffee: string;
}

interface IAuthor extends Document {
  _id: Types.ObjectId;
  authorId: string;
  authorName: string;
  authorProfession: string;
  userId: Types.ObjectId;
  contactDetails: IContactDetails;
  createdAt: Date;
  updatedAt: Date;
}

// Draft interface
export interface IDraftDoc extends Document {
  _id: string;
  title: string;
  summary?: string;
  content?: string;
  categories?: string[];
  tags?: string[];
  types?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  authorId?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
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
export type IContactDetailsDoc = IContactDetails;
export type IAuthorDoc = IAuthor & Document;
// export type ISEODoc = ISEO & Document;

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    role: { type: String, enum: ["admin", "user", "guest"], default: "user" },
    contactDetails: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      linkedin: { type: String, required: true },
      github: { type: String, required: true },
      twitter: { type: String, required: true },
      website: { type: String, required: true },
      buyCoffee: { type: String, required: true },
    },
  },
  defaultOptions
);

const CategorySchema = new Schema<ICategory>(
  {
    catID: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
  },
  defaultOptions
);

const TagSchema = new Schema<ITag>(
  {
    tagID: { type: String, required: true },
    name: { type: String, required: true },
  },
  defaultOptions
);

const TypeSchema = new Schema<IType>(
  {
    type: {
      type: String,
      required: true,
      enum: Object.values(PostType), // enforce enum
    },
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
  },
  { timestamps: true }
);

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: String, required: true },
    author: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
    content: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  defaultOptions
);

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    summary: { type: String, required: false },
    date: { type: Date, required: true },
    authorId: { type: String, required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    types: [{ type: Schema.Types.ObjectId, ref: "Type" }],
    coverImage: { type: String, required: false, default: "/default-cover.jpg" }, // Made optional with default
    gallery: [{ type: String }],
    minuteRead: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    // seo: {
    //   title: { type: String, },
    //   description: { type: String },
    //   keywords: [{ type: String }],
    //   canonicalUrl: { type: String },
    //   createdAt: { type: String },
    //   updatedAt: { type: String },
    // },
  },
  { timestamps: true }
);


const PortfolioSchema = new Schema<IPortfolio>(
  {
    name: { type: String, required: true },
    bio: [{ type: String, required: true }],
    portraitUrl: { type: String, required: true },
    experiences: [
      {
        title: { type: String, required: true },
        role: { type: String, required: true },
        company: { type: String, required: true },
        isWorking: { type: Number, required: true },
        location: { type: String, required: true },
        description: [{ type: String, required: true }],
        period: { type: String, required: true },
        year: { type: String, required: true },
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
    role: { type: String, required: true },
    company: { type: String, required: true },
    isWorking: { type: Number, required: true },
    location: { type: String, required: true },
    description: [{ type: String, required: true }],
    period: { type: String, required: true },
    year: { type: String, required: true },
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
      buyCoffee: { type: String, required: true },
    },
  },
  defaultOptions
);

// Draft schema
const DraftSchema = new Schema<IDraftDoc>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  summary: {
    type: String,
    trim: true,
    maxlength: 500
  },
  content: {
    type: String,
    trim: true
  },
  categories: [{
    type: String,
    ref: 'Category'
  }],
  tags: [{
    type: String,
    ref: 'Tag'
  }],
  types: [{
    type: String,
    ref: 'Type'
  }],
  seoTitle: {
    type: String,
    trim: true,
    maxlength: 200
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: 500
  },
  seoKeywords: [{
    type: String,
    trim: true
  }],
  authorId: {
    type: String,
    ref: 'Author',
    sparse: true // Allows null for anonymous drafts
  },
  sessionId: {
    type: String,
    sparse: true // For anonymous users
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index for auto-deletion
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
DraftSchema.index({ authorId: 1, updatedAt: -1 });
DraftSchema.index({ sessionId: 1, updatedAt: -1 });
DraftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to update the updatedAt field
DraftSchema.pre('save', function (this: IDraftDoc, next) {
  this.updatedAt = new Date();
  next();
});


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
export const MediaAsset: Model<IMediaAssetDoc> =
  mongoose.models.MediaAsset ||
  mongoose.model<IMediaAssetDoc>("MediaAsset", MediaAssetSchema);
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
export const Draft: Model<IDraftDoc> = mongoose.models.Draft || mongoose.model<IDraftDoc>('Draft', DraftSchema);
// export const SEO: Model<ISEODoc> =
//   mongoose.models.SEO || mongoose.model<ISEODoc>("SEO", SEOSchema);





// Export the model
