import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, MapPin, CheckCircle2, Clock } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({
    type: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.name.trim().length < 2) {
      setStatus({ type: "error", message: "Please enter your name (at least 2 characters)." });
      setIsSubmitting(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      setIsSubmitting(false);
      return;
    }
    if (formData.message.trim().length < 8) {
      setStatus({ type: "error", message: "Message must be at least 8 characters long." });
      setIsSubmitting(false);
      return;
    }

    // Simulate sending message
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setStatus({
      type: "success",
      message: "Thank you! Your message has been received. I'll get back to you shortly.",
    });

    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (status.message) setStatus({ type: "", message: "" });
  };

  const contactLinks = [
    {
      name: "Direct Email",
      href: "mailto:hello@yahyaoncloud.com",
      icon: Mail,
      display: "hello@yahyaoncloud.com",
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/in/ykinwork1",
      icon: FaLinkedin,
      display: "linkedin.com/in/ykinwork1",
    },
    {
      name: "GitHub",
      href: "https://github.com/yahyaoncloud",
      icon: FaGithub,
      display: "github.com/yahyaoncloud",
    },
    {
      name: "X / Twitter",
      href: "https://x.com/yahyaoncloud",
      icon: FaSquareXTwitter,
      display: "@yahyaoncloud",
    },
  ];

  return (
    <motion.div className="space-y-10 font-sans" initial="hidden" animate="visible" variants={fadeIn}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Get in Touch
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl">
          Interested in discussing cloud architecture, infrastructure reliability, or potential engineering collaboration? Feel free to reach out.
        </p>
      </div>

      {/* Direct Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contactLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/50 transition-all duration-200 flex items-center gap-3.5 group"
            >
              <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 transition-colors shrink-0">
                <IconComponent size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {link.name}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {link.display}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Availability Status Card */}
      <div className="p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-semibold">Open for Cloud & DevOps opportunities</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-700 dark:text-emerald-400">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            <span>Hyderabad, India</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            <span>Response within 24h</span>
          </span>
        </div>
      </div>

      {/* Message Form */}
      <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/30 space-y-6">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Send a direct message
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Fill out the form below and I will respond to your email.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@company.com"
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="message" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              value={formData.message}
              onChange={handleChange}
              placeholder="Hi Yahya, I'd like to discuss a project involving..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {status.message && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                status.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80"
                  : "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80"
              }`}
            >
              {status.type === "success" && <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />}
              <span>{status.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}