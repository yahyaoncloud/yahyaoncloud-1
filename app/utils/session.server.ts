// app/session.server.ts
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { environment } from "../environments/environment";

const sessionSecret = environment.SESSION_SECRET || "default_secret";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "token", // Match backend cookie name
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: environment.NODE_ENV === "production", // Disable secure in development
    maxAge: 60 * 60 * 24, // 1 day
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export async function createAdminSession(token: string, redirectTo: string) {
  const session = await getSession();
  session.set("token", token);
  const cookie = await commitSession(session);
  return redirect(redirectTo, { headers: { "Set-Cookie": cookie } });
}

export async function getTokenFromSession(
  request: Request
): Promise<string | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  console.log("Session token:", token); // Debug log
  return token || null;
}

export async function destroyUserSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/admin/login", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}

export async function requireUserSession(request: Request) {
  const token = await getTokenFromSession(request);
  if (!token) {
    throw redirect("/admin/login");
  }
  return token;
}

export async function createUserSession2(
  token: { token: string },
  redirectTo: string
) {
  try {
    const session = await getSession();
    session.set("token", token.token);
    const cookie = await commitSession(session);
    return redirect(redirectTo, {
      headers: { "Set-Cookie": cookie },
    });
  } catch (error) {
    console.error("Session creation error:", error);
    throw error;
  }
}
