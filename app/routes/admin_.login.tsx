// routes/admin_.login.tsx
import React, { useState, useEffect } from "react";
import { Github, Chrome, CheckCircle, AlertCircle, Sun } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import Glitch from "../assets/Gallery/glitch.png";
import Glass from "../assets/Gallery/glass.png";
import Glass2 from "../assets/Gallery/glass2.png";
import BlacknWhite from "../assets/Gallery/bw.png";
import Work from "../assets/Gallery/work.png";
import Logo from "../assets/yoc-logo.png";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { auth, googleProvider, githubProvider } from "../utils/firebase.client";
import { signInWithPopup } from "firebase/auth";
import { getUser, sessionStorage } from "../utils/session.server";

const galleryImages = [
    { url: Glitch, title: "Fragmented Signal", description: "A distorted self — caught mid-glitch." },
    { url: BlacknWhite, title: "Binary Silence", description: "Stripped of color, identity becomes contrast." },
    { url: Glass, title: "Shattered Perception", description: "Seen through fractured glass — distorted, divided, whole." },
    { url: Glass2, title: "Obscured Reality", description: "A face veiled by ribbed glass, emotions blurred." },
    { url: Work, title: "Synthetic Soul", description: "A digital echo of the human face under neon hues." },
];

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

const motionVariants = {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } },
    item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } },
    image: { initial: { opacity: 0, scale: 1.05 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } },
};

export default function LoginPage() {
    const { toggleTheme } = useTheme();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const fetcher = useFetcher();
    const { ENV, error } = useLoaderData<typeof loader>();
    const currentImage = galleryImages[currentImageIndex];

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

    useEffect(() => {
        const interval = setInterval(() => setCurrentImageIndex(i => (i + 1) % galleryImages.length), 5000);
        return () => clearInterval(interval);
    }, []);

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
        <motion.div
            className="min-h-screen flex flex-col  transiton-all ease-in-out duration-300 relative dark:bg-zinc-950 bg-zinc-50 text-zinc-900 dark:text-zinc-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Dark/Light Mode Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 w-10 h-10 z-50 dark:text-white dark:bg-zinc-950 dark:hover:bg-zinc-900 transiton-all ease-in-out duration-300 bg-white text-zinc-900 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-200"
            >
                <Sun size={18} />
            </button>

            <div className="flex flex-1">
                {/* Left Panel: Login Form */}
                <motion.div className="w-full md:w-1/2 flex items-center justify-center p-8" variants={motionVariants.container} initial="hidden" animate="visible">
                    <div className="w-full max-w-md space-y-6">
                        <motion.div variants={motionVariants.item} className="text-center space-y-2">
                            <img src={Logo} alt="Logo" className="w-24 h-24 mx-auto" />
                            <h1 className="text-3xl mb-2 mrs-saint-delafield-regular">YahyaOnCloud</h1>
                            <h3 className="text-lg">Admin Login</h3>
                            <p className="text-sm text-zinc-500">Sign in with GitHub or Google</p>
                        </motion.div>

                        <AnimatePresence>
                            {notification && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md border border-zinc-400 text-sm text-zinc-600 dark:text-zinc-300"
                                >
                                    {notification.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {notification.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleSSOLogin("google")}
                                disabled={isLoading || fetcher.state !== "idle"}
                                className="flex-1 flex items-center justify-center gap-2 border border-zinc-400 dark:border-zinc-700 rounded-md py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
                            >
                                <Chrome size={18} /> Google
                            </button>
                            <button
                                onClick={() => handleSSOLogin("github")}
                                disabled={isLoading || fetcher.state !== "idle"}
                                className="flex-1 flex items-center justify-center gap-2 border border-zinc-400 dark:border-zinc-700 rounded-md py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
                            >
                                <Github size={18} /> GitHub
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Right Panel: Image Carousel */}
                <motion.div className="hidden md:block w-1/2 relative overflow-hidden rounded-l-xl"
                    initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                    <AnimatePresence>
                        <motion.div key={currentImageIndex} variants={motionVariants.image} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
                            <img src={currentImage.url} alt={currentImage.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 via-transparent to-transparent" />
                        </motion.div>
                    </AnimatePresence>
                    <div className="absolute bottom-4 left-0 right-0 px-8 text-zinc-100">
                        <h3 className="text-xl font-semibold">{currentImage.title}</h3>
                        <p className="text-sm text-zinc-300">{currentImage.description}</p>
                        <div className="flex gap-2 mt-2">
                            {galleryImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`w-8 h-1.5 rounded-full ${idx === currentImageIndex ? "bg-zinc-100" : "bg-zinc-400/50"}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
