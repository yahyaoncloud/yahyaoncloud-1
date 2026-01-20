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

import "./styles/tailwind.css";
import { ThemeProvider, useTheme } from "./Contexts/ThemeContext";

export const meta: MetaFunction = () => {
  return [
    { title: "YahyaOnCloud Blog" },
    {
      name: "description",
      content: "Yahya's blog website",
    },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { property: "og:title", content: "yahyaoncloud blog" },
    {
      property: "og:description",
      content: "Yahya's blog website",
    },
    { property: "og:type", content: "website" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    theme: "dark",
    ENV: {
      FIREBASE_CONFIG: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
      },
    },
  });
}

function RootLayout() {
  const { ENV } = useLoaderData<typeof loader>();
  const { theme } = useTheme();

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
        (function() {
          try {
            var theme = localStorage.getItem('theme');
            if (!theme) theme = 'dark'; // default theme
            if (theme === 'dark') document.documentElement.classList.add('dark');
          } catch(e) {}
        })();
      `,
          }}
        />
      </head>

      <body
        className={`dark:bg-zinc-900 dark:text-zinc-100 bg-zinc-50 text-zinc-800 min-h-screen transition-colors duration-300`}
      >
        <Outlet />
        <Toaster position="top-right" richColors theme={theme as "light" | "dark" | "system"} />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)};`,
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RootLayout />
    </ThemeProvider>
  );
}

// export function ErrorBoundary() {
//   const error = useRouteError();
//   console.error("ErrorBoundary caught:", error);

//   let status = 500;
//   let message = "Something went wrong";

//   if (
//     error &&
//     typeof error === "object" &&
//     "status" in error &&
//     "statusText" in error
//   ) {
//     status = (error as any).status;
//     message = (error as any).statusText;
//   }

  return (
    <ThemeProvider>
      <html lang="en" className="dark">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>{`${status} - ${message}`}</title>
          <Meta />
          <Links />
        </head>
        <body className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-zinc-800 dark:text-indigo-100">
              {status}
            </h1>
            <p className="text-lg text-zinc-500 dark:text-indigo-300 mt-2">
              {message}
            </p>
            <a
              href="/"
              className="mt-4 text-indigo-500 dark:text-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-900 underline"
            >
              Back to Home
            </a>
          </div>
          <Scripts />
        </body>
      </html>
    </ThemeProvider>
  );
}
