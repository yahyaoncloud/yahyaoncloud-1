/**
 * Project: yahyaoncloud Official Blog Platform
 * File: app/lib/auth/session.server.ts
 * Description: Session storage configuration for authentication
 */

import { createCookieSessionStorage } from "@remix-run/node";

// Session storage configuration
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__tunkstun_session", // unique name for the cookie
    httpOnly: true, // prevents client-side JavaScript from accessing the cookie
    path: "/", // cookie is valid for all routes
    sameSite: "lax", // CSRF protection
    secrets: [process.env.SESSION_SECRET || "s3cr3t"], // use env variable in production
    secure: process.env.NODE_ENV === "production", // cookie only works in HTTPS in production
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
  },
});

// Helper functions to manage the session
export const { getSession, commitSession, destroySession } = sessionStorage;

// Convenience function to get the user session
export async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

// Convenience function to logout the user
export async function logout(request: Request) {
  const session = await getUserSession(request);
  return {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  };
}
