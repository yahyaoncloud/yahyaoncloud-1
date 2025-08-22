import { Authenticator } from "remix-auth";
import { OAuth2Strategy, CodeChallengeMethod } from "remix-auth-oauth2";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { User, IUserDoc } from "../models";

// Session Storage
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "default-secret"],
    secure: process.env.NODE_ENV === "production",
  },
});

export const authenticator = new Authenticator<IUserDoc>();

// Set session strategy
authenticator.use(sessionStorage);

// SSO Strategy
const ssoStrategy = new OAuth2Strategy(
  {
    cookie: "oauth2",
    clientId: process.env.SSO_CLIENT_ID || "your-client-id",
    clientSecret: process.env.SSO_CLIENT_SECRET || "your-client-secret",
    authorizationEndpoint:
      process.env.SSO_AUTH_URL || "https://your-sso-provider/auth",
    tokenEndpoint:
      process.env.SSO_TOKEN_URL || "https://your-sso-provider/token",
    redirectURI:
      process.env.SSO_CALLBACK_URL || "http://localhost:3000/auth/sso/callback",
    tokenRevocationEndpoint: "https://your-sso-provider/revoke", // Optional
    scopes: ["openid", "email", "profile"], // Optional
    codeChallengeMethod: CodeChallengeMethod.S256, // Optional, for PKCE
  },
  async ({ tokens }) => {
    const { accessToken } = tokens;
    const response = await fetch("https://your-sso-provider/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch user info");
    const profile = await response.json();

    let user = (await User.findOne({ email: profile.email })) as IUserDoc;
    if (!user) {
      user = new User({
        username: profile.name || profile.email.split("@")[0],
        email: profile.email,
        password: "sso-generated", // Securely handle or omit
        role: "user",
      }) as IUserDoc;
      await user.save();
    }
    return user;
  }
);

// Register the strategy with a name
authenticator.use(ssoStrategy, "sso");

// Login Function
export const login = async (request: Request) => {
  return authenticator.authenticate("sso", request, {
    successRedirect: "/admin",
    failureRedirect: "/login",
  });
};

// Logout Function
export const logout = async (request: Request) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
};

// SSO Callback Function
export const ssoCallback = async (request: Request) => {
  try {
    await authenticator.authenticate("sso", request, {
      successRedirect: "/admin",
      failureRedirect: "/login",
    });
  } catch (error) {
    console.error("SSO Callback Error:", error);
    return redirect("/login");
  }
};

// Get Current User
export const getCurrentUser = async (request: Request) => {
  try {
    return await authenticator.authenticate("sso", request);
  } catch {
    return null; // Guest user for public routes
  }
};

// Action Handlers with Login Prompt
export const likePost = async (request: Request) => {
  const user = await getCurrentUser(request);
  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/login?redirect=${url.pathname}`);
  }
  // Add like logic here (e.g., update Post model)
  return { success: true };
};

export const addComment = async (
  postId: string,
  content: string,
  request: Request
) => {
  const user = await getCurrentUser(request);
  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/login?redirect=${url.pathname}`);
  }
  // Add comment logic here (e.g., create Comment model)
  return { success: true, postId, content };
};

export const addGuestbookMessage = async (
  content: string,
  request: Request
) => {
  const user = await getCurrentUser(request);
  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/login?redirect=${url.pathname}`);
  }
  // Add guestbook logic here (e.g., create Guestbook model)
  return { success: true, content };
};
