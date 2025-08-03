// app/routes/auth.github.callback.tsx
import { json, redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { createUserSession2 } from "../../utils/session.server";
import { environment } from "../../environments/environment";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const code = formData.get("code")?.toString();
  if (!code) {
    throw new Response("Missing code parameter", { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: environment.GITHUB_CLIENT_ID,
          client_secret: environment.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: environment.GITHUB_CALLBACK_URL,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const { access_token } = await tokenResponse.json();

    // Fetch user data from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user data");
    }

    const userData = await userResponse.json();

    // Generate JWT on the frontend (or call backend to generate it)
    const backendResponse = await fetch(
      `${environment.GO_BACKEND_URL}/auth/github/callback`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubId: userData.id,
          username: userData.login,
          email: userData.email || `${userData.login}@github.com`,
        }),
      }
    );

    if (!backendResponse.ok) {
      throw new Error("Failed to generate JWT from backend");
    }

    const { token } = await backendResponse.json();

    // Store token in session
    return await createUserSession2({ token }, "/admin/blog");
  } catch (error) {
    console.error("GitHub callback error:", error);
    return json({ error: error.message }, { status: 500 });
  }
};

export default function GitHubCallback() {
  return <div>Authenticating...</div>;
}
