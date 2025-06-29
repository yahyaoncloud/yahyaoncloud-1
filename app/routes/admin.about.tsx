import { motion } from "framer-motion";
import { json, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { environment } from "../environments/environment";
import { useTheme } from "../Contexts/ThemeContext";
import {
  MapPin,
  Calendar,
  Code,
  Coffee,
  Linkedin,
  Github,
  Twitter,
  Youtube,
  Instagram,
  Mail,
} from "lucide-react";

import type {
  Portfolio,
  Experience,
  CurrentWork,
  SocialLinks,
} from "../Types/portfolio";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const res = await fetch(`${environment.GO_BACKEND_URL}/portfolio`);
    if (!res.ok) throw new Error("Failed to fetch portfolio");
    const data: Portfolio = await res.json();

    // Sanitize data to remove circular references
    const sanitizedData: Portfolio = {
      name: data.name || "Unknown",
      bio: data.bio || "No bio available",
      portraitUrl: data.portraitUrl || "/default-portrait.jpg",
      experiences:
        data.experiences?.map((exp) => ({
          title: exp.title || "",
          period: exp.period || "",
          description: Array.isArray(exp.description)
            ? exp.description
            : exp.description || "",
        })) || [],
      skills: Array.isArray(data.skills)
        ? data.skills
        : Object.values(data.skills || {})
            .flat()
            .map((skill) =>
              typeof skill === "string"
                ? skill
                : skill.name || skill.title || ""
            ) || [],
      currentWorks:
        data.currentWorks?.map((work) => ({
          title: work.title || work.name || "",
          description: work.description || "",
        })) || [],
      socialLinks: {
        linkedin: data.socialLinks?.linkedin || "",
        github: data.socialLinks?.github || "",
        twitter: data.socialLinks?.twitter || "",
        youtube: data.socialLinks?.youtube || "",
        instagram: data.socialLinks?.instagram || "",
        email: data.socialLinks?.email || "",
      },
    };

    return json(sanitizedData);
  } catch (error) {
    console.error("Loader error:", error);
    return json(
      {
        name: "",
        bio: "",
        portraitUrl: "",
        experiences: [],
        skills: [],
        currentWorks: [],
        socialLinks: {},
      },
      { status: 500 }
    );
  }
}

export default function AdminAbout() {
  const {
    name,
    bio,
    portraitUrl,
    experiences,
    skills,
    currentWorks,
    socialLinks,
  } = useLoaderData<Portfolio>();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile */}
          <motion.div
            className="flex flex-col rounded-2xl py-8 bg-slate-100 dark:bg-slate-800 items-center text-center lg:col-span-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={portraitUrl}
              alt={name}
              className="w-80 h-80 lg:w-80 lg:h-80 rounded-3xl object-cover shadow-lg border-4 border-white/20 dark:border-gray-700/50"
            />
            <h1
              className={`text-3xl lg:text-4xl font-bold p-6 bg-gradient-to-r ${
                theme === "dark"
                  ? "from-white via-blue-300 to-white"
                  : "from-gray-900 via-blue-800 to-gray-900"
              } bg-clip-text text-transparent`}
            >
              {name}
            </h1>
            <p
              className={`text-sm text-justify lg:text-base leading-relaxed px-4 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {bio}
            </p>
            <div className="mt-6 flex items-center space-x-4 text-sm">
              <div
                className={`flex items-center space-x-1 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <MapPin size={14} />
                <span>Remote</span>
              </div>
              <div
                className={`flex items-center space-x-1 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Coffee size={14} />
                <span>Available</span>
              </div>
            </div>
            {socialLinks && (
              <div className="mt-6 flex justify-center space-x-3">
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gray-800/50 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400"
                        : "bg-gray-100/80 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    <Linkedin size={18} />
                  </a>
                )}
                {socialLinks.github && (
                  <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gray-800/50 hover:bg-gray-700/40 text-gray-400 hover:text-white"
                        : "bg-gray-100/80 hover:bg-gray-200 text-gray-600 hover:text-black"
                    }`}
                  >
                    <Github size={18} />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gray-800/50 hover:bg-blue-400/20 text-gray-400 hover:text-blue-400"
                        : "bg-gray-100/80 hover:bg-blue-50 text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    <Twitter size={18} />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gray-800/50 hover:bg-red-600/20 text-gray-400 hover:text-red-500"
                        : "bg-gray-100/80 hover:bg-red-50 text-gray-600 hover:text-red-600"
                    }`}
                  >
                    <Youtube size={18} />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gray-800/50 hover:bg-pink-600/20 text-gray-400 hover:text-pink-400"
                        : "bg-gray-100/80 hover:bg-pink-50 text-gray-600 hover:text-pink-600"
                    }`}
                  >
                    <Instagram size={18} />
                  </a>
                )}
                {socialLinks.email && (
                  <a
                    href={`mailto:${socialLinks.email}`}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gray-800/50 hover:bg-emerald-600/20 text-gray-400 hover:text-emerald-400"
                        : "bg-gray-100/80 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600"
                    }`}
                  >
                    <Mail size={18} />
                  </a>
                )}
              </div>
            )}
          </motion.div>

          {/* Middle Column - Experience */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <Calendar
                className={`w-5 h-5 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <h2
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Experience
              </h2>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {experiences?.slice(0, 4).map((exp, index) => (
                <motion.div
                  key={exp.title + index} // Use unique key
                  className={`relative p-4 rounded-2xl transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/50"
                      : "bg-gray-50/80 hover:bg-gray-100/80 border border-gray-200/50"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-2xl`}
                  ></div>
                  <h3
                    className={`font-semibold text-sm mb-1 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {exp.title}
                  </h3>
                  <p
                    className={`text-xs mb-2 ${
                      theme === "dark" ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {exp.period}
                  </p>
                  <p
                    className={`text-xs leading-relaxed ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {Array.isArray(exp.description)
                      ? exp.description[0]
                      : exp.description}
                  </p>
                </motion.div>
              ))}
            </div>
            {currentWorks && currentWorks.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <Code
                    className={`w-5 h-5 ${
                      theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  />
                  <h2
                    className={`text-xl font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Current Focus
                  </h2>
                </div>
                <div className="space-y-3">
                  {currentWorks.slice(0, 2).map((work, index) => (
                    <motion.div
                      key={work.title + index}
                      className={`p-4 rounded-2xl transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-700/30"
                          : "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3
                        className={`font-semibold text-sm mb-2 ${
                          theme === "dark"
                            ? "text-emerald-300"
                            : "text-emerald-700"
                        }`}
                      >
                        {work.title || work.name}
                      </h3>
                      <p
                        className={`text-xs leading-relaxed ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {work.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column - Current Work & Skills */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {skills && (
              <div>
                <h3
                  className={`text-lg font-bold mb-4 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(skills)
                    ? skills
                    : Object.values(skills).flat()
                  )
                    .slice(0, 12)
                    .map((skill, index) => (
                      <motion.span
                        key={index}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                          theme === "dark"
                            ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                            : "bg-gray-200/80 text-gray-700 hover:bg-gray-300/80"
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {typeof skill === "string"
                          ? skill
                          : skill.name || skill.title}
                      </motion.span>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === "dark" ? "#4B5563" : "#D1D5DB"};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === "dark" ? "#6B7280" : "#9CA3AF"};
        }
      `}</style>
    </div>
  );
}
