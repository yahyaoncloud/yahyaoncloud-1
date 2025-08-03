import { LoaderFunction, redirect } from "@remix-run/node";
import { getSession, commitSession } from "../utils/session.server";
import { environment } from "../environments/environment";

export async function requireAuth(request: Request) {
  const session = await getSession(request);
  const token = session.get("token");

  if (!token) {
    return redirect("/login", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  try {
    const response = await fetch(
      `${environment.GO_BACKEND_URL}/api/validate-token`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      return redirect("/login", {
        headers: { "Set-Cookie": await commitSession(session) },
      });
    }

    return await response.json(); // Return user data
  } catch (error) {
    console.error("Token validation error:", error);
    return redirect("/login", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }
}
