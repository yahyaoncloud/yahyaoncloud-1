import { motion } from "framer-motion";
import { json, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { environment } from "../environments/environment";
import { useTheme } from "../Contexts/ThemeContext";

import type {
  Portfolio,
  Experience,
  Certification,
  Hobby,
  CurrentWork,
  Skills,
  Education,
  Achievement,
  SocialLinks,
} from "../Types/portfolio";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const res = await fetch(`${environment.GO_BACKEND_URL}/portfolio`);
    console.log("Portfolio data loaded:", res);
    if (!res.ok)
      throw new Error(`Failed to fetch portfolio: ${res.statusText}`);
    const data: Portfolio = await res.json();

    // Sanitize data to remove circular references
    const sanitizedData: Portfolio = {
      name: data.name || "Unknown",
      bio: data.bio || "No bio available",
      portraitUrl: data.portraitUrl || "/default-portrait.jpg",
      experiences: Array.isArray(data.experiences)
        ? data.experiences.map((exp) => ({
            title: exp.title || "",
            period: exp.period || "",
            description: Array.isArray(exp.description)
              ? exp.description.slice(0) // Clone to avoid references
              : exp.description
              ? [String(exp.description)]
              : [],
          }))
        : [],
      skills: Array.isArray(data.skills)
        ? data.skills.map((skill) => String(skill))
        : Object.values(data.skills || {})
            .flat()
            .map((skill) =>
              typeof skill === "string"
                ? skill
                : skill.name || skill.title || ""
            )
            .filter(Boolean),
      currentWorks: Array.isArray(data.currentWorks)
        ? data.currentWorks.map((work) => ({
            title: work.title || work.name || "",
            description: String(work.description || ""),
          }))
        : [],
      certifications: Array.isArray(data.certifications)
        ? data.certifications.map((cert) => ({
            title: cert.title || cert.name || "",
            issuer: cert.issuer || "",
            year: cert.year || cert.date || "",
          }))
        : [],
      hobbies: Array.isArray(data.hobbies)
        ? data.hobbies.map((hobby) =>
            typeof hobby === "string" ? hobby : hobby.name || hobby.title || ""
          )
        : [],
      socialLinks: {
        linkedin: String(data.socialLinks?.linkedin || ""),
        github: String(data.socialLinks?.github || ""),
        twitter: String(data.socialLinks?.twitter || ""),
        youtube: String(data.socialLinks?.youtube || ""),
        instagram: String(data.socialLinks?.instagram || ""),
        email: String(data.socialLinks?.email || ""),
      },
    };

    // Verify data is serializable
    try {
      JSON.stringify(sanitizedData);
    } catch (e) {
      console.error("Serialization error in portfolio data:", e);
      throw new Error("Invalid portfolio data structure");
    }

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
  const { name, bio, portraitUrl, experiences, skills, currentWorks } =
    useLoaderData<typeof loader>();
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto p-10 h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 min-h-screen items-start ">
          {/* Left Side - Profile */}
          <motion.div
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <img
                src={portraitUrl}
                alt={name}
                className="w-64 h-64 lg:w-80 lg:h-80 rounded-2xl object-cover border border-blue-500"
              />
            </div>

            <div className="max-w-md">
              <h1
                className={`text-4xl lg:text-5xl prose mb-6 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {name}
              </h1>

              <p
                className={`text-lg leading-relaxed ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {bio}
              </p>
            </div>
            {/* Social Links */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4"></div>
          </motion.div>

          {/* Right Side - Experience */}
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {experiences && experiences.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h2
                  className={`text-3xl prose mb-8 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Experience
                </h2>

                <div className="space-y-6">
                  {experiences.slice(0, 3).map((exp, index) => (
                    <div
                      key={index}
                      className={`border-l-2 pl-6 ${
                        theme === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <h3
                        className={`font-medium text-lg ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {exp.title}
                      </h3>
                      <p
                        className={`text-sm mt-1 mb-2 ${
                          theme === "dark" ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {exp.period}
                      </p>

                      {Array.isArray(exp.description) ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {exp.description.map((point, i) => (
                            <li
                              key={i}
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {point}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
            {/* Current Focus */}
            {currentWorks && currentWorks.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h2
                  className={`text-3xl prose mb-8 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Currently Working On
                </h2>

                <div className="space-y-4">
                  {currentWorks.slice(0, 2).map((work, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border transition-colors ${
                        theme === "dark"
                          ? "border-gray-800 bg-gray-800/30"
                          : "border-gray-200 bg-gray-50/50"
                      }`}
                    >
                      <h3
                        className={`font-medium text-md mb-2 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {work.title || work.name}
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {work.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
