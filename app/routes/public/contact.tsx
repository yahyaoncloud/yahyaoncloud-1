import { useState } from "react";

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
      setStatus({ type: "error", message: "Please enter your name." });
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
    await new Promise((resolve) => setTimeout(resolve, 600));

    setStatus({
      type: "success",
      message: "Thank you. Your message has been received.",
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
    { label: "Twitter", href: "https://x.com/yahyaoncloud", display: "https://twitter.com/yahyaoncloud", external: true },
    { label: "GitHub", href: "https://github.com/yahyaoncloud", display: "https://github.com/yahyaoncloud", external: true },
    { label: "LinkedIn", href: "https://linkedin.com/in/ykinwork1", display: "https://linkedin.com/in/ykinwork1", external: true },
    { label: "Email", href: "mailto:hello@yahyaoncloud.com", display: "hello@yahyaoncloud.com", external: false },
  ];

  return (
    <div className="space-y-10 text-[14.5px] leading-[1.8] tracking-[-0.011em] text-zinc-700 dark:text-zinc-300">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Contact
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Interested in cloud infrastructure, reliability engineering, or discussing distributed systems? Reach out through any channel below.
        </p>
      </div>

      {/* Direct Reach-Out Channels (2 columns) */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
          Channels
        </h2>
        <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[110px_1fr] gap-y-2.5 items-baseline text-xs sm:text-sm">
          {contactLinks.map((item) => (
            <div key={item.label} className="contents">
              <span className="text-zinc-500 dark:text-zinc-400 font-normal">
                {item.label}
              </span>
              <div>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className="text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-1.5 py-0.5 -ml-1.5 rounded transition-all duration-150 active:scale-[0.98] inline-block font-mono text-xs sm:text-[13px]"
                >
                  {item.display}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Message Form */}
      <section className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
          Send a Message
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-xs font-mono text-zinc-500">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                className="w-full px-3 py-1.5 rounded text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-mono text-zinc-500">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@company.com"
                className="w-full px-3 py-1.5 rounded text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="message" className="block text-xs font-mono text-zinc-500">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              value={formData.message}
              onChange={handleChange}
              placeholder="Your note..."
              className="w-full px-3 py-2 rounded text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
            />
          </div>

          {status.message && (
            <div
              className={`p-2.5 rounded text-xs ${
                status.type === "success"
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800"
                  : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900"
              }`}
            >
              <span>{status.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
            className="px-4 py-2 rounded text-xs font-medium bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Sending..." : "Send Message →"}
          </button>
        </form>
      </section>
    </div>
  );
}