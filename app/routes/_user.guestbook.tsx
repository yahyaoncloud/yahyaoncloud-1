import { useState, useEffect, useRef } from "react";
import { Send, Clock, User, LogOut } from "lucide-react";
import { FaGithub, FaGoogle, FaTwitter } from "react-icons/fa";
import {
  json,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  auth,
  googleProvider,
  githubProvider,
  twitterProvider,
  db,
} from "../utils/firebase.client";
import { getUserSession } from "../utils/session.server";
import { signInWithPopup, signOut } from "firebase/auth";
import { onValue, push, ref } from "firebase/database";
import { motion } from "framer-motion";

// Interface
interface Message {
  id: string;
  message: string;
  timestamp: string;
  user: {
    name: string;
    photo: string;
    uid: string;
  };
}

// Loader and Action Functions (unchanged)
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const user = session.get("user") || null;
  return json({ user });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const formData = await request.formData();
  const message = formData.get("message") as string;

  if (!session.has("user")) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = session.get("user");
  const timestamp = new Date().toISOString();

  const entry = {
    message,
    timestamp,
    user: {
      name: user.displayName,
      photo: user.photoURL,
      uid: user.uid,
    },
  };

  try {
    await push(ref(db, "guestbook"), entry);
    return json({ entry });
  } catch (error) {
    return json({ error: "Failed to send message" }, { status: 500 });
  }
};

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// CSS for Auto-Hiding Scrollbar
const scrollbarStyles = `
  .auto-hide-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }
  .auto-hide-scrollbar:hover,
  .auto-hide-scrollbar:active {
    scrollbar-color: #888 #f4f4f4;
  }
  .dark .auto-hide-scrollbar:hover,
  .dark .auto-hide-scrollbar:active {
    scrollbar-color: #a1a1aa #27272a;
  }
  .auto-hide-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .auto-hide-scrollbar::-webkit-scrollbar-thumb {
    background: transparent;
  }
  .auto-hide-scrollbar:hover::-webkit-scrollbar-thumb,
  .auto-hide-scrollbar:active::-webkit-scrollbar-thumb {
    background: #888;
  }
  .dark .auto-hide-scrollbar:hover::-webkit-scrollbar-thumb,
  .dark .auto-hide-scrollbar:active::-webkit-scrollbar-thumb {
    background: #a1a1aa;
  }
  .auto-hide-scrollbar::-webkit-scrollbar-track {
    background: #f4f4f4;
  }
  .dark .auto-hide-scrollbar::-webkit-scrollbar-track {
    background: #27272a;
  }
`;

export default function MinimalistGuestbook() {
  const { user } = useLoaderData<typeof loader>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const messagesPerPage = 20;

  // Firebase Messages Listener
  useEffect(() => {
    const messagesRef = ref(db, "guestbook");
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.entries(data).map(
          ([id, value]: [string, any]) => ({
            id,
            message: value.message || "",
            timestamp: value.timestamp || new Date().toISOString(),
            user: {
              name: value.user?.name || value.user?.displayName || "Anonymous",
              photo: value.user?.photo || value.user?.photoURL || "",
              uid: value.user?.uid || "",
            },
          })
        );
        entries.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setMessages(entries);
        setVisibleMessages(entries.slice(0, messagesPerPage));
        setHasMore(entries.length > messagesPerPage);
      } else {
        setMessages([]);
        setVisibleMessages([]);
        setHasMore(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            const nextMessages = messages.slice(
              0,
              visibleMessages.length + messagesPerPage
            );
            setVisibleMessages(nextMessages);
            setHasMore(nextMessages.length < messages.length);
            setIsLoadingMore(false);
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [messages, visibleMessages, hasMore, isLoadingMore]);

  // Authentication Handlers
  const handleSignIn = async (provider: any) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const session = await fetch("/api/auth", {
        method: "POST",
        body: JSON.stringify({
          token: idToken,
          uid: result.user.uid,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (session.ok) window.location.reload();
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await fetch("/api/logout", { method: "POST" });
      window.location.reload();
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  // Form Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsSubmitting(true);
    const entry = {
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      user,
    };

    try {
      await push(ref(db, "guestbook"), entry);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Utility Functions
  const formatTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now.getTime() - messageTime.getTime();

    if (diffMs < 60000) return "just now";
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
    return `${Math.floor(diffMs / 86400000)}d ago`;
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen my-6 ">
      <style>{scrollbarStyles}</style>
      <motion.div
        className="w-full py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Guestbook
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Leave a message and connect with the community. Share your thoughts
            or say hello!
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Form Section */}
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            {!user ? (
              <div className="space-y-6">
                <div className="text-center">
                  <User className="mx-auto w-8 h-8 text-zinc-400 mb-4" />
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    Sign in to leave a message
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Use one of the options below
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      name: "Google",
                      provider: googleProvider,
                      icon: FaGoogle,
                      color: "text-red-500",
                    },
                    {
                      name: "GitHub",
                      provider: githubProvider,
                      icon: FaGithub,
                      color: "text-zinc-900 dark:text-white",
                    },
                    {
                      name: "Twitter",
                      provider: twitterProvider,
                      icon: FaTwitter,
                      color: "text-sky-500",
                    },
                  ].map(({ name, provider, icon: Icon, color }) => (
                    <button
                      key={name}
                      onClick={() => handleSignIn(provider)}
                      className="w-full py-2 px-4 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                      Sign in with {name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(user.displayName || "User")}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {user.displayName}
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      Sign out
                    </button>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Share your thoughts..."
                    rows={4}
                    className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none resize-none placeholder-zinc-400 dark:placeholder-zinc-500"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {newMessage.length}/500
                    </span>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isSubmitting}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${!newMessage.trim() || isSubmitting
                          ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                          : "bg-indigo-600 dark:bg-indigo-400 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500"
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>

          {/* Messages Section */}
          <motion.div
            className="lg:col-span-2 auto-hide-scrollbar"
            variants={containerVariants}
          >
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-md p-6 overflow-y-auto max-h-[600px]">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                <h2 className="sticky top-0 left-0 text-lg font-semibold text-zinc-900 dark:text-white">
                  Messages
                </h2>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {messages.length}{" "}
                  {messages.length === 1 ? "message" : "messages"}
                </span>
              </div>
              {visibleMessages.length === 0 ? (
                <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
                  No messages yet. Be the first to share!
                </div>
              ) : (
                <div className="space-y-6">
                  {visibleMessages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      variants={itemVariants}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      className="border-b border-zinc-200 dark:border-zinc-700 pb-6 last:border-0"
                    >
                      <div className="flex gap-3">
                        {message.user.photo ? (
                          <img
                            src={message.user.photo}
                            alt={message.user.name}
                            className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {getInitials(message.user.name)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                              {message.user.name}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 break-words">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {hasMore && (
                    <div ref={observerRef} className="text-center py-4">
                      {isLoadingMore ? (
                        <div className="flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                          <div className="w-4 h-4 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-500 dark:border-t-zinc-400 rounded-full animate-spin"></div>
                          Loading more...
                        </div>
                      ) : (
                        <div className="h-1"></div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
