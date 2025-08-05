import { PostType } from "../constants/Constants";
export type Post = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  date: Date;
  // author: Author;
  authorId: string;
  categories: Category[];
  tags: Tag[];
  types: Type;
  coverImage: string;
  gallery: MediaAsset[];
  minuteRead: number;
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  commentsCount: number;
  status: "draft" | "published";
  seo: SEO;
};

export type Type = {
  _id: string;
  type: PostType;
  createdAt: string;
  updatedAt?: string;
};

export type Category = {
  _id?: string;
  catID?: string;
  name: string;
  slug?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Tag = {
  _id: string;
  tagID?: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
};

export type Comment = {
  _id: string;
  postId: string;
  author: {
    id: string;
    name: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  approved: boolean;
};

export type SEO = {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  createdAt: string;
  updatedAt?: string;
};

export type MediaAsset = {
  id: string;
  url: string;
  altText?: string;
  uploadedBy: string;
  postId?: string;
  type: "image" | "video" | "file";
  createdAt: string;
  updatedAt?: string;
};

export type GUser = {
  name: string;
  email: string;
  date: number; 
  message: string;
};

export type ContactDetails = {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  twitter: string;
  website: string;
  createdAt: string;
  updatedAt?: string;
};

export type Author = {
  _id: string;
  authorId: string;
  authorName: string;
  authorProfession: string;
  userId: string;
  contactDetails: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    twitter: string;
    website: string;
    createdAt: string;
    updatedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
};
