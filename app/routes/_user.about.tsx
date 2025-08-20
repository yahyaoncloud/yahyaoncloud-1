import { motion } from "framer-motion";
import { json, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import Yahya from "../assets/yahya.png";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLocationArrow,
} from "react-icons/fa";
import {
  Mail,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  LocateIcon,
} from "lucide-react";
import { getAllPortfolios } from "../Services/post.server";
import type {
  Portfolio,
  Experience,
  Certification,
  SocialLinks,
} from "../Types/portfolio";
import fallbackPortrait from "../assets/Gallery/glass.png";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const data = await getAllPortfolios();
    const portfolio = Array.isArray(data) && data.length > 0 ? data[0] : null;
    console.log(portfolio.certifications);
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
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminAbout() {
  const { portfolio } = useLoaderData<LoaderData>();
  const { theme } = useTheme();

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <h1 className="text-lg font-medium">Portfolio not found</h1>
        <p className="text-sm text-zinc-500">Please check back later.</p>
      </div>
    );
  }

  // --- Helpers ---
  const getName = () => portfolio.name || "Unknown User";
  const getPortraitUrl = () =>
    portfolio.portraitUrl && portfolio.portraitUrl.startsWith("http")
      ? portfolio.portraitUrl
      : fallbackPortrait;
  const getBio = () => {
    if (!portfolio.bio) return [];
    return Array.isArray(portfolio.bio) ? portfolio.bio : [portfolio.bio];
  };
  const getSkills = () => {
    if (!portfolio.skills) return [];
    const allSkills = Array.isArray(portfolio.skills)
      ? portfolio.skills
      : Object.values(portfolio.skills).flat();
    return allSkills.slice(0);
  };

  return (
    <motion.div
      className="min-h-screen max-w-4xl mx-auto px-6 py-12 space-y-16 font-sans"
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section
        className="flex flex-col pt-6 md:flex-row items-center md:items-start gap-8 text-center md:text-left"
        variants={fadeInUp}
      >
        {/* Portrait + Info */}
        <div className="flex flex-col w-1/2 text-center items-center md:items-start gap-4">
          <img
            src={Yahya}
            alt={getName()}
            className="w-28 h-28 rounded-full object-cover shadow-sm border border-zinc-200 dark:border-zinc-800"
          />

          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold">{getName()}</h1>
            {portfolio.location && (
              <div className="flex items-center justify-center  gap-2 text-sm text-zinc-500">
                <MapPin size={14} /> {portfolio.location}
              </div>
            )}
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Available
            </div>
          </div>
        </div>

        {/* Bio */}
        {getBio().length > 0 && (
          <div
            className={` md:text-md text-sm leading-relaxed ${
              theme === "dark" ? "text-zinc-400" : "text-zinc-600"
            }`}
          >
            {getBio().map((line, i) => (
              <p key={i} className="mb-2 last:mb-0">
                {line}
              </p>
            ))}
          </div>
        )}
      </motion.section>
      {/* Experience */}
      {portfolio.experiences?.length > 0 && (
        <motion.section variants={fadeInUp}>
          <Experience experiences={portfolio.experiences} />
        </motion.section>
      )}
      {/* Skills */}
      {getSkills().length > 0 && (
        <motion.section variants={fadeInUp}>
          <h2 className="text-lg font-semibold mb-4">Skills</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {getSkills().map((skill, i) => (
              <li key={i} className="opacity-80">
                {skill}
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* Projects */}
      {portfolio.projects?.length > 0 && (
        <motion.section variants={fadeInUp}>
          <h2 className="text-lg font-semibold mb-4">Projects</h2>
          <div className="space-y-4 sm:space-y-6">
            {portfolio.projects.slice(0, 3).map((project, i) => (
              <div key={i} className="space-y-1">
                <h3 className="font-medium">{project.title}</h3>
                <p className="text-sm text-zinc-500">{project.description}</p>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm text-indigo-600 hover:underline"
                  >
                    <ExternalLink size={14} className="mr-1" /> View
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {portfolio.certifications?.length > 0 && (
        <motion.section variants={fadeInUp}>
          <Certifications certifications={portfolio.certifications} />
        </motion.section>
      )}
      {portfolio.socialLinks && (
        <motion.section variants={fadeInUp}>
          <Socials socials={portfolio.socialLinks} />
        </motion.section>
      )}
    </motion.div>
  );
}
type ExperienceProps = {
  experiences: Experience[];
};
// --- Dropdown Experience Component ---
function Experience({ experiences }: ExperienceProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="gap-2">
      <h2 className="text-lg font-semibold">Experience</h2>
      <div className="gap-2">
        {experiences.map((exp, i) => {
          const isOpen = open === i;

          return (
            <div key={i} className="w-full">
              {/* Desktop layout */}
              <div className="hidden md:flex w-full">
                {/* Left column: Year + Present */}
                <div className="flex items-start gap-2 w-28 shrink-0 pt-2">
                  <span className="text-md text-zinc-400">{exp.year}</span>
                  {Number(exp.isWorking) === 1 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                      Present
                    </span>
                  )}
                </div>

                {/* Right column */}
                <div className="flex-1 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full gap-4 border-b dark:border-b-zinc-700 border-b-zinc-300 text-left pb-2"
                  >
                    <div className="max-w-full flex justify-between items-center w-full">
                      <span className="flex items-center gap-6">
                        {isOpen ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        <span className="font-medium">{exp.company}</span>
                      </span>
                      <span className="text-sm text-zinc-400">{exp.role}</span>
                    </div>
                  </button>

                  {/* Dropdown */}
                  <div
                    className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-40 mt-2" : "max-h-0"
                    }`}
                  >
                    {exp.summary?.length > 0 && (
                      <div className="text-sm p-1 leading-relaxed text-zinc-500 dark:text-zinc-400">
                        <p>{exp.summary}</p>
                        <p className="text-xs text-center justify-end my-4 gap-2 flex">
                          <MapPin size={16} />
                          {exp.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile layout */}
              <div className="flex md:hidden flex-col w-full p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between border-b dark:border-b-zinc-700 border-b-zinc-300 pb-2"
                >
                  <span className="flex items-center gap-2 text-xs">
                    {isOpen ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                    <span className="font-medium">{exp.company}</span>,{" "}
                    <span className="text-zinc-400">{exp.role}</span>
                  </span>
                  <span className="text-xs text-zinc-400">{exp.year}</span>
                </button>

                {/* Dropdown */}
                <div
                  className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-40 mt-2" : "max-h-0"
                  }`}
                >
                  {exp.summary?.length > 0 && (
                    <div className="text-xs py-2 leading-relaxed text-zinc-400">
                      <p>{exp.summary}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// --- Certifications Component ---

type CertificationsProps = {
  certifications: Certification[];
};

function Certifications({ certifications }: CertificationsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Certifications</h2>
      <div className="space-y-3">
        {certifications.map((cert, i) => (
          <div
            key={cert._id || i}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b dark:border-b-zinc-700 border-b-zinc-300 pb-2"
          >
            <div className="flex flex-col">
              <span className="font-medium text-sm sm:text-base">
                {cert.title}
              </span>
              <span className="text-xs sm:text-sm text-zinc-500">
                {cert.issuer}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-zinc-400 mt-1 sm:mt-0">
              {cert.year}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type SocialLinksProps = {
  socials: SocialLinks[];
};

function Socials({ socials }: SocialLinksProps) {
  if (!socials) return null;

  const entries = Object.entries(socials).filter(([_, v]) => v);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Elsewhere</h2>
      <div className="space-y-3">
        {entries.map(([key, value], i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b dark:border-b-zinc-700 border-b-zinc-300 pb-2"
          >
            <span className="capitalize text-sm text-zinc-500">{key}</span>
            <a
              href={key === "email" ? `mailto:${value}` : value}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-indigo-600 break-all sm:break-normal"
            >
              {value}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
