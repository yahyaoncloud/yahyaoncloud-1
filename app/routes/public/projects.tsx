import { useState } from "react";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllProjects, type ProjectCaseStudy } from "~/Services/content.server";

export async function loader() {
  const projects = await getAllProjects();
  return json({ projects });
}

export default function ProjectsIndex() {
  const { projects } = useLoaderData<typeof loader>();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const dynamicCategories: string[] = [
    "All",
    ...Array.from(
      new Set(
        projects
          .map((p: ProjectCaseStudy) => p.category)
          .filter((c): c is string => Boolean(c))
      )
    ),
  ];

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p: ProjectCaseStudy) => p.category === selectedCategory);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1>Projects</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Engineering case studies on multi-region Kubernetes, enterprise SDN migrations, and distributed telemetry meshes.
        </p>
      </div>

      {/* Dynamic Category Filter Pills */}
      {dynamicCategories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs md:text-sm px-2.5 py-0.5 rounded-md transition-all duration-150 active:scale-95 cursor-pointer font-mono ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-900/70 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-7">
        {filteredProjects.map((project: ProjectCaseStudy) => {
          const desc = project.summary || "";
          const tags = project.techStack || [];

          return (
            <article key={project.slug} className="space-y-2 group">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <Link
                  to={`/projects/${project.slug}`}
                  className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:underline underline-offset-4 text-base md:text-lg transition-colors"
                >
                  {project.title}
                </Link>
                {project.category && (
                  <span className="text-[11px] md:text-xs font-mono text-zinc-400 dark:text-zinc-500 shrink-0">
                    {project.category}
                  </span>
                )}
              </div>

              {desc && (
                <p className="text-zinc-600 dark:text-zinc-400 text-[15px] md:text-base line-clamp-2">
                  {desc}
                </p>
              )}

              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[11px] md:text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900/70 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs md:text-sm font-mono">
                <Link
                  to={`/projects/${project.slug}`}
                  className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline"
                >
                  Read Case Study →
                </Link>
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    GitHub
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    Demo
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
