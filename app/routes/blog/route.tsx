import { Outlet, useLocation } from "@remix-run/react";
import { ThemeProvider, useTheme } from "../../Contexts/ThemeContext";
import UserLayout from "../../components/layouts/UserLayout";
import { json } from "@remix-run/node";
import { getAuthorByAuthorId, getTopPosts } from "../../Services/post.server";
import { Author, Post } from "../../Types/types";
import Blog from "./blog";

export async function loader() {
  try {
    const posts = await getTopPosts(3);

    if (!posts?.length) {
      throw new Response("No posts found", { status: 404 });
    }

    const author = await getAuthorByAuthorId(posts[0].authorId);

    if (!author) {
      throw new Response("Author not found", { status: 404 });
    }

    return json({
      data: {
        posts,
        author,
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

function ThemedContainer({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className="bg-background dark:bg-slate-900">
      <main>
        <UserLayout>{children}</UserLayout>
      </main>
    </div>
  );
}

export default function Home() {
  const location = useLocation();

  const isBlogRoute = location.pathname.startsWith("/blog");

  return (
    <ThemeProvider>
      {isBlogRoute ? (
        <ThemedContainer>
          {/* <Blog /> */}
          <Outlet />
        </ThemedContainer>
      ) : (
        <Outlet />
      )}
    </ThemeProvider>
  );
}
