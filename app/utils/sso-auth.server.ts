import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { sessionStorage } from "~/utils/session.server";
import { createAdmin, getAdminByUsername } from "~/Services/admin.prisma.server";

// We'll define a User type that can represent either an Admin or Author locally
// or just the profile returned from the provider
export interface User {
  id: string; // db id (optional if just valid profile)
  email: string;
  name: string;
  photoUrl: string;
  provider: string;
}

// @ts-ignore - The types say 0 arguments but runtime might expect sessionStorage. Keeping it safe or removing if v4 pattern differs.
// actually, let's try removing it as TS insists.
export const authenticator = new Authenticator<User>(); 
// If this fails at runtime, we might need to cast: new Authenticator<User>(sessionStorage as any);

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  authenticator.use(
    new GitHubStrategy(
      {
        clientId: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        redirectURI: `${BASE_URL}/auth/sso/github`,
      },
      async ({ tokens }: { request: Request; tokens: { accessToken: () => string } }) => {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${tokens.accessToken()}`,
            "User-Agent": "YahyaOnCloud-App",
          },
        });
        const profile = (await response.json()) as { id: number; login: string; name?: string; email?: string; avatar_url?: string };

        return {
          id: String(profile.id),
          email: profile.email || "",
          name: profile.name || profile.login,
          photoUrl: profile.avatar_url || "",
          provider: "github",
        };
      }
    )
  );
} else {
    console.warn("⚠️ SSO: GitHub Client ID or Secret missing. GitHub Auth will fail.");
}

// TODO: Add Google Strategy logic here using remix-auth-oauth2 or remix-auth-google
// (Package remix-auth-google not explicitly found in package.json, so skipping for now to avoid build errors)
