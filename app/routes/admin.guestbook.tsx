import { motion } from "framer-motion";
import { useTheme } from "~/contexts/ThemeContext";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Send, Github } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Placeholder database function
async function getGuestbookCollection() {
  throw new Error("Function not implemented.");
}

// Placeholder authentication check
async function getAuthenticatedUser(request: Request) {
  return null; // Replace with actual GitHub auth logic
}

// Dummy data
const dummyComments: Comment[] = [
  {
    id: "c1",
    postId: "guestbook",
    author: { id: "u1", name: "Alice" },
    content: "Hey! Love your work 👋",
    createdAt: "2025-06-25T12:00:00Z",
    approved: true,
  },
  {
    id: "c2",
    postId: "guestbook",
    author: { id: "u2", name: "Bob" },
    content: "Your tutorials helped me land my first job. Thank you!",
    createdAt: "2025-06-24T15:30:00Z",
    approved: true,
  },
  {
    id: "c3",
    postId: "guestbook",
    author: { id: "u3", name: "Charlie" },
    content: "More content on serverless please! 🚀",
    createdAt: "2025-06-23T09:15:00Z",
    approved: true,
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  try {
    const collection = await getGuestbookCollection();
    const comments = await collection.find({ approved: true }).toArray();
    return json({ comments, user });
  } catch (error) {
    return json({ comments: dummyComments, user }, { status: 200 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return json(
      { error: "Please log in via GitHub to send a message" },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const content = formData.get("content");

  if (typeof content !== "string" || content.trim().length < 1) {
    return json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const comment: Comment = {
    id: uuidv4(),
    postId: "guestbook",
    author: { id: user.id, name: user.name },
    content: content.trim(),
    createdAt: new Date().toISOString(),
    approved: false,
  };

  try {
    const collection = await getGuestbookCollection();
    await collection.insertOne(comment);
    return json({ success: "Message sent!" });
  } catch (error) {
    return json({ error: "Failed to send message" }, { status: 500 });
  }
}

export default function Guestbook() {
  const { theme } = useTheme();
  const { comments, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [content, setContent] = useState("");

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Theme-based styles
  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-200" : "text-gray-800";
  const subtextColor = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  return (
    <div className={`min-h-screen ${bgColor} font-sans`}>
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-4">
        {/* Header */}
        <div>
          <h1 className={`text-2xl font-semibold ${textColor}`}>Guestbook</h1>
          <p className={`text-sm ${subtextColor}`}>
            Share your thoughts or feedback.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4">
          {comments.length === 0 ? (
            <p className={`text-sm ${subtextColor} text-center`}>
              No messages yet.
            </p>
          ) : (
            comments.map((comment: Comment) => (
              <motion.div
                key={comment.id}
                className="flex gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm ${textColor}`}
                >
                  {comment.author.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${textColor}`}>
                      {comment.author.name}
                    </span>
                    <span className={`text-xs ${subtextColor}`}>
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm ${textColor}`}>{comment.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Input */}
        <div className={`pt-4 border-t ${borderColor}`}>
          {user ? (
            <Form method="post" className="flex gap-2">
              <textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message..."
                rows={2}
                className={`flex-1 p-2 text-sm rounded-md border ${borderColor} ${bgColor} ${textColor} focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none`}
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
                className={`p-2 rounded-md ${
                  content.trim()
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500"
                }`}
                whileHover={content.trim() ? { scale: 1.05 } : {}}
                whileTap={content.trim() ? { scale: 0.95 } : {}}
              >
                <Send size={16} />
              </motion.button>
            </Form>
          ) : (
            <a
              href="/auth/github"
              className={`flex items-center justify-center p-2 rounded-md border ${borderColor} ${textColor} hover:bg-blue-50`}
            >
              <Github size={16} className="mr-2" />
              Sign in with GitHub to comment
            </a>
          )}

          {/* Status Messages */}
          {actionData?.error && (
            <motion.p
              className="text-xs text-red-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {actionData.error}
            </motion.p>
          )}
          {actionData?.success && (
            <motion.p
              className="text-xs text-green-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {actionData.success}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
