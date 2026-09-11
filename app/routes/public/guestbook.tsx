import { useState, useEffect, useRef } from "react";
import { LuSend as Send, LuLogOut as LogOut, LuSparkles as Sparkles, LuMessageSquare as MessageSquare, LuCornerDownLeft as CornerDownLeft, FaGithub, FaSquareXTwitter, FaGoogle } from "~/components/ui/icons";
import {
  json,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
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
import yocLogo from "~/assets/yoc-logo.webp";
import profilePhoto from "~/assets/profile.webp";

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
const fadeIn: any = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
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

  const messagesPerPage = 25;

  // Firebase Realtime Database Messages Listener
  useEffect(() => {
    if (!db) return;
    const messagesRef = ref(db, "guestbook");
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries: Message[] = Object.entries(data).map(
          ([id, value]: [string, any]) => ({
            id,
            message: value.message || value.content || "",
            timestamp:
              value.timestamp ||
              (typeof value.createdAt === "number"
                ? new Date(value.createdAt).toISOString()
                : value.createdAt) ||
              new Date().toISOString(),
            user: {
              name: value.user?.name || value.author || value.user?.displayName || "Anonymous",
              photo: value.user?.photo || value.avatar || value.user?.photoURL || "",
              uid: value.user?.uid || "",
            },
          })
        );
        entries.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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
            const nextMessages = messages.slice(0, visibleMessages.length + messagesPerPage);
            setVisibleMessages(nextMessages);
            setHasMore(nextMessages.length < messages.length);
            setIsLoadingMore(false);
          }, 300);
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
          scope: "guest",
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
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !user || !db) return;

    setIsSubmitting(true);
    const entry = {
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      user: {
        name: user.displayName || user.name || "Anonymous",
        photo: user.photoURL || user.photo || "",
        uid: user.uid || "",
      },
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
      handleSubmit();
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const now = new Date();
      const messageTime = new Date(timestamp);
      const diffMs = now.getTime() - messageTime.getTime();

      if (diffMs < 60000) return "just now";
      if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
      if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
      if (diffMs < 604800000) return `${Math.floor(diffMs / 86400000)}d ago`;
      return messageTime.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "recently";
    }
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
    id: "pinned-author-1",
    message: "Welcome to my digital guestbook! Leave a thought, ask a question, or say hello.",
    timestamp: "2026-01-01T00:00:00.000Z",
    user: {
      name: "Yahya",
      photo: profilePhoto,
      uid: "author",
    },
  };

  return (
    <div className="space-y-7 max-w-2xl">
      {/* 1. Header Section */}
      <motion.div
        className="space-y-2"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Guestbook
          </h1>
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
            {messages.length} {messages.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl font-normal">
          Leave a thought, share feedback, or say hello. A public ledger of friends, collaborators, and visitors.
        </p>
      </motion.div>

      {/* 2. Soft Minimalist Composer & SSO Bar */}
      <motion.div
        className="w-full"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        {user ? (
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 shadow-xs focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:bg-white dark:focus-within:bg-zinc-900/80 transition-all space-y-3"
          >
            {/* Header: User details & Sign Out */}
            <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-6 h-6 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                    {getInitials(user.displayName || "U")}
                  </div>
                )}
                <span className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {user.displayName || "Guest"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign out</span>
              </button>
            </div>

            {/* Big Font Textarea */}
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your note, feedback, or greeting..."
              rows={3}
              className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none focus:outline-hidden leading-relaxed font-normal"
              maxLength={500}
            />

            {/* Bottom bar: Counter & Post button */}
            <div className="flex items-center justify-between pt-1 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="hidden sm:inline">Press Enter</span>
                <CornerDownLeft className="h-3 w-3 hidden sm:inline opacity-70" />
                <span className="hidden sm:inline">to post</span>
                <span className="sm:hidden">{newMessage.length}/500</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[11px]">{newMessage.length}/500</span>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSubmitting}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    !newMessage.trim() || isSubmitting
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                      : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white cursor-pointer shadow-xs active:scale-[0.98]"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Sign in to leave a message
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose a provider to authenticate instantly.
              </p>
            </div>

            {/* SSO Pill Buttons */}
            <div className="flex items-center gap-2 shrink-0">
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
                  color: "text-zinc-800 dark:text-zinc-200",
                },
                {
                  name: "X",
                  provider: twitterProvider,
                  icon: FaSquareXTwitter,
                  color: "text-zinc-900 dark:text-zinc-100",
                },
              ].map(({ name, provider, icon: Icon, color }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSignIn(provider)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/70 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 text-xs font-medium hover:scale-[1.02] active:scale-[0.98]"
                  title={`Sign in with ${name}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* 3. Messages Feed */}
      <motion.div
        variants={fadeIn}
        className="space-y-3"
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-3">
          {/* Pinned Author Message */}
          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-zinc-100/50 dark:bg-zinc-900/60 flex items-start gap-3.5">
            <img
              src={pinnedMessage.user.photo}
              alt="Yahya"
              className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
                    {pinnedMessage.user.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                    Host
                  </span>
                </div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono shrink-0">
                  Pinned
                </span>
              </div>
              <p className="text-sm sm:text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                {pinnedMessage.message}
              </p>
            </div>
          </div>

          {/* User Messages Stream */}
          {visibleMessages.length === 0 ? (
            <div className="text-center py-12 text-sm text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              No entries recorded yet. Be the first to leave a message!
            </div>
          ) : (
            visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 sm:p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60 transition-all duration-200 flex items-start gap-3.5"
              >
                {msg.user.photo ? (
                  <img
                    src={msg.user.photo}
                    alt={msg.user.name}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-200/80 dark:border-zinc-700/80 shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 text-xs font-mono font-medium shrink-0 mt-0.5">
                    {getInitials(msg.user.name)}
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {msg.user.name}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono shrink-0">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm sm:text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed break-words whitespace-pre-wrap font-normal">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))
          )}

          {hasMore && (
            <div ref={observerRef} className="text-center py-3">
              {isLoadingMore && (
                <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs font-mono">
                  <div className="w-3.5 h-3.5 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
                  <span>Loading more messages...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer Navigation Bar (Navbar UI Reference) */}
      <footer className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs sm:text-sm font-mono">
        <Link
          to="/"
          prefetch="intent"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <span>← Back home</span>
        </Link>
        <a
          href="#top"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <span>Top ↑</span>
        </a>
      </footer>
    </div>
  );
}

