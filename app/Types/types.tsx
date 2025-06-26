export type Post = {
  id: string;
  title: string;
  content: string;
  summary: string;
  type: "article" | "news" | "tutorial";
  date: string;
  authorId: string;
  categoryId?: string;
  tags?: Tag[];
  coverImage?: MediaAsset;
  gallery?: MediaAsset[];
  createdAt: string;
  updatedAt?: string;
};

export type Category = {
  id?: string;
  catID?: string;
  name: string;
  slug?: string;
  // createdAt?: string;
  // updatedAt?: string;
};
export type Tag = {
  id: string;
  tagID?: string;
  name: string;
};

export type Comment = {
  id: string;
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
};

export type MediaAsset = {
  id: string;
  url: string;
  altText?: string;
  uploadedBy: string;
  postId?: string; // optional: reverse lookup
  type: "image" | "video" | "file";
  createdAt: string;
};
