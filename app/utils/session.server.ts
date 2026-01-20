import { createCookieSessionStorage, redirect } from "@remix-run/node";
export { destroyAdminSession } from "./admin-auth.server";

// Export the session storage object
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "s3cr3t"],
    secure: process.env.NODE_ENV === "production",
  },
});

// Helper to get session object
export function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

// Helper to commit session
export function commitSession(session: any) {
  return sessionStorage.commitSession(session);
}

// Helper to destroy session
export function destroySession(session: any) {
  return sessionStorage.destroySession(session);
}

// RESTORED: getUser functionality for Firebase Auth (from auth/login.tsx inference)
export async function getUser(request: Request) {
  const session = await getSession(request);
  const user = session.get("user");
  return user || null;
}
