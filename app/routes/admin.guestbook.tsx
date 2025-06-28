import { motion } from "framer-motion";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useTheme } from "../Contexts/ThemeContext";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Send, Github } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Placeholder DB/auth logic
async function getGuestbookCollection() {
  throw new Error("DB not implemented");
}
async function getAuthenticatedUser(request: Request) {
  return null; // Replace with GitHub auth
}

const dummyComments: Comment[] = [
  {
    id: "1",
    postId: "guestbook",
    author: { id: "u1", name: "Alice" },
    content: "Hey! Love your work 👋",
    createdAt: "2025-06-25T12:00:00Z",
    approved: true,
  },
  {
    id: "2",
    postId: "guestbook",
    author: { id: "u2", name: "Bob" },
    content: "Your tutorials helped me land my first job. Thank you!",
    createdAt: "2025-06-24T15:30:00Z",
    approved: true,
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  try {
    const collection = await getGuestbookCollection();
    const comments = await collection.find({ approved: true }).toArray();
    return json({ comments, user });
  } catch {
    return json({ comments: dummyComments, user });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  if (!user)
    return json(
      { error: "Please sign in with GitHub to post a message." },
      { status: 401 }
    );

  const formData = await request.formData();
  const content = formData.get("content");

  if (typeof content !== "string" || content.trim().length < 1) {
    return json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const newComment: Comment = {
    id: uuidv4(),
    postId: "guestbook",
    author: { id: user.id, name: user.name },
    content: content.trim(),
    createdAt: new Date().toISOString(),
    approved: false,
  };

  try {
    const collection = await getGuestbookCollection();
    await collection.insertOne(newComment);
    return json({ success: "Message submitted for review!" });
  } catch {
    return json({ error: "Could not submit your message." }, { status: 500 });
  }
}

export default function Guestbook() {
  const { theme } = useTheme();
  const { comments, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [content, setContent] = useState("");

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 60000) return "just now";
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
    return `${Math.floor(diffMs / 86400000)}d ago`;
  };

  const bg = theme === "dark" ? "bg-gray-900" : "bg-white";
  const text = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const subtext = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const border = theme === "dark" ? "border-gray-700" : "border-gray-300";

  return (
    <div className={`min-h-screen ${bg} font-sans`}>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <header>
          <h1
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            GuestBook
          </h1>
          <p
            className={`mt-2 text-base ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Welcome to my guestbook! Feel free to leave a message, share your
            thoughts, or just say hello. I appreciate your feedback and enjoy
            hearing from visitors.
          </p>
        </header>

        {/* Messages */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className={`text-sm text-center ${subtext}`}>No messages yet.</p>
          ) : (
            comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                  {c.author.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${text}`}>
                      {c.author.name}
                    </span>
                    <span className={`text-xs ${subtext}`}>
                      {formatTime(c.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm ${text}`}>{c.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Comment box */}
        <div className={`pt-6 border-t ${border}`}>
          {user ? (
            <Form method="post" className="flex items-start gap-3">
              <textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                placeholder="Write your message..."
                className={`flex-1 p-2 rounded-md text-sm border ${border} ${bg} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <motion.button
                type="submit"
                disabled={!content.trim()}
                whileHover={content.trim() ? { scale: 1.05 } : {}}
                whileTap={content.trim() ? { scale: 0.95 } : {}}
                className={`p-2 mt-1 rounded-md ${
                  content.trim()
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                <Send size={16} />
              </motion.button>
            </Form>
          ) : (
            <a
              href="/auth/github"
              className={`inline-flex items-center gap-2 border ${border} rounded-md px-3 py-2 text-sm ${text} hover:bg-blue-50`}
            >
              <Github size={16} />
              Sign in with GitHub to post
            </a>
          )}

          {/* Feedback */}
          {actionData?.error && (
            <motion.p
              className="text-xs text-red-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {actionData.error}
            </motion.p>
          )}
          {actionData?.success && (
            <motion.p
              className="text-xs text-green-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {actionData.success}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
