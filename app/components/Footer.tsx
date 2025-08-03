import { Link } from "@remix-run/react";
import {
  Twitter,
  Github,
  Linkedin,
  Mail,
  Heart,
  ExternalLink,
  Rss,
  Youtube,
  Instagram,
  Coffee,
} from "lucide-react";

import Logo from "../assets/yoc-logo.png";
import { useEffect, useState } from "react";
import { useTheme } from "../Contexts/ThemeContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();

  const navLinks = [
    { name: "Home", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Guestbook", href: "/guestbook" },
    { name: "Privacy", href: "/privacy" },
    // { name: "RSS", href: "/rss.xml" },
  ];

  const socialLinks = [
    {
      name: "Twitter",
      href: "https://twitter.com/yahyaoncloud",
      icon: Twitter,
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
    <footer className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-slate-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link
              to="/admin/home"
              className="flex items-center space-x-2 mb-4 group"
            >
              <img
                src={Logo}
                alt="yahyaoncloud logo"
                className={`rounded-xl object-cover group-hover:scale-105 transition-all duration-200 ${
                  scrolled ? "w-16 h-16" : "w-24 h-24"
                }`}
              />
              <span className="mrs-saint-delafield-regular font-thin text-2xl text-gray-900 dark:text-white">
                Yahya On Cloud
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              Sharing insights on web development, cloud computing, and
              technology. Building the future one line of code at a time.
            </p>

            {/* Buy Me a Coffee Button */}
            <div className="mb-4">
              <a
                href="https://coff.ee/yahyaoncloud"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 dark:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-all duration-200 transform shadow-md hover:shadow-lg"
              >
                <Coffee size={18} />
                <span>Buy me a coffee</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Rss size={16} />
              <Link
                to="/rss.xml"
                className="hover:text-navy-600 dark:hover:text-copper-400 transition-colors duration-200"
              >
                Subscribe to RSS feed
              </Link>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-navy-600 dark:text-gray-400 dark:hover:text-copper-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3
              className={`font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
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
                    className={`p-2 items-center justify-center flex rounded-lg transition-all duration-200 group ${
                      theme === "dark"
                        ? "bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-blue-400"
                        : "bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600"
                    }`}
                    aria-label={`Connect on ${social.name}`}
                  >
                    <IconComponent
                      size={20}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Palestine Support Section */}

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>© {currentYear} yahyaoncloud. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                Built with <Heart size={14} className="text-red-500 mx-1" />{" "}
                using RemixJS
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
