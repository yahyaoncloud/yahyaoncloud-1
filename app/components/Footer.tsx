import { Link } from "@remix-run/react";
import { Github, Linkedin, Mail, ShieldAlert } from "lucide-react";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/yahyaoncloud",
      icon: Github,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/in/ykinwork1",
      icon: Linkedin,
    },
    {
      name: "X",
      href: "https://x.com/yahyaoncloud",
      icon: FaSquareXTwitter,
    },
    {
      name: "Email",
      href: "mailto:hello@yahyaoncloud.com",
      icon: Mail,
    },
  ];

  return (
    <footer className="w-full border-t border-zinc-200/80 dark:border-zinc-800/80 mt-20 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <Link
              to="/"
              className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
            >
              Yahya On Cloud
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              Cloud DevOps & Network Infrastructure engineering case studies, whitepapers, and architectures.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label={`Connect on ${social.name}`}
                >
                  <IconComponent size={16} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>© {currentYear} Yahya. All rights reserved.</span>

          {/* Indirect discreet Admin portal link */}
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400/80 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors opacity-70 hover:opacity-100"
            title="Management Portal"
          >
            <ShieldAlert size={12} />
            <span>Portal</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
