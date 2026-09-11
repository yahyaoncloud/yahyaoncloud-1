import { Link } from "@remix-run/react";
import {
  LuShield as Shield,
  LuClock as Clock,
  LuLock as Lock,
  LuArrowLeft,
  LuArrowUp,
} from "~/components/ui/icons";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Breadcrumb Navigation Bar */}
      <nav
        className="flex items-center justify-between gap-3 text-xs sm:text-sm font-mono"
        aria-label="Breadcrumb"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/"
            prefetch="intent"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-700 dark:text-zinc-300 bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-colors"
          >
            <LuArrowLeft size={13} />
            <span>Home</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700 select-none text-base">/</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate">
            privacy
          </span>
        </div>

        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100/70 dark:bg-zinc-900/70 text-zinc-500 dark:text-zinc-400 text-xs border border-zinc-200/60 dark:border-zinc-800/60">
          30-Day Retention
        </span>
      </nav>

      {/* Header Card */}
      <header className="space-y-3 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <Shield className="text-indigo-600 dark:text-indigo-400 shrink-0" size={26} />
          <span>Privacy & Data Policy</span>
        </h1>
        <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
          Effective 2026 • Minimalist & Transparent Data Practices
        </p>
      </header>

      <div className="space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {/* Core Commitment */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">1. Minimalist Data Philosophy</h2>
          <p>
            YahyaOnCloud is built with privacy-first and software minimalism principles. We do not engage in third-party ad tracking, data monetization, or unsolicited marketing. We only collect the bare minimum data required to facilitate public discussions, communication, and basic performance analytics.
          </p>
        </section>

        {/* 30 Days Retention Policy */}
        <section className="p-4 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
          <h2 className="text-base font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <Clock size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" /> 2. 30-Day Data Retention Policy
          </h2>
          <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80">
            To keep storage lightweight and honor your digital privacy, all transient interactive data is subject to an automated <strong>30-day retention lifecycle</strong>:
          </p>
          <ul className="list-disc list-inside text-xs text-indigo-900/80 dark:text-indigo-300/80 space-y-1 pt-1">
            <li><strong>Guestbook Messages</strong>: Realtime messages submitted via Google/GitHub SSO are automatically pruned from the Realtime Database 30 days after posting.</li>
            <li><strong>Access & Analytics Logs</strong>: Anonymous visit counts, IP hashes, and device telemetry are held for a maximum of 30 days.</li>
          </ul>
        </section>

        {/* SSO & Authentication */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Lock size={16} className="shrink-0 text-zinc-500" /> 3. Single Sign-On (SSO) & Authentication
          </h2>
          <p>
            When signing into the guestbook via Google or GitHub OAuth, we only read your public display name, avatar URL, and user identifier to attribute your message. We never access private repositories, contact lists, or personal email inboxes.
          </p>
        </section>

        {/* Cookies and Storage */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">4. Local Storage & Session Cookies</h2>
          <p>
            We use essential local storage keys strictly to remember your preferred UI theme (Dark / Light mode) and keep your authenticated session active. No cross-site tracking cookies are deployed.
          </p>
        </section>

        {/* Contact & Inquiries */}
        <section className="space-y-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">5. Contact & Immediate Deletion Requests</h2>
          <p>
            You may request immediate manual deletion of any guestbook entry or contact message at any time by emailing{" "}
            <a
              href="mailto:hello@yahyaoncloud.com"
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              hello@yahyaoncloud.com
            </a>
            .
          </p>
        </section>
      </div>

      {/* Footer Navigation Bar */}
      <div className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs sm:text-sm font-mono">
        <Link
          to="/"
          prefetch="intent"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
        >
          <LuArrowLeft size={13} />
          <span>Back to home</span>
        </Link>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center gap-1 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <span>Top</span>
          <LuArrowUp size={13} />
        </button>
      </div>
    </div>
  );
}