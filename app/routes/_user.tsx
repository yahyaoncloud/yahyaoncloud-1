// routes/_user.tsx
import { json } from "@remix-run/node";
import { apiGetTopPosts } from "../apis/posts.api";
import { getAuthorByAuthorId } from "../Services/post.server";
import { Author, Post } from "../Types/types";
import UserLayout from "../components/layouts/UserLayout";
import { ThemeProvider, useTheme } from "../Contexts/ThemeContext";
import { Outlet } from "@remix-run/react";

interface RootLoaderData {
  data: {
    posts: Post[];
    author: Author | null;
  };
  message: string | null;
  isEmpty: boolean;
}

export async function loader() {
  try {
    const postsRes = await apiGetTopPosts(3);

    if (postsRes.status === "error") {
      return json(
        {
          data: { posts: [], author: null },
          message: postsRes.message,
          isEmpty: false,
        },
        { status: 500 }
      );
    }

    let author = null;
    if (postsRes.data && postsRes.data.length > 0) {
      // Only fetch author if there are posts
      author = await getAuthorByAuthorId(postsRes.data[0].authorId);
      if (!author) {
        console.warn("Author not found for top posts");
      }
    }

    if (postsRes.meta?.isEmpty) {
      console.warn("No top posts found");
    }

    return json(
      {
        data: {
          posts: postsRes.data || [],
          author: author || null,
        },
        message: postsRes.meta?.isEmpty ? postsRes.message : null,
        isEmpty: postsRes.meta?.isEmpty || false,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching top posts:", error);
    return json(
      {
        data: { posts: [], author: null },
        message: "Unexpected error occurred",
        isEmpty: false,
      },
      { status: 500 }
    );
  }
}

function ThemedContainer() {
  const { theme } = useTheme();

  return (
    <div className="bg-background dark:bg-slate-900">
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