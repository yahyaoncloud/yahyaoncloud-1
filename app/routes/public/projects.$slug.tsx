import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
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
    <article className="space-y-8 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/projects"
          className="text-xs md:text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1"
        >
          ← Projects
        </Link>
      </div>

      {/* Case Study Header */}
      <header className="space-y-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs md:text-sm text-zinc-400">
            <span>{project.category}</span>
            <span>/</span>
            <span>{project.period}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
            {project.title}
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 pt-1 text-base">
            {project.summary}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm pt-1">
          <div>
            <span className="text-zinc-400">Role: </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{project.role}</span>
          </div>
        </div>

        {/* Tech Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.techStack.map((tech, i) => (
            <span
              key={i}
              className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/60"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Links */}
        {(project.demoUrl || project.githubUrl) && (
          <div className="flex items-center gap-4 pt-2 text-xs md:text-sm">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
              >
                Live Demonstration
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                GitHub Repository
              </a>
            )}
          </div>
        )}
      </header>

      {/* Case Study Content */}
      <main className="pt-2">
        <MarkdownViewer content={project.content} />
      </main>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs md:text-sm text-zinc-500">
        <Link
          to="/projects"
          className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline"
        >
          ← All projects
        </Link>
        <a
          href="#top"
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Top
        </a>
      </div>
    </article>
  );
}
