import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { connectDB } from "~/lib/db/mongoose.server";
import { getPostModel } from "~/models/Posts";
import "../tailwind.css";
import Blog from "./blog";
import MainLayout from "~/components/layouts/MainLayout";
import Admin from "./admin";
import { ThemeProvider } from "~/Contexts/ThemeContext";
import Homepage from "./admin.home";

export const loader: LoaderFunction = async () => {
  await connectDB();
  const Post = await getPostModel();
  const posts = await Post.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  console.log(posts);

  return json({ posts });
};

export default function Index() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <>
      <Outlet />
    </>
  );
}
