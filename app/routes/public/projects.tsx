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

  const categories = ["All", "Cloud & DevOps", "Networking & SDN", "Observability & SRE"];

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p: ProjectCaseStudy) => p.category === selectedCategory);

  return (
    <div className="space-y-10 text-[15px] md:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Projects
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base">
          Engineering case studies on multi-region Kubernetes, enterprise SDN migrations, and distributed telemetry meshes.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs md:text-sm px-3 py-1 rounded transition-all duration-150 active:scale-95 cursor-pointer ${
              selectedCategory === cat
                ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-medium"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="space-y-8">
        {filteredProjects.map((project: ProjectCaseStudy) => (
          <article key={project.slug} className="space-y-2 pb-6 border-b border-zinc-100 dark:border-zinc-900 last:border-b-0">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
              <Link
                to={`/projects/${project.slug}`}
                className="font-medium text-base md:text-[17px] text-zinc-900 dark:text-zinc-100 hover:underline decoration-zinc-400 underline-offset-4"
              >
                {project.title}
              </Link>
              <span className="font-mono text-xs md:text-sm text-zinc-400 shrink-0">
                {project.period}
              </span>
            </div>

            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              {project.summary}
            </p>

            {/* Tech Tags */}
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

            {/* Links */}
            <div className="flex items-center gap-4 pt-1 text-xs md:text-sm">
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
