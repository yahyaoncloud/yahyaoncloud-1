import { useState, useEffect, useRef } from "react";
import { Send, LogOut, Sparkles, MessageSquare, CornerDownLeft } from "lucide-react";
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
import yocLogo from "~/assets/yoc-logo.png";
import profilePhoto from "~/assets/profile.jpg";

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
    <div className="space-y-8 max-w-2xl">
      {/* 1. Header Section with SSO Card placed on the right */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-1.5 flex-1 pr-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Guestbook
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {!user
              ? "Share reflections, drop a note, or say hello. Sign in with GitHub, Google, or X to post a message."
              : `Signed in as ${user.displayName || user.email || "Guest"}. Write your message below to join the guestbook.`}
          </p>
        </div>

        {/* Header Right: SSO Auth Pill or User Session Badge */}
        <div className="shrink-0 self-start sm:self-center">
          {!user ? (
            <div className="flex items-center gap-1.5 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 shadow-2xs">
              <span className="text-[11px] font-medium text-zinc-500 px-2 select-none hidden xs:inline">
                Sign in:
              </span>
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
                  className="p-1.5 px-2.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 transition-all cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-medium"
                  title={`Sign in with ${name}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className="text-[11px] font-medium">{name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-1.5 pl-2.5 pr-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 shadow-2xs">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-5 h-5 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {getInitials(user.displayName || "U")}
                </div>
              )}
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 max-w-[120px] truncate">
                {user.displayName || "Guest"}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-1 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* 2. Compact, Polished Chatbox */}
      <motion.div
        className="w-full"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        {user ? (
          <form
            onSubmit={handleSubmit}
            className="flex gap-3 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs focus-within:border-zinc-300 dark:focus-within:border-zinc-700 focus-within:ring-2 focus-within:ring-zinc-900/5 dark:focus-within:ring-zinc-100/5 transition-all"
          >
            {/* Logo / Avatar on the left */}
            <div className="shrink-0 pt-0.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-8 h-8 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {getInitials(user.displayName || "U")}
                </div>
              )}
            </div>

            {/* Input & Controls */}
            <div className="flex-1 min-w-0 space-y-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your note, feedback, or say hello..."
                rows={2}
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none focus:outline-hidden leading-relaxed"
                maxLength={500}
              />

              <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="hidden sm:inline">Press Enter</span>
                  <CornerDownLeft className="h-3 w-3 hidden sm:inline" />
                  <span className="hidden sm:inline">to send</span>
                  <span className="sm:hidden">{newMessage.length}/500</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline">{newMessage.length}/500</span>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSubmitting}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      !newMessage.trim() || isSubmitting
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                        : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 cursor-pointer shadow-2xs"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Sending</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Post</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0">
              <img src={yocLogo} alt="Logo" className="w-5 h-5 object-contain" />
            </div>
            <div className="flex-1 min-w-0 text-xs text-zinc-500 dark:text-zinc-400">
              Sign in via the SSO options in the top right to leave a note.
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
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Community Messages</span>
          </div>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
            {messages.length} {messages.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Pinned Author Message */}
          <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-indigo-950/20 flex items-start gap-3">
            <img
              src={pinnedMessage.user.photo}
              alt="Yahya"
              className="w-7 h-7 rounded-lg object-cover border border-indigo-200 dark:border-indigo-800 shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {pinnedMessage.user.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium">
                    Host
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                  Pinned
                </span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {pinnedMessage.message}
              </p>
            </div>
          </div>

          {/* User Messages Stream */}
          {visibleMessages.length === 0 ? (
            <div className="text-center py-10 text-xs text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              No entries recorded yet. Be the first to leave a message!
            </div>
          ) : (
            visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-start gap-3"
              >
                {msg.user.photo ? (
                  <img
                    src={msg.user.photo}
                    alt={msg.user.name}
                    className="w-7 h-7 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 text-[10px] font-mono font-medium shrink-0 mt-0.5">
                    {getInitials(msg.user.name)}
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {msg.user.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))
          )}

          {hasMore && (
            <div ref={observerRef} className="text-center py-3">
              {isLoadingMore && (
                <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs font-mono">
                  <div className="w-3 h-3 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
                  <span>Loading more messages...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
