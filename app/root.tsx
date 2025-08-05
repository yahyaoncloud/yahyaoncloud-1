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
  return json({
    theme: "dark",
    FIREBASE_CONFIG: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
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
    <html lang="en">
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
          <Toaster position="top-right" richColors />
          <ScrollRestoration />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify({
                FIREBASE_CONFIG: useLoaderData().FIREBASE_CONFIG,
              })}`,
            }}
          />

          <Scripts />

          {/* <LiveReload /> */}
        </ThemeProvider>
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error("ErrorBoundary caught:", error);

  let status = 500;
  let message = "Something went wrong";

  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    "statusText" in error
  ) {
    status = (error as any).status;
    message = (error as any).statusText;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{`${status} - ${message}`}</title>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800">{status}</h1>
          <p className="text-lg text-gray-500 mt-2">{message}</p>
          <a
            href="/"
            className="mt-4 text-blue-500 hover:text-blue-600 underline"
          >
            Back to Home
          </a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
