// utils/github.server.tsx
import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { sessionStorage } from "./session.server";

type User = { id: string; username: string; avatar?: string };

export const authenticator = new Authenticator<User>(sessionStorage);

// Derive BASE_URL safely for both dev and prod
const inferredBase =
  process.env.BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT ?? 5173}`);

const callbackURL =
  process.env.GITHUB_CALLBACK_URL ?? `${inferredBase}${process.env.GITHUB_CALLBACK_PATH ?? "/auth/github/callback"}`;

console.log("[OAuth] redirect_uri:", callbackURL); // keep for debugging

authenticator.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL,
    },
    async ({ profile }) => {
      // Map GitHub profile to your user
      return {
        id: profile.id,
        username: profile._json.login,
        avatar: profile._json.avatar_url,
      };
    }
  ),
  "github"
);
