import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import { Send } from "lucide-react";
import { Form as RemixForm, useActionData } from "@remix-run/react";
import { useState } from "react";

interface FormProps {
  action?: string;
  className?: string;
  buttonText?: string;
}

export default function Form({
  action = "/admin/contact",
  className = "",
  buttonText = "Submit",
}: FormProps) {
  const { theme } = useTheme();
  const actionData = useActionData<{ error?: string; success?: string }>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <motion.div
      className={`rounded-md p-6 shadow-lg ${
        theme === "dark" ? "bg-zinc-800" : "bg-zinc-50"
      } ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <RemixForm method="post" action={action} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className={`block text-sm font-medium ${
              theme === "dark" ? "text-zinc-300" : "text-zinc-700"
            }`}
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
              theme === "dark"
                ? "bg-zinc-700 border-zinc-600 text-white"
                : "bg-zinc-50 border-zinc-300 text-zinc-900"
            }`}
            placeholder="Your name"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className={`block text-sm font-medium ${
              theme === "dark" ? "text-zinc-300" : "text-zinc-700"
            }`}
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
              theme === "dark"
                ? "bg-zinc-700 border-zinc-600 text-white"
                : "bg-zinc-50 border-zinc-300 text-zinc-900"
            }`}
            placeholder="Your email"
          />
        </div>
        <div>
          <label
            htmlFor="message"
            className={`block text-sm font-medium ${
              theme === "dark" ? "text-zinc-300" : "text-zinc-700"
            }`}
          >
            Message
          </label>
          <textarea
            name="message"
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y transition-all ${
              theme === "dark"
                ? "bg-zinc-700 border-zinc-600 text-white"
                : "bg-zinc-50 border-zinc-300 text-zinc-900"
            }`}
            placeholder="Your message"
          />
        </div>
        {actionData?.error && (
          <div
            className={`text-sm p-3 rounded-md ${
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
            className={`text-sm p-3 rounded-md ${
              theme === "dark"
                ? "bg-green-900/30 text-green-400"
                : "bg-green-100 text-green-500"
            }`}
          >
            {actionData.success}
          </div>
        )}
        <motion.button
          type="submit"
          className={`w-full px-4 py-2 rounded-md font-medium flex items-center justify-center ${
            theme === "dark"
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-indigo-500 hover:bg-indigo-600 text-white"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send size={16} className="mr-2" />
          {buttonText}
        </motion.button>
      </RemixForm>
    </motion.div>
  );
}
