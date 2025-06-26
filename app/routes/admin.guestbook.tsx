import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { MessageSquare, Send, Github, Smile } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Placeholder database function
async function getGuestbookCollection() {
  throw new Error("Function not implemented.");
}

// Placeholder authentication check (replace with real auth logic)
async function getAuthenticatedUser(request: Request) {
  // Simulate checking for an authenticated user via GitHub OAuth
  // In a real app, use Remix-Auth or similar with GitHub OAuth strategy
  return null; // Return null for unauthenticated, or { id: string, name: string } for authenticated
}

// Dummy data aligned with Comment type
const dummyComments: Comment[] = [
  {
    id: "c1",
    postId: "guestbook",
    author: { id: "u1", name: "Alice" },
    content: "Awesome blog, Yahya! 😊",
    createdAt: "2025-06-25T12:00:00Z",
    approved: true,
  },
  {
    id: "c2",
    postId: "guestbook",
    author: { id: "u2", name: "Bob" },
    content: "Your AWS tutorials are super helpful! 🚀",
    createdAt: "2025-06-24T15:30:00Z",
    approved: true,
  },
];

// Loader to fetch approved comments
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

// Action to handle message submission
export async function action({ request }: ActionFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return json(
      { error: "Please log in with GitHub to submit a message" },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const content = formData.get("content");

  if (typeof content !== "string") {
    return json({ error: "Message is required" }, { status: 400 });
  }

  if (content.length < 5) {
    return json(
      { error: "Message must be at least 5 characters long" },
      { status: 400 }
    );
  }

  const comment: Comment = {
    id: uuidv4(),
    postId: "guestbook",
    author: { id: user.id, name: user.name },
    content: content.trim(),
    createdAt: new Date().toISOString(),
    approved: false, // Requires admin approval
  };

  try {
    const collection = await getGuestbookCollection();
    await collection.insertOne(comment);
    return json({
      success: "Message submitted! It will appear after approval.",
    });
  } catch (error) {
    return json({ error: "Failed to submit message" }, { status: 500 });
  }
}

export default function Guestbook() {
  const { theme, toggleTheme } = useTheme();
  const { comments, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ["😊", "👍", "🚀", "🎉", "🌟"];

  const handleEmojiSelect = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <h1
          className={`text-3xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Guestbook
        </h1>
      </header>

      <motion.div
        className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-12rem)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Introduction */}
        <motion.div
          className={`rounded-lg p-4 mb-4 shadow-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center mb-2">
            <MessageSquare
              size={20}
              className={`mr-2 ${
                theme === "dark" ? "text-blue-400" : "text-blue-500"
              }`}
            />
            <h2
              className={`text-xl font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Sign the Guestbook
            </h2>
          </div>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Log in with GitHub to share your thoughts! Messages appear after
            approval.
          </p>
        </motion.div>

        {/* Messages */}
        <motion.div
          className="flex-1 mb-4 max-h-[60vh] overflow-y-auto space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {comments.length === 0 ? (
            <div
              className={`rounded-lg p-4 text-center ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-300"
                  : "bg-white text-gray-600"
              }`}
            >
              <p>No messages yet. Be the first to sign!</p>
            </div>
          ) : (
            comments.map((comment: Comment, index: number) => (
              <motion.div
                key={comment.id}
                className={`rounded-lg p-4 shadow-md ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } flex flex-col space-y-2`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-blue-400" : "text-blue-500"
                    }`}
                  >
                    {comment.author.name}
                  </span>
                  <span
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  } line-clamp-2`}
                >
                  {comment.content}
                </p>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Form or Login */}
        <motion.div
          className={`rounded-lg p-4 shadow-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {user ? (
            <Form method="post" className="flex items-end space-x-2">
              <div className="flex-1">
                <label
                  htmlFor="content"
                  className={`block text-sm font-medium sr-only ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Message
                </label>
                <textarea
                  name="content"
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={2}
                  className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="Type your message..."
                />
              </div>
              <div className="flex items-end space-x-2">
                <motion.button
                  type="button"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className={`p-2 rounded-md ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Smile size={20} />
                </motion.button>
                <motion.button
                  type="submit"
                  className={`p-2 rounded-md ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={20} />
                </motion.button>
              </div>
              {showEmojiPicker && (
                <motion.div
                  className={`absolute bottom-16 right-4 p-2 rounded-md shadow-lg ${
                    theme === "dark" ? "bg-gray-700" : "bg-white"
                  } flex space-x-2`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-lg p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </Form>
          ) : (
            <a
              href="/auth/github"
              className={`w-full px-4 py-2 rounded-md font-medium flex items-center justify-center ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              <Github size={20} className="mr-2" />
              Log in with GitHub
            </a>
          )}
          {actionData?.error && (
            <div
              className={`text-sm p-2 mt-2 rounded-md ${
                theme === "dark"
                  ? "bg-red-900/30 text-red-400"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {actionData.error}
            </div>
          )}
          {actionData?.success && (
            <div
              className={`text-sm p-2 mt-2 rounded-md ${
                theme === "dark"
                  ? "bg-green-900/30 text-green-400"
                  : "bg-green-100 text-green-500"
              }`}
            >
              {actionData.success}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
