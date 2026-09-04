import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProjectBySlug, type ProjectCaseStudy } from "~/Services/content.server";
import MarkdownViewer from "~/components/MarkdownViewer";

export const headers = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
});

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) {
    throw new Response("Project slug is required", { status: 400 });
  }

  const project = await getProjectBySlug(slug);
  if (!project) {
    throw new Response("Project case study not found", { status: 404 });
  }

  return json(
    { project },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}

export default function ProjectDetail() {
  const { project } = useLoaderData<{ project: ProjectCaseStudy }>();

  return (
    <article className="space-y-6 sm:space-y-8 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          to="/projects"
          prefetch="intent"
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors font-mono py-1"
        >
          <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          <span>Projects</span>
        </Link>
      </div>

      {/* Case Study Header */}
      <header className="space-y-3.5 sm:space-y-4 pb-5 sm:pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500">
            {project.category && (
              <>
                <span>{project.category}</span>
                {project.period && <span>/</span>}
              </>
            )}
            {project.period && <span>{project.period}</span>}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight font-mono break-words">
            {project.title}
          </h1>

          {project.summary && (
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed pt-0.5">
              {project.summary}
            </p>
          )}
        </div>

        {/* Metadata Details */}
        {project.role && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs sm:text-sm pt-0.5">
            <div>
              <span className="text-zinc-400 dark:text-zinc-500 font-mono">Role: </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{project.role}</span>
            </div>
          </div>
        )}

        {/* Tech Badges */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.techStack.map((tech, i) => (
              <span
                key={i}
                className="text-[11px] sm:text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/60"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Action Links */}
        {(project.demoUrl || project.githubUrl) && (
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 pt-2 text-xs sm:text-sm font-mono">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="group font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 py-1"
              >
                <span>Live Demonstration</span>
                <span className="inline-block transition-transform duration-200 group-hover:-rotate-45 origin-center text-xs">
                  →
                </span>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="group text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1 py-1"
              >
                <span>Source Code</span>
                <span className="inline-block transition-transform duration-200 group-hover:-rotate-45 origin-center text-xs">
                  →
                </span>
              </a>
            )}
          </div>
        )}
      </header>

      {/* Case Study Content */}
      <main className="pt-1 sm:pt-2">
        <MarkdownViewer content={project.content} />
      </main>

      {/* Footer Navigation */}
      <div className="pt-6 sm:pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs sm:text-sm text-zinc-500 font-mono">
        <Link
          to="/projects"
          prefetch="intent"
          className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline py-1"
        >
          ← All projects
        </Link>
        <a
          href="#top"
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors py-1"
        >
          Top ↑
        </a>
      </div>
    </article>
  );
}
