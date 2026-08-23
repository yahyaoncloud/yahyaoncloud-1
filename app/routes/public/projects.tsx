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
              className={`text-sm md:text-base px-3 py-1 rounded transition-all duration-150 active:scale-95 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-medium"
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
        {filteredProjects.map((project: ProjectCaseStudy) => (
          <article key={project.slug} className="space-y-2 group">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <Link
                to={`/projects/${project.slug}`}
                className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:underline underline-offset-4 text-lg md:text-xl"
              >
                {project.title}
              </Link>
              {project.category && (
                <span className="text-xs md:text-sm font-mono text-zinc-400 shrink-0">
                  {project.category}
                </span>
              )}
            </div>

            {project.description && (
              <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-[17px] line-clamp-2">
                {project.description}
              </p>
            )}

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs md:text-sm font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900/70 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            <div className="flex items-center gap-4 pt-1 text-sm md:text-base">
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
        ))}
      </div>
    </div>
  );
}
