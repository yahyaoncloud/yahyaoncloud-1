import { motion } from "framer-motion";
import { json, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useTheme } from "../Contexts/ThemeContext";
import {
  FaInstagram,
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaTwitter,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { MapPin, Mail, ExternalLink, Github, Link } from "lucide-react";
import { getAllPortfolios } from "../Services/post.server";
import type { Portfolio } from "../Types/portfolio";
import portraitImage from "../assets/Gallery/glass.png";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const data = await getAllPortfolios();
    const portfolio = Array.isArray(data) && data.length > 0 ? data[0] : null;

    return json({ portfolio });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ portfolio: null }, { status: 500 });
  }
}

type LoaderData = {
  portfolio: Portfolio | null;
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AdminAbout() {
  const { portfolio } = useLoaderData<LoaderData>();
  const { theme } = useTheme();

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className={`text-center ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          <h1 className="text-2xl font-medium mb-2 text-indigo-800 dark:text-indigo-300">
            Portfolio not found
          </h1>
          <p className="text-gray-500">Please check back later.</p>
        </div>
      </div>
    );
  }

  // Safe getters with fallbacks
  const getName = () => portfolio.name || "Unknown User";
  const getBio = () => portfolio.bio || "No bio available";
  const getPortraitUrl = () => portfolio.portraitUrl || portraitImage;
  const getExperiences = () => portfolio.experiences || [];
  const getCertifications = () => portfolio.certifications || [];
  const getHobbies = () => portfolio.hobbies || [];
  const getCurrentWorks = () => portfolio.currentWorks || [];
  const getSocialLinks = () => portfolio.socialLinks || {};
  const getProjects = () => portfolio.projects || [];

  const getSkills = () => {
    if (!portfolio.skills) return [];
    const allSkills = Array.isArray(portfolio.skills)
      ? portfolio.skills
      : Object.values(portfolio.skills).flat();
    return allSkills.slice(0, 10); // Limit to 10 skills
  };

  const skills = getSkills();
  const experiences = getExperiences();
  const certifications = getCertifications();
  const hobbies = getHobbies();
  const currentWorks = getCurrentWorks();
  const socialLinks = getSocialLinks();
  const projects = getProjects();
  console.log(certifications);

  return (
    <motion.div className="min-h-screen" initial="hidden" animate="visible">
      {/* Hero Section - Compact */}
      <motion.section
        className="my-8 p-10 mx-2 dark:border-slate-700 dark:bg-slate-900 bg-slate-50 border-slate-300 border rounded-xl"
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Profile Image */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <img
                src={getPortraitUrl()}
                alt={getName()}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            </motion.div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <motion.h1
                className="text-3xl md:text-4xl font-bold mb-4 text-indigo-800 dark:text-indigo-300"
                variants={fadeInUp}
              >
                {getName()}
              </motion.h1>

              <motion.p
                className={`text-lg mb-6 max-w-2xl ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
                variants={fadeInUp}
              >
                {getBio()}
              </motion.p>

              {/* Quick Info */}
              <motion.div
                className="flex flex-wrap justify-center md:justify-start gap-4 mb-6"
                variants={fadeInUp}
              >
                <div
                  className={`flex items-center gap-2 text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <MapPin size={16} />
                  <span>Hyderabad, India</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Available for work</span>
                </div>
              </motion.div>

              {/* Social Links - Minimal */}
              <motion.div
                className="flex justify-center md:justify-start gap-4"
                variants={stagger}
              >
                {socialLinks.email && (
                  <motion.a
                    href={`mailto:${socialLinks.email}`}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === "dark"
                        ? "hover:bg-gray-800 text-gray-400 hover:text-blue-400"
                        : "hover:bg-gray-100 text-gray-600 hover:text-blue-600"
                    }`}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mail size={20} />
                  </motion.a>
                )}
                {socialLinks.github && (
                  <motion.a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg transition-colors ${
                      theme === "dark"
                        ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                        : "hover:bg-gray-100 text-gray-600 hover:text-black"
                    }`}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaGithub size={20} />
                  </motion.a>
                )}
                {socialLinks.linkedin && (
                  <motion.a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg transition-colors ${
                      theme === "dark"
                        ? "hover:bg-gray-800 text-gray-400 hover:text-blue-400"
                        : "hover:bg-gray-100 text-gray-600 hover:text-blue-600"
                    }`}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaLinkedin size={20} />
                  </motion.a>
                )}
                {socialLinks.twitter && (
                  <motion.a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg transition-colors ${
                      theme === "dark"
                        ? "hover:bg-gray-800 text-gray-400 hover:text-blue-400"
                        : "hover:bg-gray-100 text-gray-600 hover:text-blue-500"
                    }`}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTwitter size={20} />
                  </motion.a>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-16">
        {/* Skills - Minimal Grid */}
        {skills.length > 0 && (
          <motion.section variants={fadeInUp}>
            <h2 className="text-2xl font-bold mb-8 text-indigo-800 dark:text-indigo-300">
              Skills
            </h2>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-5 gap-3"
              variants={stagger}
            >
              {skills.map((skill, index) => (
                <motion.div
                  key={`${skill}-${index}`}
                  className={`px-4 py-2 text-center text-sm rounded-lg border ${
                    theme === "dark"
                      ? "bg-gray-800/50 border-gray-700 text-gray-300"
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                >
                  {skill}
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Projects - Compact Cards */}
        {projects.length > 0 && (
          <motion.section variants={fadeInUp}>
            <h2 className="text-3xl font-bold mb-8 text-indigo-800 dark:text-indigo-300">
              Featured Projects
            </h2>
            <motion.div
              className="grid md:grid-cols-2 gap-6"
              variants={stagger}
            >
              {projects.slice(0, 4).map((project, index) => (
                <motion.div
                  key={`${project.title}-${index}`}
                  className={`p-6 rounded-xl border ${
                    theme === "dark"
                      ? "bg-gray-800/30 border-gray-700 hover:bg-gray-800/50"
                      : "bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                  } transition-all`}
                  variants={fadeInUp}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {project.image && (
                      <div className="md:w-32 md:h-20 flex-shrink-0">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold mb-2 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {project.title}
                      </h3>
                      <p
                        className={`text-sm mb-3 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {project.description}
                      </p>

                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.technologies
                              .slice(0, 3)
                              .map((tech, techIndex) => (
                                <span
                                  key={techIndex}
                                  className={`px-2 py-1 text-xs rounded ${
                                    theme === "dark"
                                      ? "bg-gray-700 text-gray-300"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {tech}
                                </span>
                              ))}
                          </div>
                        )}

                      <div className="flex gap-3">
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 text-sm ${
                              theme === "dark"
                                ? "text-blue-400 hover:text-blue-300"
                                : "text-blue-600 hover:text-blue-700"
                            }`}
                          >
                            <ExternalLink size={14} />
                            Live Demo
                          </a>
                        )}
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 text-sm ${
                              theme === "dark"
                                ? "text-gray-400 hover:text-gray-300"
                                : "text-gray-600 hover:text-gray-700"
                            }`}
                          >
                            <Link size={14} />
                            link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Experience - Clean Timeline */}
        {experiences.length > 0 && (
          <motion.section variants={fadeInUp}>
            <h2 className="text-3xl font-bold mb-8 text-indigo-800 dark:text-indigo-300">
              Experience
            </h2>
            <motion.div className="space-y-6" variants={stagger}>
              {experiences.map((exp, index) => (
                <motion.div
                  key={`${exp.title}-${index}`}
                  className={`border-l-2 pl-6 ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}
                  variants={fadeInUp}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h3
                      className={`text-xl font-semibold ${
                        theme === "dark" ? "text-indigo-300" : "text-gray-900"
                      }`}
                    >
                      {exp.title}
                    </h3>
                    <span
                      className={`text-base leading-relaxed ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {exp.period}
                    </span>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul
                      className={`space-y-1 text-md ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      } list-disc pl-5`}
                    >
                      {exp.description.slice(0, 2).map((desc, i) => (
                        <li key={i}>{desc}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Current Work - Simple Cards */}
        {currentWorks.length > 0 && (
          <motion.section variants={fadeInUp}>
            <h2 className="text-3xl font-bold mb-8 text-indigo-800 dark:text-indigo-300">
              Currently Working On
            </h2>
            <motion.div className="grid gap-4" variants={stagger}>
              {currentWorks.map((work, index) => (
                <motion.div
                  key={`${work.title}-${index}`}
                  className={`p-4 rounded-lg border ${
                    theme === "dark"
                      ? "bg-gray-800/30 border-gray-700"
                      : "bg-green-50 border-green-200"
                  }`}
                  variants={fadeInUp}
                >
                  <h3
                    className={`font-semibold mb-2 text-xl ${
                      theme === "dark" ? "text-green-400" : "text-green-700"
                    }`}
                  >
                    {work.title}
                  </h3>
                  <p
                    className={`text-md ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {work.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Compact Sections for Certifications and Hobbies */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Certifications */}
          {certifications.length > 0 && (
            <motion.section variants={fadeInUp}>
              <h2 className="text-3xl font-semibold mb-6 text-indigo-800 dark:text-indigo-300">
                Certifications
              </h2>
              <motion.div className="space-y-3" variants={stagger}>
                {certifications.slice(0, 4).map((cert, index) => (
                  <motion.div
                    key={`${cert.title}-${index}`}
                    variants={fadeInUp}
                  >
                    <h4
                      className={`font-medium text-xl ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {cert.title}
                    </h4>
                    <p
                      className={`text-md ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {cert.issuer} • {cert.year}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}

          {/* Hobbies */}
          {hobbies.length > 0 && (
            <motion.section variants={fadeInUp}>
              <h2 className="text-3xl font-semibold mb-6 text-indigo-800 dark:text-indigo-300">
                Interests
              </h2>
              <motion.div className="space-y-3" variants={stagger}>
                {hobbies.slice(0, 4).map((hobby, index) => (
                  <motion.div
                    key={`${hobby.name}-${index}`}
                    variants={fadeInUp}
                  >
                    <h4
                      className={`font-medium text-xl ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {hobby.name}
                    </h4>
                    <p
                      className={`text-md ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {hobby.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}
        </div>
      </div>
    </motion.div>
  );
}
