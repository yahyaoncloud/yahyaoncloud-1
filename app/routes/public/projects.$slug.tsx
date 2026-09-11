import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProjectBySlug, type ProjectCaseStudy } from "~/Services/content.server";
import MarkdownViewer from "~/components/MarkdownViewer";
import { TechIcon } from "~/components/TechIcon";
import {
  LuArrowLeft,
  LuArrowUp,
  LuArrowUpRight,
  LuGlobe,
  LuGithub,
} from "~/components/ui/icons";

export const headers = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
});

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.project) {
    return [{ title: "Project Not Found — Yahya" }];
  }
  return [
    { title: `${data.project.title} — Case Study | Yahya` },
    { name: "description", content: data.project.summary },
  ];
};

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
      {/* Breadcrumb Navigation Bar (Navbar UI Reference) */}
      <nav
        className="flex items-center justify-between gap-3 text-xs sm:text-sm font-mono"
        aria-label="Breadcrumb"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/projects"
            prefetch="intent"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-zinc-200/70 dark:border-zinc-800/70 transition-colors"
          >
            <LuArrowLeft size={13} />
            <span>Projects</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700 select-none text-base">/</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-[200px] sm:max-w-sm">
            {project.slug}
          </span>
        </div>

        {project.period && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100/70 dark:bg-zinc-900/70 text-zinc-500 dark:text-zinc-400 text-xs border border-zinc-200/60 dark:border-zinc-800/60">
            {project.period}
          </span>
        )}
      </nav>

      {/* Case Study Header Card (Navbar Surface Styling Reference) */}
      <header className="space-y-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="space-y-2.5">
          {/* Categories & Metadata row */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {project.category && (
              <div className="flex flex-wrap items-center gap-1.5">
                {project.category
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean)
                  .map((cat, idx) => (
                    <Link
                      key={idx}
                      to={`/projects?category=${encodeURIComponent(cat)}`}
                      className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
              </div>
            )}
            {project.role && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700 select-none">•</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {project.role}
                </span>
              </>
            )}
            {project.period && (
              <span className="sm:hidden font-mono text-zinc-400 dark:text-zinc-500">
                • {project.period}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight break-words">
            {project.title}
          </h1>

          {/* Summary */}
          {project.summary && (
            <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed max-w-3xl pt-0.5">
              {project.summary}
            </p>
          )}
        </div>

        {/* Tech Badges */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(project.techStack || [])
              .flatMap((t: string) =>
                t
                  .split(/[,+]/)
                  .map((s) => s.trim().replace(/^\(+|\)+$/g, ""))
                  .filter(Boolean)
              )
              .map((tech, i) => (
                <Link
                  key={i}
                  to={`/projects?skill=${encodeURIComponent(tech)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
                  title={`View all projects using ${tech}`}
                >
                  <TechIcon name={tech} size={14} useBrandColor />
                  <span>{tech}</span>
                </Link>
              ))}
          </div>
        )}

        {/* Action Buttons (Navbar Button UI Reference with subtle indigo hover) */}
        {(project.demoUrl || project.githubUrl) && (
          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs sm:text-sm font-mono">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white shadow-xs active:scale-[0.98] transition-all"
              >
                <LuGlobe size={14} />
                <span>Live Demo</span>
                <LuArrowUpRight size={13} className="opacity-70" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs active:scale-[0.98] transition-all"
              >
                <LuGithub size={14} />
                <span>Source Code</span>
                <LuArrowUpRight size={13} className="opacity-60" />
              </a>
            )}
          </div>
        )}
      </header>

      {/* Case Study Content */}
      <main className="pt-1 sm:pt-2">
        <MarkdownViewer content={project.content} />
      </main>

      {/* Footer Navigation Bar (Navbar UI Reference) */}
      <footer className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs sm:text-sm font-mono">
        <Link
          to="/projects"
          prefetch="intent"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <LuArrowLeft size={13} />
          <span>All projects</span>
        </Link>
        <a
          href="#top"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <span>Top</span>
          <LuArrowUp size={13} />
        </a>
      </footer>
    </article>
  );
}
