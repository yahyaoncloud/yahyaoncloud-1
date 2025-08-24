import { Outlet } from "@remix-run/react";
import { ThemeProvider, useTheme } from "../Contexts/ThemeContext";
import UserLayout from "../components/layouts/UserLayout";
import { json } from "@remix-run/node";
import { getAuthorByAuthorId, getTopPosts } from "../Services/post.server";
import { Author, Post } from "../Types/types";
import BackgroundDark from "../assets/Gemini_Generated_Image_96zg1h96zg1h96zg.jpg";

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

function ThemedContainer() {
  const { theme, isDark } = useTheme(); // Use isDark and theme from useTheme
  const isDarkTheme = isDark !== undefined ? isDark : theme === 'dark'; // Fallback to theme === 'dark'

  return (
    <div className="relative min-h-screen transition-all ease-in-out duration-200">
      {/* Background images with crossfade transition */}
      <img
        key="dark-bg"
        src={BackgroundDark}
        alt="Dark Background"
        className={`fixed inset-0 w-full h-full object-cover -z-10 transition-opacity duration-500 ease-in-out ${isDarkTheme ? 'opacity-100' : 'opacity-0'
          }`}
      />
      <img
        key="bright-bg"
        src={BackgroundDark} // Fixed incorrect src
        alt="Bright Background"
        className={`fixed inset-0 w-full h-full object-cover -z-10 transition-opacity duration-500 ease-in-out ${isDarkTheme ? 'opacity-0' : 'opacity-100'
          }`}
      />

      {/* Overlay for readability with smooth transition */}
      <div
        className={`fixed inset-0 -z-15 transition-opacity duration-500 ease-in-out dark:bg-zinc-950/95 bg-white/95
          }`}
      />

      {/* New overlay for readability (no blending, using Tailwind colors) */}
      {/* <div
        className={`fixed inset-0 -z-10 transition-opacity duration-500 ease-in-out ${isDarkTheme ? 'bg-black/30' : 'bg-white/30'
          }`}
      /> */}


      {/* Main content */}
      <main className="relative z-10">
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