import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  UserCheck,
  Tag,
} from "lucide-react";
import { getProjectBySlug, type ProjectCaseStudy } from "~/Services/content.server";
import MarkdownViewer from "~/components/MarkdownViewer";

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) {
    throw new Response("Project slug is required", { status: 400 });
  }

  const project = await getProjectBySlug(slug);
  if (!project) {
    throw new Response("Project case study not found", { status: 404 });
  }

  return json({ project });
}

export default function ProjectDetail() {
  const { project } = useLoaderData<{ project: ProjectCaseStudy }>();

  return (
    <motion.article
      className="space-y-8 font-sans"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Breadcrumb navigation */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to all projects</span>
        </Link>
      </div>

      {/* Case Study Header Card */}
      <header className="space-y-5 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
            <span>{project.category || "Case Study"}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            {project.title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
            {project.summary}
          </p>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-1.5">
            <UserCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{project.role}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-zinc-400" />
            <span>{project.period}</span>
          </div>
        </div>

        {/* Tech Stack Pills */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Tag size={13} />
            <span>Technologies & Tools</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech, i) => (
              <span
                key={i}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/50"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {(project.demoUrl || project.githubUrl) && (
          <div className="flex flex-wrap items-center gap-3 pt-3">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
              >
                <span>Live Demonstration</span>
                <ExternalLink size={13} />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700/70 transition-colors"
              >
                <Github size={14} />
                <span>GitHub Repository</span>
              </a>
            )}
          </div>
        )}
      </header>

      {/* Case Study Content with Markdown & Mermaid */}
      <main className="pt-2">
        <MarkdownViewer content={project.content} />
      </main>

      {/* Footer Navigation */}
      <div className="pt-10 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft size={13} />
          <span>Explore other case studies</span>
        </Link>
        <a
          href="#top"
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Back to top ↑
        </a>
      </div>
    </motion.article>
  );
}
