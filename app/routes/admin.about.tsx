import { motion } from "framer-motion";
import { json, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { environment } from "../environments/environment";
import { useTheme } from "../Contexts/ThemeContext";
import {
  FaInstagram,
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";
import { MapPin, Calendar, Code, Coffee, Mail } from "lucide-react";

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
    <div className="min-h-screen mx-auto p-10 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile */}
          <motion.div
            className="flex flex-col rounded-2xl py-8 border border-gray-500 bg-slate-100 dark:bg-slate-900 items-center text-center lg:col-span-1"
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
              className={`text-sm/8 text-justify  leading-relaxed   lg:px-12 px-6 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {bio}
            </p>
            {/* <div className="mt-6 flex items-center space-x-4 text-base">
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
            </div> */}
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
                    <FaLinkedin size={18} />
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
                    <FaGithub size={18} />
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
                    <FaTwitter size={18} />
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
                    <FaYoutube size={18} />
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
                    <FaInstagram size={18} />
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
                className={`text-2xl font-bold ${
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
                  className={`relative p-4 rounded-lg transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-gray-800/50 hover:bg-gray-800/70 border border-gray-500"
                      : "bg-gray-50/80 hover:bg-gray-100/80 border border-gray-500"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-3xl`}
                  ></div>
                  <h3
                    className={`font-semibold text-base mb-1 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {exp.title}
                  </h3>
                  <p
                    className={`text-sm mb-2 ${
                      theme === "dark" ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {exp.period}
                  </p>
                  <p
                    className={`text-sm leading-relaxed ${
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
                    className={`text-2xl font-bold ${
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
                          ? "bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-500"
                          : "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-500"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3
                        className={`font-semibold text-base mb-2 ${
                          theme === "dark"
                            ? "text-emerald-300"
                            : "text-emerald-700"
                        }`}
                      >
                        {work.title || work.name}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed ${
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
          {/* Right Column - Skills */}
          {/* Right Column - Skills */}
          <motion.div
            className="col-span-1 md:col-span-1 lg:col-span-1"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  when: "beforeChildren",
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            {skills && (
              <div
                className={`rounded-2xl p-6 shadow-lg border ${
                  theme === "dark"
                    ? "bg-gray-800/50 border-gray-700 text-white"
                    : "bg-white/80 border-gray-200 text-gray-900"
                } backdrop-blur-sm`}
              >
                <h3 className="text-2xl font-semibold mb-6 tracking-tight">
                  Tech Stack
                </h3>
                <div className="space-y-3">
                  {(Array.isArray(skills)
                    ? skills
                    : Object.values(skills).flat()
                  )
                    .slice(0, 12)
                    .map((skill, index) => {
                      const skillText =
                        typeof skill === "string"
                          ? skill
                          : skill.name || skill.title;
                      const isLongSkill = skillText.length > 20; // Determine if skill name is long

                      return (
                        <motion.div
                          key={index}
                          className={`${
                            isLongSkill
                              ? "w-full" // Full width for long skills
                              : "inline-block mr-2 mb-2" // Inline for short skills
                          }`}
                          variants={{
                            hidden: { opacity: 0, scale: 0.8 },
                            visible: {
                              opacity: 1,
                              scale: 1,
                              transition: {
                                type: "spring",
                                stiffness: 100,
                                damping: 10,
                              },
                            },
                          }}
                          whileHover={{ scale: isLongSkill ? 1.02 : 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span
                            className={`${
                              isLongSkill
                                ? "block px-4 py-3 text-sm font-medium rounded-xl" // Block layout for long skills
                                : "px-3 py-2 text-xs font-medium rounded-full" // Compact for short skills
                            } text-center cursor-pointer transition-all duration-300 ${
                              theme === "dark"
                                ? "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100 hover:from-gray-600 hover:to-gray-500"
                                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300"
                            } hover:shadow-md hover:-translate-y-0.5 ${
                              isLongSkill ? "w-full" : ""
                            }`}
                          >
                            {skillText}
                          </span>
                        </motion.div>
                      );
                    })}
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
