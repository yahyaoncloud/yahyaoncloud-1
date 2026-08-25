import { useState, useEffect, useRef } from "react";
import { Send, Clock, User, LogOut } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FaSquareXTwitter, FaGoogle } from "react-icons/fa6";
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
} from "~/utils/firebase.client";
import { getSession } from "~/utils/session.server";
import { addGuestbookToRTDB } from "~/utils/firebase-rtdb.server";
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

// Loader and Action Functions
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request);
    const user = session.get("user") || null;
    return json({ user });
  } catch (error) {
    console.error("Guestbook Loader Error:", error);
    return json({ user: null, error: "Failed to load user session" }, { status: 200 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request);
  const formData = await request.formData();
  const message = formData.get("message") as string;

  if (!session.has("user")) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = session.get("user");
  const timestamp = new Date().toISOString();

  try {
    const res = await addGuestbookToRTDB({
      content: message,
      author: user.displayName || "Anonymous",
      avatar: user.photoURL || "",
      approved: true,
      provider: "sso",
      createdAt: Date.now(),
    });
    return json({ success: res.success, entry: { message, timestamp, user } });
  } catch (error) {
    return json({ error: "Failed to send message" }, { status: 500 });
  }
};

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

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
    if (!db) return;
    const messagesRef = ref(db, "guestbook");
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.entries(data).map(
          ([id, value]: [string, any]) => ({
            id,
            message: value.message || value.content || "",
            timestamp: value.timestamp || (typeof value.createdAt === "number" ? new Date(value.createdAt).toISOString() : value.createdAt) || new Date().toISOString(),
            user: {
              name: value.user?.name || value.author || value.user?.displayName || "Anonymous",
              photo: value.user?.photo || value.avatar || value.user?.photoURL || "",
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
    if (!auth || !provider) return;
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
    if (!auth) return;
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
    if (!newMessage.trim() || !user || !db) return;

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

  const pinnedMessage: Message = {
    id: "pinned-1",
    message: "Welcome to my digital guestbook! Leave a note or connect.",
    timestamp: new Date().toISOString(),
    user: {
      name: "Yahya",
      photo: "",
      uid: "admin",
    },
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <motion.div
        className="space-y-2"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Guestbook
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Share reflections, drop a note, or connect.
        </p>
      </motion.div>

      {/* Authentication & Form */}
      <motion.div
        className="w-full"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        {!user ? (
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-6 w-full">
            <div className="text-center mb-5">
              <User className="mx-auto w-6 h-6 text-zinc-400 mb-2" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Sign in with SSO to leave a message
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Quick 1-click authentication
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
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
                  color: "text-zinc-900 dark:text-zinc-100",
                },
                {
                  name: "Twitter",
                  provider: twitterProvider,
                  icon: FaSquareXTwitter,
                  color: "text-zinc-900 dark:text-zinc-100",
                },
              ].map(({ name, provider, icon: Icon, color }) => (
                <button
                  key={name}
                  onClick={() => handleSignIn(provider)}
                  className="group flex items-center justify-center gap-2 py-2 px-3 border border-zinc-200 dark:border-zinc-700/80 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer shadow-xs"
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs font-medium">{name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 w-full flex flex-col p-5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover"
                />
              ) : (
                <div className="w-7 h-7 bg-indigo-600 dark:bg-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {getInitials(user.displayName || "User")}
                </div>
              )}
              <div className="flex-1 flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                  {user.displayName}
                </p>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>

            {/* Message Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-zinc-400"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono">
                  {newMessage.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSubmitting}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    !newMessage.trim() || isSubmitting
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      Post Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>

      {/* Messages Feed */}
      <motion.div
        variants={fadeIn}
        className="space-y-3 pt-2"
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <h2 className="text-sm font-mono font-medium text-zinc-900 dark:text-zinc-100">
            Messages Feed
          </h2>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
            {messages.length} {messages.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {/* Scrollable Container */}
        <div className="max-h-[420px] overflow-y-auto pr-1.5 space-y-2 divide-y divide-zinc-100/60 dark:divide-zinc-800/60 scrollbar-thin">
          {pinnedMessage && (
            <div className="pt-2 pb-2.5 flex items-start gap-2.5">
              <div className="w-6 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
                Y
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                    {pinnedMessage.user.name} <span className="text-[10px] opacity-75 font-normal">(Pinned)</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                    {formatTime(pinnedMessage.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 break-words leading-snug">
                  {pinnedMessage.message}
                </p>
              </div>
            </div>
          )}

          {visibleMessages.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-400 font-mono">
              <p>No messages yet. Be the first to say hello!</p>
            </div>
          ) : (
            visibleMessages.map((message) => (
              <div
                key={message.id}
                className="pt-2.5 pb-2.5 flex items-start gap-2.5 group"
              >
                {message.user.photo ? (
                  <img
                    src={message.user.photo}
                    alt={message.user.name}
                    className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="w-6 h-6 bg-zinc-800 dark:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-200 text-[10px] font-mono shrink-0 mt-0.5">
                    {getInitials(message.user.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {message.user.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono shrink-0">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 break-words leading-snug">
                    {message.message}
                  </p>
                </div>
              </div>
            ))
          )}

          {hasMore && (
            <div ref={observerRef} className="text-center py-2">
              {isLoadingMore && (
                <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-[11px] font-mono">
                  <div className="w-3 h-3 border-2 border-zinc-300 dark:border-zinc-600 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
