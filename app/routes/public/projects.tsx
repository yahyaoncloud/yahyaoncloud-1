import { useMemo } from "react";
import { json, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { getAllProjects } from "~/Services/content.server";
import { TechIcon } from "~/components/TechIcon";
import { LuX as X, LuArrowLeft, LuArrowUp, LuArrowUpRight } from "~/components/ui/icons";

export const headers = () => ({
  "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=86400",
});

export const meta: MetaFunction = () => {
  return [
    { title: "Projects — Yahya" },
    {
      name: "description",
      content:
        "Engineering case studies on multi-region Kubernetes, enterprise network migrations, and cloud platform automation.",
    },
  ];
};

export async function loader() {
  const projects = await getAllProjects();
  const summaryProjects = projects.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    summary: p.summary,
    techStack: p.techStack,
    githubUrl: p.githubUrl,
    demoUrl: p.demoUrl,
  }));
  return json(
    { projects: summaryProjects },
    {
      headers: {
        "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=86400",
      },
    }
  );
}

export default function ProjectsIndex() {
  const { projects } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "All";
  const selectedSkill = searchParams.get("skill") || null;

  // Extract all unique individual categories by splitting any comma-separated values
  const dynamicCategories: string[] = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          projects.flatMap((p) =>
            p.category
              ? p.category.split(",").map((c) => c.trim()).filter(Boolean)
              : []
          )
        )
      ).sort(),
    ];
  }, [projects]);

  const setCategory = (cat: string) => {
    const next = new URLSearchParams(searchParams);
    if (cat === "All") {
      next.delete("category");
    } else {
      next.set("category", cat);
    }
    setSearchParams(next, { replace: true });
  };

  const setSkill = (skill: string) => {
    const next = new URLSearchParams(searchParams);
    if (selectedSkill?.toLowerCase() === skill.toLowerCase()) {
      next.delete("skill");
    } else {
      next.set("skill", skill);
    }
    setSearchParams(next, { replace: true });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // 1. Category filter
      if (selectedCategory !== "All") {
        const cats = p.category
          ? p.category.split(",").map((c) => c.trim().toLowerCase())
          : [];
        if (!cats.includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // 2. Skill filter
      if (selectedSkill) {
        const skills = (p.techStack || []).flatMap((t: string) =>
          t.split(/[,+]/).map((s) => s.trim().toLowerCase().replace(/^\(+|\)+$/g, "")).filter(Boolean)
        );
        if (!skills.includes(selectedSkill.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [projects, selectedCategory, selectedSkill]);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header Section (Navbar Design Language Reference) */}
      <header className="space-y-3 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Projects
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Engineering case studies on multi-region Kubernetes, enterprise network migrations, and cloud platform automation.
        </p>
      </header>

      {/* Filter Controls */}
      <div className="space-y-3">
        {/* Dynamic Category Filter Pills with subtle indigo hover */}
        {dynamicCategories.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            {dynamicCategories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs md:text-sm px-2.5 py-0.5 rounded-md transition-all duration-150 active:scale-95 cursor-pointer font-mono ${
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-900/70 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-zinc-200/80 dark:border-zinc-800/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Active Skill Filter Pill if applied */}
        {selectedSkill && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-zinc-500 dark:text-zinc-400">Active skill filter:</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs">
              <TechIcon name={selectedSkill} size={12} useBrandColor={false} />
              <span>{selectedSkill}</span>
              <button
                type="button"
                onClick={() => setSkill(selectedSkill)}
                className="cursor-pointer hover:opacity-80 p-0.5 ml-0.5"
                title="Remove filter"
              >
                <X size={12} />
              </button>
            </span>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 ml-1 cursor-pointer"
            >
              clear all
            </button>
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className="space-y-7">
        {filteredProjects.length === 0 ? (
          <div className="py-12 text-center space-y-3 font-mono">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No projects found matching the selected filter.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const desc = project.summary || "";
            // Clean up and split any composite tags if present
            const tags = (project.techStack || []).flatMap((t: string) =>
              t.split(/[,+]/).map((s) => s.trim().replace(/^\(+|\)+$/g, "")).filter(Boolean)
            );

            // Split and trim categories
            const categories = project.category
              ? project.category.split(",").map((c) => c.trim()).filter(Boolean)
              : [];

            return (
              <article key={project.slug} className="space-y-2 group">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <Link
                    to={`/projects/${project.slug}`}
                    prefetch="intent"
                    className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:underline underline-offset-4 text-base md:text-lg transition-colors"
                  >
                    {project.title}
                  </Link>
                  {categories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-[11px] md:text-xs font-mono text-zinc-400 dark:text-zinc-500 shrink-0">
                      {categories.map((cat, idx, arr) => (
                        <span key={idx} className="inline-flex items-center">
                          <button
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer ${
                              selectedCategory.toLowerCase() === cat.toLowerCase()
                                ? "text-indigo-600 dark:text-indigo-400 font-medium underline underline-offset-2"
                                : ""
                            }`}
                            title={`Filter by category ${cat}`}
                          >
                            {cat}
                          </button>
                          {idx < arr.length - 1 && (
                            <span className="mx-1 text-zinc-300 dark:text-zinc-700">·</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {desc && (
                  <p className="text-zinc-600 dark:text-zinc-400 text-[15px] md:text-base line-clamp-2">
                    {desc}
                  </p>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag: string, idx: number) => {
                      const isSkillSelected = selectedSkill?.toLowerCase() === tag.toLowerCase();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSkill(tag)}
                          title={`Filter projects using ${tag}`}
                          className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md transition-all duration-150 cursor-pointer ${
                            isSkillSelected
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium shadow-xs border border-zinc-900 dark:border-zinc-100"
                              : "bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30"
                          }`}
                        >
                          <TechIcon name={tag} size={13} useBrandColor={!isSkillSelected} />
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Links with subtle indigo hover */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs md:text-sm font-mono">
                  <Link
                    to={`/projects/${project.slug}`}
                    prefetch="intent"
                    className="text-zinc-900 dark:text-zinc-100 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Read Case Study</span>
                    <span className="text-xs">→</span>
                  </Link>
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
                    >
                      <span>GitHub</span>
                      <LuArrowUpRight size={11} className="opacity-60" />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Demo</span>
                      <LuArrowUpRight size={11} className="opacity-60" />
                    </a>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Footer Navigation Bar (Navbar UI Reference) */}
      <footer className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs sm:text-sm font-mono">
        <Link
          to="/"
          prefetch="intent"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <LuArrowLeft size={13} />
          <span>Back home</span>
        </Link>
        <a
          href="#top"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <span>Top</span>
          <LuArrowUp size={13} />
        </a>
      </footer>
    </div>
  );
}
