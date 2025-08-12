import { useState } from "react";
import {
  Mail,
  Send,
  Linkedin,
  Github,
  MessageCircle,
  Sparkles,
  Clock,
  MapPin,
} from "lucide-react";

import { FaInstagram, FaGithub, FaLinkedin } from "react-icons/fa";

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
      href: "mailto:yahya@example.com",
      icon: Mail,
      display: "yahya@example.com",
      color:
        "from-blue-500/20 to-cyan-500/20 border-blue-200/50 hover:border-blue-300/70",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/yahya",
      icon: FaLinkedin,
      display: "linkedin.com/in/yahya",
      color:
        "from-indigo-500/20 to-purple-500/20 border-indigo-200/50 hover:border-indigo-300/70",
    },
    {
      name: "GitHub",
      href: "https://github.com/yahya",
      icon: FaGithub,
      display: "github.com/yahya",
      color:
        "from-gray-500/20 to-slate-500/20 border-gray-200/50 hover:border-gray-300/70",
    },
  ];

  return (
    <div className="min-h-screen bg-white  dark:bg-gray-950 py-16 px-6">
      {/* Floating background elements */}

      <div className="max-w-6xl mx-auto relative">
        {/* Modern Header */}
        <header className="text-start mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6">
            Let's Connect
          </h1>
        </header>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 border-gray-500 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-md border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Send a message
                </h2>
              </div>

              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors"
                    >
                      Your Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 rounded-2xl border-2 border-gray-200/60 dark:border-gray-700/60 bg-gray-100 dark:bg-gray-950/50 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all duration-300 placeholder:text-gray-400"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="group">
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-3 rounded-2xl border-2  border-gray-200/60 dark:border-gray-700/60 bg-gray-100 dark:bg-gray-950/50 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all duration-300 placeholder:text-gray-400"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full p-3 rounded-2xl border-2  border-gray-200/60 dark:border-gray-700/60 bg-gray-100 dark:bg-gray-950/50 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all duration-300 resize-none placeholder:text-gray-400"
                    placeholder="Tell me about your project, share an idea, or just say hello! I'd love to hear from you..."
                  />
                </div>

                {status.message && (
                  <div
                    className={`p-4 rounded-2xl border text-sm font-medium ${
                      status.type === "error"
                        ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-800/50 dark:text-red-300"
                        : "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/50 dark:border-green-800/50 dark:text-green-300"
                    } animate-in slide-in-from-top-2 duration-300`}
                  >
                    {status.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    !formData.name ||
                    !formData.email ||
                    !formData.message ||
                    isSubmitting
                  }
                  className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 text-lg relative overflow-hidden group ${
                    !formData.name ||
                    !formData.email ||
                    !formData.message ||
                    isSubmitting
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {!isSubmitting && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}

                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send
                        size={20}
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Methods */}
            <div className="bg-white/70 border-gray-500 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/30">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Quick Links
              </h3>
              <div className="space-y-3">
                {contactLinks.map((link, index) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${link.color} border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-gray-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <link.icon
                        size={20}
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {link.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {link.display}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-gradient-to-br border-green-500 from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-3xl p-6 border border-green-200/50 dark:border-green-800/30">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute w-8 h-8 bg-green-500/20 rounded-full animate-ping"></div>
                </div>
                <h4 className="font-bold text-green-800 dark:text-green-200 mb-2">
                  Available for Projects
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Currently accepting new opportunities
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400">
                  <Clock size={14} />
                  Usually responds within 24 hours
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="text-center p-6 border-gray-500 bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-700/30">
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                <MapPin size={16} />
                <span className="font-medium">Hyderabad, India</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                UTC+5:30 •{" "}
                {new Date().toLocaleTimeString("en-US", {
                  timeZone: "Asia/Kolkata",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                local time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
