import { useState } from "react";
import {
  Mail,
  Send,
  Github,
  Linkedin,
  MessageCircle,
  Clock,
  MapPin,
} from "lucide-react";

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
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/yahya",
      icon: Linkedin,
      display: "Connect professionally",
    },
    {
      name: "GitHub",
      href: "https://github.com/yahya",
      icon: Github,
      display: "View my code",
    },
  ];

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Let's Connect
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Have a project in mind? Let's discuss how we can work together.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Send a message
                </h2>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell me about your project or just say hello..."
                  />
                </div>

                {status.message && (
                  <div
                    className={`p-4 rounded-lg text-sm ${
                      status.type === "error"
                        ? "bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300"
                        : "bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300"
                    }`}
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
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    !formData.name ||
                    !formData.email ||
                    !formData.message ||
                    isSubmitting
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                Get in touch
              </h3>
              <div className="space-y-4">
                {contactLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <link.icon
                        size={18}
                        className="text-slate-600 dark:text-slate-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white text-sm">
                        {link.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {link.display}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Availability Status */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Available for work
                </h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                Currently open to new opportunities and interesting projects.
              </p>
              <div className="space-y-2 text-sm text-green-600 dark:text-green-400">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>Usually responds within 24 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>Based in Hyderabad, India</span>
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle
                  size={18}
                  className="text-blue-600 dark:text-blue-400"
                />
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                  Let's chat
                </h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Whether you have a project idea, want to collaborate, or just
                want to say hello, I'd love to hear from you!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
