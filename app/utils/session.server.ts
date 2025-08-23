// utils/session.server.ts
import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "yahyaoncloud";
if (!sessionSecret || sessionSecret === "yahyaoncloud") {
  console.warn(
    "SESSION_SECRET is not set or is using default value. Set a secure secret in production."
  );
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__firebase_session",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600, // 1 hour
  },
});

// FIXED: Accept the cookie string directly instead of the request object
export async function getSession(cookieHeader: string | null) {
  return sessionStorage.getSession(cookieHeader);
}

export async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function getUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return session.get("user") || null;
}

/**
 * Retrieve the session and ensure there is an admin user.
 * Returns `{ session, user }` if admin user is present, otherwise redirects.
 */
export async function getAdminSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  // If there's no user or they're not admin, redirect to login
  if (
    !user ||
    (!user.isAdmin &&
      !["johnwick4learning@gmail.com", "ykinwork1@gmail.com"].includes(user.email))
  ) {
    throw redirect("/admin/login");
  }

  return { session, user };
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    const session = await getSession(request.headers.get("Cookie"));
    throw redirect("/guestbook/login", {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    });
  }
  return user;
}

export async function requireAdminUser(request: Request) {
  // This is essentially similar to getAdminSession but returns only user
  const { user } = await getAdminSession(request);
  return user;
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/guestbook/login", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}

/**
 * Destroy admin session and redirect to admin login
 * Use this instead of logout() for admin-specific logout
 */
export async function destroyAdminSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/admin/login", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}

export async function commitSession(session: any) {
  return sessionStorage.commitSession(session);
}

export async function createUserSession(userData: any, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("user", userData);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}