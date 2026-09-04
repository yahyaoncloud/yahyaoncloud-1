import { createCookieSessionStorage, redirect, type Session } from "@remix-run/node";
export { destroyAdminSession } from "./admin-auth.server";

const SESSION_SECRET = process.env.SESSION_SECRET || (
  process.env.NODE_ENV === "production"
    ? (() => { throw new Error("Security Error: SESSION_SECRET must be defined in production!"); })()
    : "s3cr3t-dev-fallback"
);

// Export the session storage object
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

// Helper to get session object
export function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

// Helper to commit session
export function commitSession(session: Session) {
  return sessionStorage.commitSession(session);
}

// Helper to destroy session
export function destroySession(session: Session) {
  return sessionStorage.destroySession(session);
}

// RESTORED: getUser functionality for Firebase Auth (from auth/login.tsx inference)
export async function getUser(request: Request) {
  const session = await getSession(request);
  const user = session.get("user");
  return user || null;
}

// Helper to logout
export async function logout(request: Request, redirectTo: string = "/login") {
  const session = await getSession(request);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

