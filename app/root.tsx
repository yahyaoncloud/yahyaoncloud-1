import {
  Meta,
  Links,
  Outlet,
  Scripts,
  ScrollRestoration,
  LiveReload,
} from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

// Optional: Global CSS via import (e.g., Tailwind)
import "./styles/tailwind.css";

export const meta: MetaFunction = () => [
  { title: "My Remix App" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { name: "description", content: "A Remix application" },
];

export default function App() {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {/* <LiveReload /> */}
      </body>
    </html>
  );
}
