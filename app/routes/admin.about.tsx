import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import { Briefcase, Heart, Award, Book } from "lucide-react";
import YahyaPortrait from "../assets/assets_client_upload_media_0101c346d3ee1f1aac0875404d49c85bd57abd85_media_01jxtfqp73fkyaxetk3e9py3hc.png"; // Adjust the path as necessary

// Interfaces for reusability
interface Experience {
  title: string;
  description: string;
  period: string;
}

interface Certification {
  title: string;
  issuer: string;
  year: string;
}

interface Hobby {
  name: string;
  description: string;
}

interface CurrentWork {
  title: string;
  description: string;
}

// Dummy data for Yahya's portfolio
const experiences: Experience[] = [
  {
    title: "Cloud Engineer at TechCorp",
    description:
      "Designed and implemented scalable AWS infrastructure for high-traffic applications, focusing on serverless architectures and CI/CD pipelines.",
    period: "2023 - Present",
  },
  {
    title: "Freelance DevOps Consultant",
    description:
      "Helped startups optimize their Kubernetes clusters and automate deployments using Terraform and GitOps.",
    period: "2021 - 2023",
  },
];

const hobbies: Hobby[] = [
  {
    name: "Open-Source Contribution",
    description:
      "Contributing to cloud-native projects on GitHub, particularly in the Kubernetes and Terraform ecosystems.",
  },
  {
    name: "Tech Blogging",
    description:
      "Writing about cloud technologies, DevOps practices, and sharing insights on my personal blog.",
  },
];

const certifications: Certification[] = [
  {
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    year: "2022",
  },
  {
    title: "Certified Kubernetes Administrator (CKA)",
    issuer: "Cloud Native Computing Foundation",
    year: "2023",
  },
];

const currentWorks: CurrentWork[] = [
  {
    title: "Learning Advanced Machine Learning",
    description:
      "Studying deep learning frameworks like TensorFlow and exploring AI integration with cloud platforms.",
  },
  {
    title: "Building a Serverless Blog Platform",
    description:
      "Developing a personal blog using Remix and AWS Lambda to share cloud computing insights.",
  },
];

export default function AdminAbout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <h1
          className={`text-3xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          About Yahya
        </h1>
        
      </header>

      <div className="max-w-5xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Image Section */}
          <motion.div
            className="relative aspect-square"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={YahyaPortrait}
              alt="Yahya's portrait"
              className={`w-full h-full object-cover rounded-lg shadow-lg ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              } border`}
            />
          </motion.div>

          {/* Content Section */}
          <motion.div
            className="flex flex-col space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Bio */}
            <div
              className={`rounded-lg p-6 shadow-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2
                className={`text-2xl font-semibold mb-4 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                About Me
              </h2>
              <p
                className={`text-base ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                I'm Yahya, a passionate cloud engineer and tech enthusiast
                dedicated to building scalable, secure, and efficient systems.
                Through my blog, I share insights on cloud technologies, DevOps
                practices, and my journey in the tech world. My goal is to
                inspire and educate others in the ever-evolving field of cloud
                computing.
              </p>
            </div>

            {/* Call to Action */}
            <div
              className={`rounded-lg p-6 text-center ${
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-900/50 to-blue-800/50"
                  : "bg-gradient-to-r from-blue-100/50 to-blue-200/50"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Get in Touch
              </h2>
              <motion.a
                href="/admin/create"
                className={`inline-block p-1 px-3 rounded-md font-medium ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Share Your Feedback
              </motion.a>
            </div>
          </motion.div>
        </motion.div>

        {/* Experience Section */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center mb-6">
            <Briefcase
              size={24}
              className={`mr-2 ${
                theme === "dark" ? "text-blue-400" : "text-blue-500"
              }`}
            />
            <h2
              className={`text-2xl font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Experience
            </h2>
          </div>
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                className={`rounded-lg p-6 shadow-lg ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {exp.title}
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-blue-400" : "text-blue-500"
                  }`}
                >
                  {exp.period}
                </p>
                <p
                  className={`text-sm mt-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {exp.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Hobbies Section */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center mb-6">
            <Heart
              size={24}
              className={`mr-2 ${
                theme === "dark" ? "text-blue-400" : "text-blue-500"
              }`}
            />
            <h2
              className={`text-2xl font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Hobbies
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {hobbies.map((hobby, index) => (
              <motion.div
                key={index}
                className={`rounded-lg p-6 shadow-lg ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {hobby.name}
                </h3>
                <p
                  className={`text-sm mt-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {hobby.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Certifications Section */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="flex items-center mb-6">
            <Award
              size={24}
              className={`mr-2 ${
                theme === "dark" ? "text-blue-400" : "text-blue-500"
              }`}
            />
            <h2
              className={`text-2xl font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Certifications
            </h2>
          </div>
          <div className="space-y-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                className={`rounded-lg p-6 shadow-lg ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {cert.title}
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-blue-400" : "text-blue-500"
                  }`}
                >
                  {cert.issuer} - {cert.year}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Currently Studying/Working On Section */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <div className="flex items-center mb-6">
            <Book
              size={24}
              className={`mr-2 ${
                theme === "dark" ? "text-blue-400" : "text-blue-500"
              }`}
            />
            <h2
              className={`text-2xl font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Currently Studying/Working On
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {currentWorks.map((work, index) => (
              <motion.div
                key={index}
                className={`rounded-lg p-6 shadow-lg ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {work.title}
                </h3>
                <p
                  className={`text-sm mt-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {work.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
