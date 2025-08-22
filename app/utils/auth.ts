import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { createCookieSessionStorage } from "@remix-run/node";
import { User, IUserDoc } from "../models";

// Session Storage
export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secrets: [process.env.SESSION_SECRET || "default-secret"],
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60, // 24 hours
    },
});

export const authenticator = new Authenticator<IUserDoc>(sessionStorage);

// GitHub SSO Strategy
authenticator.use(
    new OAuth2Strategy(
        {
            clientId: process.env.GITHUB_CLIENT_ID || "your-client-id",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "your-client-secret",
            authorizationEndpoint: "https://github.com/login/oauth/authorize",
            tokenEndpoint: "https://github.com/login/oauth/access_token",
            redirectURI: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback",
            scopes: ["user:email"],
            codeChallengeMethod: "S256",
        },
        async ({ tokens }) => {
            const response = await fetch("https://api.github.com/user", {
                headers: { Authorization: `Bearer ${tokens.accessToken}` },
            });
            if (!response.ok) throw new Error("Failed to fetch GitHub user info");
            const profile = await response.json();
            if (profile.email !== "johnwick4learning@gmail.com") {
                throw new Error("Unauthorized email");
            }
            let user = (await User.findOne({ email: profile.email })) as IUserDoc;
            if (!user) {
                user = new User({
                    username: profile.login || profile.email.split("@")[0],
                    email: profile.email,
                    password: "sso-generated",
                    role: "admin",
                }) as IUserDoc;
                await user.save();
            }
            return user;
        }
    ),
    "github"
);

// Google SSO Strategy
authenticator.use(
    new OAuth2Strategy(
        {
            clientId: process.env.GOOGLE_CLIENT_ID || "your-client-id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "your-client-secret",
            authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
            tokenEndpoint: "https://oauth2.googleapis.com/token",
            redirectURI: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
            scopes: ["openid", "email", "profile"],
            codeChallengeMethod: "S256",
        },
        async ({ tokens }) => {
            const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokens.accessToken}` },
            });
            if (!response.ok) throw new Error("Failed to fetch Google user info");
            const profile = await response.json();
            if (profile.email !== "ykinwork1@gmail.com") {
                throw new Error("Unauthorized email");
            }
            let user = (await User.findOne({ email: profile.email })) as IUserDoc;
            if (!user) {
                user = new User({
                    username: profile.name || profile.email.split("@")[0],
                    email: profile.email,
                    password: "sso-generated",
                    role: "admin",
                }) as IUserDoc;
                await user.save();
            }
            return user;
        }
    ),
    "google"
);

// Login Function
export const login = async (request: Request, provider: "github" | "google") => {
    return authenticator.authenticate(provider, request, {
        successRedirect: "/admin",
        failureRedirect: "/admin/login",
    });
};

// Logout Function
export const logout = async (request: Request) => {
    return authenticator.logout(request, { redirectTo: "/admin/login" });
};

// Get Current User
export const getCurrentUser = async (request: Request) => {
    try {
        const session = await sessionStorage.getSession(request.headers.get("Cookie"));
        const user = session.get(authenticator.sessionKey);
        return user || null;
    } catch {
        return null;
    }
};
