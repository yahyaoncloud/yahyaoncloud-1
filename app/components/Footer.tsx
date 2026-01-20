import { Link } from "@remix-run/react";
import {
  Github,
  Linkedin,
  Mail,
  Heart,
  ExternalLink,
  Youtube,
  Instagram,
  Coffee,
} from "lucide-react";
import Logo from "../assets/yoc-logo.png";
import { useEffect, useState } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();

  const navLinks = [
    { name: "Home", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Guestbook", href: "/guestbook" },
    { name: "Privacy", href: "/privacy-policy" }, // Updated to match Privacy Policy route
    { name: "Terms", href: "/terms-and-conditions" }, // Added Terms and Conditions
  ];

  const socialLinks = [
    {
      name: "X",
      href: "https://x.com/yahyaoncloud", // Updated to X URL
      icon: FaSquareXTwitter,
    },
    { name: "GitHub", href: "https://github.com/yahyaoncloud", icon: Github },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/in/ykinwork1",
      icon: Linkedin,
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@yahyaoncloud",
      icon: Youtube,
    },
    {
      name: "Instagram",
      href: "https://instagram.com/yahyaoncloud",
      icon: Instagram,
    },
    { name: "Email", href: "mailto:hello@yahyaoncloud.com", icon: Mail },
  ];

  const palestineLinks = [
    {
      name: "UNRWA",
      href: "https://www.unrwa.org/donate",
      description: "UN Relief for Palestine Refugees",
    },
    {
      name: "Medical Aid",
      href: "https://www.map.org.uk/donate",
      description: "Medical Aid for Palestinians",
    },
    {
      name: "Gaza Relief",
      href: "https://www.pcrf.net/",
      description: "Palestine Children's Relief Fund",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:via-black via-zinc-50 dark:to-black border-t border-zinc-200 dark:border-zinc-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link
              prefetch="render"
              to="/blog"
              className="flex items-center space-x-2 mb-4 group"
            >
              <img
                src={Logo}
                alt="yahyaoncloud logo"
                className={`rounded-md object-cover group-hover:scale-105 transition-all duration-200 ${scrolled ? "w-16 h-16" : "w-24 h-24"
                  }`}
              />
              <span className="font-thin text-2xl text-zinc-900 dark:text-white mrs-saint-delafield-regular">
                Yahya On Cloud
              </span>
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4 max-w-md">
              Sharing insights on web development, cloud computing, and
              technology. Building the future one line of code at a time.
            </p>

            {/* Buy Me a Coffee Button */}
            <div className="mb-4">
              <a
                href="https://coff.ee/yahyaoncloud"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-xs items-center space-x-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-zinc-800 font-medium rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Coffee size={14} />
                <span>Buy me a coffee</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className={`group relative inline-block transition-colors duration-200 ${
                      link.name === "Privacy" || link.name === "Terms"
                        ? "text-indigo-800 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                        : "text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
                    }`}
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
              Connect
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 flex items-center justify-center rounded-md transition-all duration-200 bg-zinc-100 hover:bg-indigo-100 text-zinc-700 hover:text-indigo-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 dark:hover:text-indigo-400"
                    aria-label={`Connect on ${social.name}`}
                  >
                    <IconComponent
                      size={20}
                      className="transition-transform duration-200 group-hover:scale-110"
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-zinc-500 dark:text-zinc-400">
            <span>© {currentYear} yahyaoncloud. All rights reserved.</span>
            <span className="flex items-center">
              Built with <Heart size={14} className="text-red-500 mx-1" /> By
              Yahya
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
