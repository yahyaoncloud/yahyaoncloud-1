import { useState } from "react";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Github, Terminal } from "lucide-react";
import { getAllProjects, type ProjectCaseStudy } from "~/Services/content.server";

export async function loader() {
  const projects = await getAllProjects();
  return json({ projects });
}

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function ProjectsIndex() {
  const { projects } = useLoaderData<typeof loader>();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(projects.map((p: ProjectCaseStudy) => p.category).filter(Boolean)))];

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p: ProjectCaseStudy) => p.category === selectedCategory);

  return (
    <motion.div className="space-y-10" initial="hidden" animate="visible" variants={fadeInUp}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Terminal size={20} className="text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Project Case Studies
          </h1>
        </div>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl">
          In-depth technical writeups, architecture topologies, and implementation details of systems engineered across cloud and enterprise network environments.
        </p>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 2 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as string)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Project Cards Grid */}
      <div className="space-y-6">
        {filteredProjects.map((project: ProjectCaseStudy) => (
          <div
            key={project.slug}
            className="group p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-all duration-200 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-medium">
                  {project.category || "Case Study"}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{project.role}</span>
              </div>
              <span className="text-xs font-mono text-zinc-400">{project.period}</span>
            </div>

            <div className="space-y-2">
              <Link to={`/projects/${project.slug}`} className="block group">
                <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                  <span>{project.title}</span>
                  <ArrowRight
                    size={16}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-600 dark:text-indigo-400 shrink-0"
                  />
                </h2>
              </Link>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {project.summary}
              </p>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Bottom Links */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
              <div className="flex items-center gap-3">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span>Live Demo</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Github size={12} />
                    <span>Repository</span>
                  </a>
                )}
              </div>

              <Link
                to={`/projects/${project.slug}`}
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Read Case Study</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
