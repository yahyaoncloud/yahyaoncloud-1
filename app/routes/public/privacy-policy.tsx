import { Link } from "@remix-run/react";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1>Privacy Policy</h1>
        <p className="text-xs font-mono text-zinc-400">
          Last updated: 2026
        </p>
      </div>

      <div className="space-y-4">
        <p>
          We value your privacy. When you interact with this website, submit contact inquiries, or authenticate via OAuth, we collect only the basic information necessary for identification and communication.
        </p>
        <p>
          This data is stored securely and is never sold, shared with third parties, or used for unsolicited marketing.
        </p>
        <p>
          For questions or data deletion requests, feel free to contact{" "}
          <a
            href="mailto:hello@yahyaoncloud.com"
            className="text-zinc-900 dark:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4"
          >
            hello@yahyaoncloud.com
          </a>
          .
        </p>
      </div>

      <div className="pt-4">
        <Link
          to="/"
          className="text-sm md:text-base text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}