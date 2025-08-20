import { Outlet } from "@remix-run/react";
import { ThemeProvider, useTheme } from "../Contexts/ThemeContext";
import UserLayout from "../components/layouts/UserLayout";
import { json } from "@remix-run/node";
import { getAuthorByAuthorId, getTopPosts } from "../Services/post.server"; // adjust import path
import { Author, Post } from "../Types/types";

export async function loader() {
  try {
    const posts = await getTopPosts(3);

    if (!posts || posts.length === 0) {
      throw new Response("No posts found", { status: 404 });
    }

    // Fetch author details for the first post
    const author = await getAuthorByAuthorId(posts[0].authorId);

    if (!author) {
      throw new Response("Author not found", { status: 404 });
    }

    // console.log("Author contact details:", author);

    return json({
      data: {
        posts,
        author, // return full author object, not just contact
      },
    });
  } catch (error: unknown) {
    if (error instanceof Response) {
      throw error;
    }
    console.error("Error fetching top posts:", error);
    throw new Response("Failed to fetch top posts", { status: 500 });
  }
}

function ThemedContainer() {
  const { theme } = useTheme(); // get theme state

  return (
    <div className="bg-background dark:bg-zinc-950">
      <main>
        <UserLayout>
          <Outlet />
        </UserLayout>
      </main>
    </div>
  );
}

export default function User() {
  return (
    <ThemeProvider>
      <ThemedContainer />
    </ThemeProvider>
  );
}
