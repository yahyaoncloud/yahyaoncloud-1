// routes/admin_.login.tsx
import React, { useState, useEffect } from "react";
import { Github, Chrome, CheckCircle, AlertCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "~/Contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "~/assets/yoc-logo.png";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { auth, googleProvider, githubProvider } from "~/utils/firebase.client";
import { signInWithPopup } from "firebase/auth";
import { getUser, sessionStorage } from "~/utils/session.server";
import { Link } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getUser(request);
    if (user?.isAdmin) return redirect("/admin");
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    return json({
        ENV: {
            FIREBASE_CONFIG: {
                apiKey: process.env.FIREBASE_API_KEY,
                authDomain: process.env.FIREBASE_AUTH_DOMAIN,
                projectId: process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.FIREBASE_APP_ID,
            },
        },
        error: session.get("error"),
    });
};

export default function LoginPage() {
    const { theme, toggleTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const fetcher = useFetcher();
    const { ENV, error } = useLoaderData<typeof loader>();

    useEffect(() => {
        window.ENV = window.ENV || {};
        window.ENV.FIREBASE_CONFIG = ENV.FIREBASE_CONFIG;
    }, [ENV]);

    useEffect(() => {
        if (error) setNotification({ type: "error", message: error });
        if (fetcher.state === "idle" && fetcher.data?.error) {
            setNotification({ type: "error", message: fetcher.data.error });
            setIsLoading(false);
        }
    }, [fetcher.state, fetcher.data, error]);

    const handleSSOLogin = async (provider: "github" | "google") => {
        setIsLoading(true);
        setNotification(null);
        try {
            const selectedProvider = provider === "github" ? githubProvider : googleProvider;
            const result = await signInWithPopup(auth, selectedProvider);
            const idToken = await result.user.getIdToken();
            window.location.href = `/auth/callback?idToken=${encodeURIComponent(idToken)}&redirectTo=/admin/dashboard`;
        } catch (err: any) {
            setNotification({
                type: "error",
                message: err.code === "auth/account-exists-with-different-credential"
                    ? "Email registered with a different provider. Use original method."
                    : err.message || "Authentication failed. Try again.",
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                }} />
            </div>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 w-10 h-10 z-50 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-300"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md mx-4 relative z-10"
            >
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
                    {/* Logo and Title */}
                    <div className="text-center mb-8">
                        <motion.img
                            src={Logo}
                            alt="Logo"
                            className="w-20 h-20 mx-auto mb-4"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                        />
                        <h1 className="text-3xl font-light mb-2 mrs-saint-delafield-regular">YahyaOnCloud</h1>
                        <h2 className="text-xl font-medium mb-1">Admin Portal</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Sign in to continue</p>
                    </div>

                    {/* Notification */}
                    <AnimatePresence>
                        {notification && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
                                    notification.type === "error"
                                        ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                                        : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                                }`}>
                                    {notification.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    <span>{notification.message}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Login Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => handleSSOLogin("google")}
                            disabled={isLoading || fetcher.state !== "idle"}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Chrome size={20} />
                            <span className="font-medium">Continue with Google</span>
                        </button>

                        <button
                            onClick={() => handleSSOLogin("github")}
                            disabled={isLoading || fetcher.state !== "idle"}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Github size={20} />
                            <span className="font-medium">Continue with GitHub</span>
                        </button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">or</span>
                            </div>
                        </div>

                        {/* Blog Link */}
                        <Link
                            to="/blog"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
                        >
                            Visit Blog
                        </Link>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
                        By signing in, you agree to our terms and privacy policy
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

