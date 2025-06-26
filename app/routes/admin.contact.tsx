import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import { Mail, MessageSquare, Send, Linkedin, Github } from "lucide-react";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

// --- Form handler ---
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return json({ error: "All fields are required" }, { status: 400 });
  }

  if (name.length < 2) {
    return json(
      { error: "Name must be at least 2 characters long" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Invalid email address" }, { status: 400 });
  }

  if (message.length < 10) {
    return json(
      { error: "Message must be at least 10 characters long" },
      { status: 400 }
    );
  }

  console.log("Contact Submission:", { name, email, message });
  return json({ success: "Message sent successfully!" });
}

// --- Contact Channels ---
const contactLinks = [
  { name: "Email", href: "mailto:yahya@example.com", icon: Mail },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/yahya",
    icon: Linkedin,
  },
  { name: "GitHub", href: "https://github.com/yahya", icon: Github },
];

export default function ContactPage() {
  const { theme } = useTheme();
  const actionData = useActionData<typeof action>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div
      className={`min-h-screen p-6 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <header>
          <h1
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Contact Yahya
          </h1>
          <p
            className={`mt-2 text-base ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            I’m always open to ideas, collaborations, and constructive feedback.
            Send a message or connect directly through one of the platforms
            below.
          </p>
        </header>

        {/* Contact Form */}
        <motion.div
          className={`rounded-lg shadow-lg p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Form method="post" className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y`}
              />
            </div>

            {/* Messages */}
            {actionData?.error && (
              <div className="text-red-500 text-sm">{actionData.error}</div>
            )}
            {actionData?.success && (
              <div className="text-green-500 text-sm">{actionData.success}</div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full px-4 py-2 rounded-md font-medium flex items-center justify-center ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              <Send size={16} className="mr-2" />
              Send Message
            </motion.button>
          </Form>
        </motion.div>

        {/* Direct Contact Links */}
        <motion.div
          className={`rounded-lg shadow-lg p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Connect via
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {contactLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center p-3 rounded-md border group transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 hover:border-blue-500"
                    : "bg-gray-50 border-gray-200 hover:border-blue-400"
                }`}
              >
                <link.icon
                  size={18}
                  className={`mr-3 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-500"
                  } group-hover:scale-110 transition-transform`}
                />
                <span
                  className={`text-sm ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {link.name}
                </span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
