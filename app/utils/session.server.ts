// app/utils/session.server.ts
import { createCookieSessionStorage } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET!;
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__firebase_session",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    maxAge: 3600, // 1 hour
  },
});

export async function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getUser(request: Request) {
  const session = await getUserSession(request);
  return session.get("user");
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return sessionStorage.destroySession(session);
}
