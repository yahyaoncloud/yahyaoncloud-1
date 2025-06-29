/**
 * Project: yahyaoncloud Official Blog Platform
 * File: app/root.tsx
 * Description: Main root layout for the entire application
 */

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Toaster } from "sonner";
import { useEffect } from "react";
import AOS from "aos";

// Import styles
import "./styles/tailwind.css";
import { ThemeProvider } from "./Contexts/ThemeContext";
import NotFound from "./routes/404";

export const meta: MetaFunction = () => {
  return [
    { title: "YahyaOnCloud Blog" },
    {
      name: "description",
      content: "yahyaoncloud Official Blog Platform built with RemixJS",
    },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { property: "og:title", content: "yahyaoncloud Official Blog" },
    {
      property: "og:description",
      content: "yahyaoncloud Official Blog Platform built with RemixJS",
    },
    { property: "og:type", content: "website" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // You can add server-side logic here to determine theme
  // For now, we'll default to dark mode
  return json({
    theme: "dark",
  });
}

export default function App() {
  const { theme } = useLoaderData<typeof loader>();

  // Initialize AOS (Animate on Scroll)
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <html lang="en" className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className={`${
          theme === "dark"
            ? "bg-dark-900 text-dark-100"
            : "bg-white text-dark-800"
        } min-h-screen transition-colors duration-300`}
      >
        <ThemeProvider>
          <Outlet />
        </ThemeProvider>
        <Toaster position="top-right" richColors />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  let status = 500;
  let statusText = "Something went wrong";

  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    "statusText" in error
  ) {
    status = (error as any).status;
    statusText = (error as any).statusText;
  }

  return (
    <html lang="en">
      <head>
        <title>{status} - Not Found</title>
      </head>
      <body>
        <NotFound />
        <main className="flex flex-col items-center justify-center h-screen text-center"></main>
        <Scripts />
      </body>
    </html>
  );
}
