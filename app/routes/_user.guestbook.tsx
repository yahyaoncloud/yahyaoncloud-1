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

  // Listen to Firebase messages and sort by timestamp (newest first)
  useEffect(() => {
    const messagesRef = ref(db, "guestbook");
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.entries(data).map(
          ([id, value]: [string, any]) => {
            // Handle both new (user object) and old (name-based) formats
            const isOldFormat = value.name && !value.user;
            return {
              id,
              message: value.message || "",
              timestamp: isOldFormat
                ? new Date(value.timestamp).toISOString()
                : value.timestamp || new Date().toISOString(),
              user: isOldFormat
                ? {
                    name: value.name || "Anonymous",
                    photo: "",
                    uid: "",
                  }
                : {
                    name:
                      value.user?.name ||
                      value.user?.displayName ||
                      "Anonymous",
                    photo: value.user?.photo || value.user?.photoURL || "",
                    uid: value.user?.uid || "",
                  },
            };
          }
        );
        // Sort messages by timestamp in descending order (newest first)
        entries.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setMessages(entries);
        // Initialize with first 20 messages (newest)
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

  // Intersection Observer to load more messages
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate loading delay (can be removed if not needed)
          setTimeout(() => {
            const nextMessages = messages.slice(
              0,
              visibleMessages.length + messagesPerPage
            );
            setVisibleMessages(nextMessages);
            setHasMore(nextMessages.length < messages.length);
            setIsLoadingMore(false);
          }, 500); // Adjust delay as needed
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [messages, visibleMessages, hasMore, isLoadingMore]);

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
      e.preventDefault(); // Prevent newline
      handleSubmit(e); // Trigger form submission
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now.getTime() - messageTime.getTime();

    if (diffMs < 60000) return "now";
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
    <div className="min-h-screen max-w-7xl ">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="max-w-7xl flex flex-col lg:w-[600px] xl:w-[1000px] md:w-[400px] w-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-16 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
          <h1 className="text-5xl font-bold text-indigo-800 dark:text-indigo-400 mb-4">
            Guestbook
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            Leave your mark and connect with others. Share your thoughts, ideas,
            or just say hello.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form Section */}
          <div className="lg:col-span-1 max-w-lg opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
            {!user ? (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h2 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                    Sign in to leave a message
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choose your preferred authentication method
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      name: "Google",
                      provider: googleProvider,
                      icon: FaGoogle,
                      color: "hover:text-red-500",
                    },
                    {
                      name: "GitHub",
                      provider: githubProvider,
                      icon: FaGithub,
                      color: "hover:text-slate-900 dark:hover:text-white",
                    },
                    {
                      name: "Twitter",
                      provider: twitterProvider,
                      icon: FaTwitter,
                      color: "hover:text-sky-500",
                    },
                  ].map(({ name, provider, icon: Icon, color }) => (
                    <button
                      key={name}
                      onClick={() => handleSignIn(provider)}
                      className="w-full py-3 px-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2"
                    >
                      <Icon
                        className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${color}`}
                      />
                      Sign in with {name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 flex flex-col w-full">
                {/* User Info */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-600"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(user.displayName || "User")}
                    </div>
                  )}
                  <div className="flex w-full items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {user.displayName}
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      Sign out
                    </button>
                  </div>
                </div>

                {/* Message Input */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Share your thoughts, ideas, or just say hello..."
                    rows={6}
                    className="max-w-xl w-full px-0 py-2 border-0 border-b-2 border-slate-200 dark:border-slate-600 bg-transparent focus:border-blue-500 dark:focus:border-blue-400 outline-none resize-none placeholder-slate-400 dark:placeholder-slate-400 text-slate-900 dark:text-white transition-colors text-sm"
                    maxLength={500}
                  />
                  <div className="flex md:flex-col flex-row items-center justify-between gap-4 w-full">
                    <span className="text-xs text-slate-400 dark:text-slate-500 self-start sm:self-center">
                      {newMessage.length}/500
                    </span>

                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isSubmitting}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        !newMessage.trim() || isSubmitting
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
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
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Messages Section */}
          <div className="lg:col-span-2 max-w-4xl opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <h2 className="text-xl font-medium text-slate-900 dark:text-white">
                  Messages
                </h2>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {messages.length}{" "}
                  {messages.length === 1 ? "message" : "messages"}
                </span>
              </div>
              <div className="flex flex-col h-64 md:h-[600px] overflow-y-auto rounded border dark:border-slate-600 border-slate-200 p-6">
                {visibleMessages.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      No messages yet. Be the first to share your thoughts!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {visibleMessages.map((message, index) => {
                      const userName =
                        message.user?.name ||
                        message.user?.displayName ||
                        "Anonymous";
                      const userPhoto =
                        message.user?.photo || message.user?.photoURL;
                      return (
                        <div
                          key={message.id}
                          className="pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex gap-4">
                            {userPhoto ? (
                              <img
                                src={userPhoto}
                                alt={userName}
                                className="w-8 h-8 rounded-full flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                {getInitials(userName)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium text-slate-900 dark:text-white text-sm">
                                  {userName}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed break-words text-sm">
                                {message.message || "No message content"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {hasMore && (
                      <div ref={observerRef} className="text-center py-4">
                        {isLoadingMore ? (
                          <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-slate-500 dark:border-t-slate-400 rounded-full animate-spin"></div>
                            Loading more messages...
                          </div>
                        ) : (
                          <div className="h-1"></div> // Invisible trigger for observer
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
