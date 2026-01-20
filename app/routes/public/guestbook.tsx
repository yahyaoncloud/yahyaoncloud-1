import { useState, useEffect, useRef } from "react";
import { Send, Clock, User, LogOut } from "lucide-react";
import { FaGithub, FaTwitter } from "react-icons/fa";
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
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>({
    id: "pinned-1",
    message: "Welcome to the guestbook! Be kind and respectful.",
    timestamp: new Date().toISOString(),
    user: {
      name: "Admin",
      photo: "", // optional admin avatar URL
      uid: "admin",
    },
  });

  return (
    <div className="min-h-screen md:w-[700px] ">
      <div className="py-12 px-4 sm:px-6 md:px-8 w-full max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8 w-full"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-3xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Guestbook
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400 w-full">
            Share reflections or drop a message.
          </p>
        </motion.div>

        {/* Authentication & Form */}
        <motion.div
          className="mb-8 w-full flex items-center justify-center"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          {!user ? (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30 p-6 w-full">
              <div className="text-center mb-6">
                <User className="mx-auto w-6 h-6 text-zinc-400 mb-3" />
                <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                  Sign in to leave a message
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Choose your preferred method
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
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
                    icon: FaSquareXTwitter,
                    color: "text-zinc-900 dark:text-white",
                  },
                ].map(({ name, provider, icon: Icon, color }) => (
                  <button
                    key={name}
                    onClick={() => handleSignIn(provider)}
                    className="group flex items-center justify-center gap-3 py-2.5 px-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors duration-200 w-full"
                  >
                    <Icon className={`w-6 h-6 ${color}`} />
                    {/* <span className="text-sm font-medium">Sign in with {name}</span> */}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 w-full flex flex-col">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-4 border-b w-full border-zinc-200 dark:border-zinc-700">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {getInitials(user.displayName || "User")}
                  </div>
                )}
                <div className="flex-1 gap-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {user.displayName}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="group text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors duration-200"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="relative">
                      Sign out
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Message Form */}
              <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share your thoughts..."
                  rows={3}
                  className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-zinc-400 dark:placeholder-zinc-500"
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {newMessage.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSubmitting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      !newMessage.trim() || isSubmitting
                        ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                        : "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
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

        {/* Messages */}
        <motion.div
          variants={fadeIn}
          className="max-w-2xl"
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
              Messages
            </h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </span>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-h-96 overflow-y-auto"
          >
            {pinnedMessage && (
              <motion.div
                variants={itemVariants}
                className="pb-6 border-b border-indigo-300 dark:border-indigo-500  bg-gradient-to-t from-indigo-900/5 to-transparent flex gap-3"
              >
                {pinnedMessage.user.photo ? (
                  <img
                    src={pinnedMessage.user.photo}
                    alt={pinnedMessage.user.name}
                    className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {getInitials(pinnedMessage.user.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                      {pinnedMessage.user.name} (Pinned)
                    </span>
                    <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {formatTime(pinnedMessage.timestamp)}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 break-words leading-relaxed">
                    {pinnedMessage.message}
                  </p>
                </div>
              </motion.div>
            )}

            {visibleMessages.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="text-center py-12 text-zinc-500 dark:text-zinc-400"
              >
                <p>No messages yet. Be the first to share!</p>
              </motion.div>
            ) : (
              <>
                {visibleMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    variants={itemVariants}
                    className="pb-6 border-b border-zinc-200 dark:border-zinc-700 last:border-0"
                  >
                    <div className="flex gap-3">
                      {message.user.photo ? (
                        <img
                          src={message.user.photo}
                          alt={message.user.name}
                          className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {getInitials(message.user.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-zinc-900 dark:text-white">
                            {message.user.name}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <Clock className="w-3 h-3" />
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 break-words leading-relaxed">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {hasMore && (
                  <div ref={observerRef} className="text-center py-4">
                    {isLoadingMore && (
                      <div className="flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                        <div className="w-4 h-4 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-500 dark:border-t-zinc-400 rounded-full animate-spin"></div>
                        Loading more messages...
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

