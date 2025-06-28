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
} from "../Types/portfolio";

export async function loader({ request }: LoaderFunctionArgs) {
  const res = await fetch(`${environment.GO_BACKEND_URL}/portfolio`);
  if (!res.ok) throw new Error("Failed to fetch portfolio");
  const data: Portfolio = await res.json();
  console.log(data.portraitUrl, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>..");
  console.log("Calling API:", `${environment.GO_BACKEND_URL}/portfolio`);

  return json(data);
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
                className="w-64 h-64 lg:w-80 lg:h-80 rounded-2xl object-cover shadow-2xl"
              />
            </div>

            <div className="max-w-md">
              <h1
                className={`text-4xl lg:text-5xl font-light mb-6 ${
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
                  className={`text-3xl font-light mb-8 ${
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}
