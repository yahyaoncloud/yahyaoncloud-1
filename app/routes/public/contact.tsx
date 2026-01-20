import { useState } from "react";
import {
  Mail,
  Send,
  Github,
  Linkedin,
  MessageCircle,
  Clock,
  MapPin,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.name.trim().length < 2) {
      setStatus({ type: "error", message: "Name must have ≥2 characters." });
      setIsSubmitting(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus({ type: "error", message: "Invalid email address." });
      setIsSubmitting(false);
      return;
    }
    if (formData.message.trim().length < 10) {
      setStatus({
        type: "error",
        message: "Message too short (min 10 characters).",
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStatus({
      type: "success",
      message: "Thanks! Your message has been sent successfully.",
    });

    setTimeout(() => {
      setFormData({ name: "", email: "", message: "" });
      setStatus({ type: "", message: "" });
      setIsSubmitting(false);
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (status.message) setStatus({ type: "", message: "" });
  };

  const contactLinks = [
    {
      name: "Email",
      href: "mailto:ykinwork1@gmail.com",
      icon: Mail,
      display: "ykinwork1@gmail.com",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/ykinwork1",
      icon: Linkedin,
      display: "Connect professionally",
    },
    {
      name: "GitHub",
      href: "https://github.com/tunkstun",
      icon: Github,
      display: "View my code",
    },
  ];

  return (
    <div className="">
      <motion.div
        className="py-8 px-4 md:px-0 w-full max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Header */}
        <motion.div className="mb-8" variants={fadeIn}>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Contact
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Have a project in mind? Let's discuss how we can work together
          </p>
        </motion.div>

        {/* Contact Links */}
        <motion.div className="mb-8" variants={fadeIn}>
          <div className="grid gap-3 md:grid-cols-3">
            {contactLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <link.icon size={16} className="text-zinc-600 dark:text-zinc-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-zinc-900 dark:text-white">
                    {link.name}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {link.display}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Status Cards */}
        <motion.div className="mb-8 grid gap-4 md:grid-cols-2" variants={staggerContainer}>
          <motion.div
            variants={fadeIn}
            className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Available for work
              </span>
            </div>
            <div className="space-y-1 text-xs text-green-700 dark:text-green-400">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>Usually responds within 24 hours</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>Based in Hyderabad, India</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                Let's chat
              </span>
            </div>
            <p className="text-xs text-indigo-700 dark:text-indigo-400">
              Whether you have a project idea, want to collaborate, or just want to say hello
            </p>
          </motion.div>
        </motion.div>

        {/* Contact Form */}
        <motion.div variants={fadeIn}>
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
            Send a message
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder-zinc-400 dark:placeholder-zinc-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder-zinc-400 dark:placeholder-zinc-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 resize-none"
                placeholder="Tell me about your project or just say hello..."
              />
            </div>

            {status.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-md text-sm ${status.type === "error"
                  ? "bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300"
                  : "bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300"
                  }`}
              >
                {status.message}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={
                !formData.name ||
                !formData.email ||
                !formData.message ||
                isSubmitting
              }
              className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm ${!formData.name ||
                !formData.email ||
                !formData.message ||
                isSubmitting
                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                : "bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Support Section */}
        {/* <motion.div className="mt-12" variants={fadeIn}>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30 p-4">
            <h3 className="text-base font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Stand in Solidarity
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 leading-relaxed">
              Supporting those affected by ongoing conflicts in Gaza, Syria, and Sudan.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              {[
                { href: "https://www.unrwa.org/donate", label: "Gaza Relief" },
                { href: "https://www.unicef.org/emergencies/war-syria", label: "Help Syria" },
                { href: "https://donate.unhcr.org/int/en/sudan", label: "Support Sudan" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  <Globe className="mr-2 h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </motion.div> */}
      </motion.div>
    </div>
  );
}