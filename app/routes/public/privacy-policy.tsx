import { Link } from "@remix-run/react";
import { LuShield as Shield, LuClock as Clock, LuLock as Lock, LuArrowLeft as ArrowLeft } from "react-icons/lu";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-10">
      <div className="space-y-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <Shield className="text-indigo-600 dark:text-indigo-400" size={28} /> Privacy Policy & Data Retention
        </h1>
        <p className="text-xs font-mono text-zinc-400">
          Effective Date: 2026 • Minimalist & Transparent Data Practices
        </p>
      </div>

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
            <Clock size={18} className="text-indigo-600 dark:text-indigo-400" /> 2. 30-Day Data Retention Policy
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
            <Lock size={16} /> 3. Single Sign-On (SSO) & Authentication
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
        <section className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">5. Contact & Immediate Deletion Requests</h2>
          <p>
            You may request immediate manual deletion of any guestbook entry or contact message at any time by emailing{" "}
            <a
              href="mailto:hello@yahyaoncloud.com"
              className="text-indigo-600 dark:text-indigo-400 font-medium underline underline-offset-4"
            >
              hello@yahyaoncloud.com
            </a>
            .
          </p>
        </section>
      </div>

      <div className="pt-6">
        <Link
          to="/"
          className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}