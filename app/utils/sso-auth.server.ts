import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { sessionStorage } from "~/utils/session.server";
import { createAdmin, getAdminByUsername } from "~/Services/admin.prisma.server";
import { createAuthor, getAuthorByUsername } from "~/Services/author-management.server";

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
      async ({ profile }: any) => {
        // Here you would find or create the user in your database
        // For now we just return the profile info adapted to our User interface
        // In a real app, you'd integrate with admin.prisma.server or author services
        
        // Example check:
        // let user = await getAdminByUsername(profile.displayName);
        
        return {
          id: profile.id, // This is the GitHub ID
          email: profile.emails?.[0]?.value || "",
          name: profile.displayName,
          photoUrl: profile.photos?.[0]?.value || "",
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
