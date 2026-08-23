import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { createContactMessage } from "~/Services/content.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return json({ error: "All fields are required." }, { status: 400 });
  }

  if (!email.includes("@")) {
    return json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const saved = await createContactMessage({ name, email, message });
  if (!saved) {
    return json({ error: "Failed to send message. Please try again later." }, { status: 500 });
  }

  return json({ success: true });
}

export default function ContactPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const contactLinks = [
    { label: "Twitter", href: "https://x.com/yahyaoncloud", display: "https://twitter.com/yahyaoncloud", external: true },
    { label: "GitHub", href: "https://github.com/yahyaoncloud", display: "https://github.com/yahyaoncloud", external: true },
    { label: "LinkedIn", href: "https://linkedin.com/in/ykinwork1", display: "https://linkedin.com/in/ykinwork1", external: true },
    { label: "Email", href: "mailto:hello@yahyaoncloud.com", display: "hello@yahyaoncloud.com", external: false },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1>Contact</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Interested in cloud infrastructure, reliability engineering, or discussing distributed systems? Reach out through any channel below.
        </p>
      </div>

      {/* Direct Reach-Out Channels (2 columns) */}
      <section className="space-y-3 pt-2">
        <h2>Channels</h2>
        <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-y-2.5 items-baseline text-base md:text-[17px]">
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
                  className="text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-1.5 py-0.5 -ml-1.5 rounded transition-all duration-150 active:scale-[0.98] inline-block font-mono text-xs md:text-sm"
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
        <h2>Send a Message</h2>

        <Form method="post" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm md:text-base font-mono text-zinc-500">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Alex Morgan"
                className="w-full px-3.5 py-2.5 rounded-lg text-base md:text-lg bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm md:text-base font-mono text-zinc-500">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="alex@domain.com"
                className="w-full px-3.5 py-2.5 rounded-lg text-base md:text-lg bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="message" className="block text-sm md:text-base font-mono text-zinc-500">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              placeholder="Hi Yahya, I'd like to talk about..."
              className="w-full px-3.5 py-2.5 rounded-lg text-base md:text-lg bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
            />
          </div>

          {actionData?.error && (
            <p className="text-sm text-red-500 font-mono">{actionData.error}</p>
          )}

          {actionData?.success && (
            <p className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">
              ✓ Message sent. Thank you!
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm md:text-base font-medium bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-150 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </Form>
      </section>
    </div>
  );
}