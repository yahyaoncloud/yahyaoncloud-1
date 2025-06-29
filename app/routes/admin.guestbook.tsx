import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Work in progress animation variants
const variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7 } },
};

export default function Guestbook() {
  return (
    <div className="min-h-screen flex items-center  justify-center bg-gray-100 dark:bg-gray-900">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className="items-center gap-4 absolute top-50% left-50% "
      >
        <div className="flex flex-col items-center space-y-4 p-20">
          <Loader2 size={48} className="text-blue-500 animate-spin" />
          <motion.h1
            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Work in progress
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            This page is under construction. Please check back soon!
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

/*
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
        // ...rest of the original code
      </div>
    </div>
  );
}
*/
