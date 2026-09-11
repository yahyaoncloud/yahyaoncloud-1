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
      <div className="space-y-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <Mail className="text-indigo-600 dark:text-indigo-400" size={26} />
          Contact & Inquiries
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Have an inquiry, project consultation, or research collaboration in mind? Drop a message below or write directly to{" "}
          <a href="mailto:hello@yahyaoncloud.com" className="text-indigo-600 dark:text-indigo-400 hover:underline font-mono">
            hello@yahyaoncloud.com
          </a>.
        </p>
      </div>

      <Form ref={formRef} method="post" className="space-y-5 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Your Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Jane Doe"
            required
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
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
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
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
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </Form>
    </div>
  );
}
