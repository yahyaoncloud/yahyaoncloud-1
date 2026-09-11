import { json, type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { LuMail as Mail, LuArrowLeft as ArrowLeft } from "react-icons/lu";
import { createContactMessage } from "~/Services/content.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";

export const meta: MetaFunction = () => {
  return [
    { title: "Contact — Yahya" },
    { name: "description", content: "Get in touch with Yahya regarding cloud infrastructure, consulting, or technical research collaboration." },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return json({ success: false, error: "Please provide your name, email, and message." }, { status: 400 });
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    await createContactMessage({ name, email, message });
    return json({ success: true, message: "Thank you! Your message has been received." });
  } catch (err) {
    console.error("Contact form error:", err);
    return json({ success: false, error: "Failed to send message. Please try emailing directly." }, { status: 500 });
  }
}

export default function ContactPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData) {
      if ("message" in actionData && actionData.message) {
        toast.success(actionData.message);
        formRef.current?.reset();
      } else if ("error" in actionData && actionData.error) {
        toast.error(actionData.error);
      }
    }
  }, [actionData]);

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      {/* Breadcrumb Navigation Bar (Navbar UI Reference) */}
      <nav aria-label="Breadcrumb">
        <Link
          to="/"
          prefetch="intent"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-100/60 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-all shadow-2xs"
        >
          <ArrowLeft size={13} />
          <span>Back home</span>
        </Link>
      </nav>

      {/* Header Section */}
      <header className="space-y-2 pb-5 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <Mail className="text-indigo-600 dark:text-indigo-400" size={26} />
          Contact & Inquiries
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Have an inquiry, project consultation, or research collaboration in mind? Drop a message below or write directly to{" "}
          <a
            href="mailto:hello@yahyaoncloud.com"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-mono font-medium transition-colors"
          >
            hello@yahyaoncloud.com
          </a>.
        </p>
      </header>

      {/* Form */}
      <Form ref={formRef} method="post" className="space-y-5 pt-1">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Your Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Jane Doe"
            required
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            required
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Message
          </Label>
          <Textarea
            id="message"
            name="message"
            rows={5}
            placeholder="Write your note or collaboration details here..."
            required
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white text-white dark:text-zinc-900 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </Form>
    </div>
  );
}
