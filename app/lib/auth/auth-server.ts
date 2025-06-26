/**
 * Project: yahyaoncloud Official Blog Platform
 * File: app/lib/auth/auth.server.ts
 * Description: Authentication setup using Remix Auth with GitHub OAuth
 */

import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { sessionStorage } from "./session.server";

// Define the user type
export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

// Create an authenticator
export const authenticator = new Authenticator<User>(sessionStorage);

// GitHub OAuth strategy
const gitHubStrategy = new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    callbackURL:
      process.env.GITHUB_CALLBACK_URL ||
      "http://localhost:3000/auth/github/callback",
  },
  async ({ accessToken, extraParams, profile }) => {
    // Only allow specific GitHub user
    if (profile.displayName !== "tunkstun" && profile.username !== "tunkstun") {
      throw new Error("Unauthorized: Only the owner can access admin panel");
    }

    // Return user data
    return {
      id: profile.id,
      email: profile.emails?.[0]?.value || "",
      username: profile.username || profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
);

// Register the strategy with the authenticator
authenticator.use(gitHubStrategy);

// Helper function to check if user is authenticated
export async function requireUser(request: Request) {
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return user;
}

// Helper function to check if user is admin
export async function requireAdmin(request: Request) {
  const user = await requireUser(request);

  // Only allow specific user to access admin panel
  if (user.username !== "tunkstun" && user.email !== "ykinwork1@gmail.com") {
    throw new Response("Forbidden: Admin access required", { status: 403 });
  }

  return user;
}
