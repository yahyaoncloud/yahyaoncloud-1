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
import { getCurrentUser } from "../utils/auth";

const galleryImages = [
    { url: Glitch, title: "Fragmented Signal", description: "A distorted self — caught mid-glitch in the digital ether." },
    { url: BlacknWhite, title: "Binary Silence", description: "Stripped of color, identity becomes contrast." },
    { url: Glass, title: "Shattered Perception", description: "Seen through fractured glass — distorted, divided, yet whole." },
    { url: Glass2, title: "Obscured Reality", description: "A face veiled by ribbed glass, emotions blurred." },
    { url: Work, title: "Synthetic Soul", description: "A digital echo of the human face under neon hues." },
];

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getCurrentUser(request);
    if (user) return redirect("/admin");
    return json({
        ENV: {
            GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
            GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
            GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
        },
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
    const { ENV } = useLoaderData<typeof loader>();
    const currentImage = galleryImages[currentImageIndex];

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data?.error) {
            setNotification({ type: "error", message: fetcher.data.error });
            setIsLoading(false);
        }
    }, [fetcher.state, fetcher.data]);

    useEffect(() => {
        const interval = setInterval(() => setCurrentImageIndex((i) => (i + 1) % galleryImages.length), 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSSOLogin = (provider: "github" | "google") => {
        setIsLoading(true);
        setNotification(null);
        window.location.href = `/auth/${provider}`;
    };

    return (
        <motion.div
            className="min-h-screen flex flex-col dark:bg-zinc-950 dark:text-zinc-100 bg-zinc-50 text-zinc-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Theme Toggle */}
            <div className="flex justify-end p-4">
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center w-10 h-10 border border-zinc-600 rounded-md text-zinc-900 dark:text-zinc-100"
                >
                    <Sun size={18} />
                </button>
            </div>

            <div className="flex flex-1">
                {/* Login Form */}
                <motion.div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12" variants={motionVariants.container} initial="hidden" animate="visible">
                    <div className="w-full max-w-md space-y-8">
                        <motion.div variants={motionVariants.item} className="text-center">
                            <img src={Logo} alt="Logo" className="w-28 h-28 mx-auto" />
                            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                            <p className="text-sm text-zinc-400 mb-4">Sign in with GitHub or Google</p>
                        </motion.div>

                        <AnimatePresence>
                            {notification && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-md text-sm border border-zinc-400 text-zinc-600"
                                >
                                    {notification.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {notification.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-3">
                            <p className="text-sm text-zinc-400 text-center">Sign in with</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleSSOLogin("google")}
                                    disabled={isLoading || fetcher.state !== "idle"}
                                    className="flex-1 flex items-center justify-center gap-2 border border-zinc-700 rounded-md py-2 text-sm bg-zinc-800 text-zinc-100"
                                >
                                    <Chrome size={18} /> Google
                                </button>
                                <button
                                    onClick={() => handleSSOLogin("github")}
                                    disabled={isLoading || fetcher.state !== "idle"}
                                    className="flex-1 flex items-center justify-center gap-2 border border-zinc-700 rounded-md py-2 text-sm bg-zinc-800 text-zinc-100"
                                >
                                    <Github size={18} /> GitHub
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Image Carousel */}
                <motion.div className="hidden md:block w-1/2 relative m-10 rounded-md overflow-hidden" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                    <div className="relative h-full">
                        <AnimatePresence>
                            <motion.div key={currentImageIndex} variants={motionVariants.image} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
                                <img src={currentImage.url} alt={currentImage.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            </motion.div>
                        </AnimatePresence>
                        <div className="absolute bottom-4 left-0 right-0 px-8 text-zinc-100">
                            <h3 className="text-2xl font-semibold mb-1">{currentImage.title}</h3>
                            <p className="text-sm text-zinc-400 mb-2">{currentImage.description}</p>
                            <div className="flex gap-2">
                                {galleryImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-8 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-zinc-100" : "bg-zinc-400/50"}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
