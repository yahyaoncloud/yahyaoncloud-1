import { useState } from "react";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { LuChevronRight as ChevronRight } from "~/components/ui/icons";
import profilePhoto from "~/assets/profile.webp";

import { TechIcon } from "~/components/TechIcon";
import {
  getProfileInfo,
  getFeaturedProjects,
  getFeaturedResearch,
  getAllBlogPosts,
} from "~/Services/content.server";

export const headers = () => ({
  "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=86400",
});

export async function loader() {
  const [profileInfo, featuredProjects, featuredResearch, allPosts] = await Promise.all([
    getProfileInfo(),
    getFeaturedProjects(),
    getFeaturedResearch(),
    getAllBlogPosts(),
  ]);

  // Strip massive markdown contents so they do not bloat initial SSR HTML payload
  const minimalPosts = allPosts.slice(0, 3).map((p) => ({
    slug: p.slug,
    title: p.title,
    displayDate: p.displayDate,
  }));

  const minimalProjects = featuredProjects.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    summary: p.summary,
    githubUrl: p.githubUrl,
    demoUrl: p.demoUrl,
  }));

  const minimalResearch = featuredResearch.map((r) => ({
    slug: r.slug,
    title: r.title,
    year: r.year,
    abstract: r.abstract,
  }));

  return json(
    {
      profileInfo,
      featuredProjects: minimalProjects,
      featuredResearch: minimalResearch,
      recentPosts: minimalPosts,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=86400",
      },
    }
  );
}

export default function Index() {
  const { profileInfo, featuredProjects, featuredResearch, recentPosts } =
    useLoaderData<typeof loader>();
  const [openExperienceIndex, setOpenExperienceIndex] = useState<number | null>(null);

  const toggleExperience = (idx: number) => {
    setOpenExperienceIndex(openExperienceIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-12">
      {/* Profile & Introduction */}
      {profileInfo.sectionsVisibility?.summary !== false && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-md bg-zinc-100 dark:bg-zinc-900 shrink-0 group">
              <img
                src={profilePhoto}
                alt="Yahya"
                width={128}
                height={128}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 rounded-2xl sm:rounded-3xl pointer-events-none" />
            </div>

            <div className="space-y-1">
              <h1 className="font-bold text-zinc-900 dark:text-zinc-100 text-xl sm:text-2xl md:text-3xl tracking-tight leading-snug">
                {profileInfo.headline}
              </h1>
            </div>
          </div>

          <div className="space-y-3.5 text-zinc-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed">
            {profileInfo.bio.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {/* Experience Section (with smooth subtle dropdown animation) */}
      {profileInfo.sectionsVisibility?.experience !== false &&
        profileInfo.experiences &&
        profileInfo.experiences.length > 0 && (
        <section className="space-y-3 pt-2">
          <h2 className="section-heading">Experience</h2>

          <div className="space-y-2">
            {profileInfo.experiences.map((exp, idx) => {
              const isOpen = openExperienceIndex === idx;
              return (
                <div key={idx} className="space-y-1">
                  <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] md:grid-cols-[110px_1fr] gap-x-3 md:gap-x-4 items-start text-sm md:text-base">
                    {/* Year + Present badge column (visible on sm and up) */}
                    <div className="hidden sm:flex py-1.5 items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      <span className="font-normal font-mono text-xs md:text-sm">{exp.year}</span>
                      {exp.present && (
                        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          Present
                        </span>
                      )}
                    </div>

                    {/* Accordion Container */}
                    <div
                      className={`overflow-hidden rounded-lg transition-colors min-w-0 ${
                        isOpen
                          ? "bg-zinc-100/80 dark:bg-zinc-900/60"
                          : "hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleExperience(idx)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between sm:justify-start gap-2 py-1.5 px-2 text-left cursor-pointer text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 select-none group active:scale-[0.99] transition-all min-w-0"
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
                          <ChevronRight
                            size={15}
                            className={`text-zinc-400 transition-transform duration-200 shrink-0 ${
                              isOpen ? "rotate-90 text-zinc-800 dark:text-zinc-200" : ""
                            }`}
                          />
                          <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate text-sm md:text-base">
                            {exp.company}
                          </span>
                        </div>
                        <span className="flex-1 h-px bg-zinc-200/80 dark:bg-zinc-800/80 min-w-[12px] shrink-0" />
                        {/* Desktop role */}
                        <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400 text-xs md:text-sm shrink-0">
                          {exp.role}
                        </span>
                        {/* Mobile year */}
                        <span className="inline sm:hidden font-mono text-xs text-zinc-500 dark:text-zinc-400 shrink-0 select-none">
                          {exp.present ? "Present" : exp.year}
                        </span>
                      </button>

                      {/* Smooth CSS Grid Row Transition */}
                      <div
                        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-5 sm:px-6 pb-3 pt-1 space-y-2 text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                            {exp.role && (
                              <div className="sm:hidden font-medium text-zinc-800 dark:text-zinc-200 text-xs">
                                {exp.role}
                              </div>
                            )}
                            <p className="leading-relaxed text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                              {exp.description}
                            </p>
                            {exp.projects && exp.projects.length > 0 && (
                              <div className="space-y-1 pt-1">
                                {exp.projects.map((proj) => (
                                  <div key={proj.name}>
                                    {proj.internal ? (
                                      <Link
                                        to={proj.url}
                                        className="text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-zinc-50 underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 text-xs md:text-sm"
                                      >
                                        {proj.name}
                                      </Link>
                                    ) : (
                                      <a
                                        href={proj.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-zinc-50 underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 text-xs md:text-sm"
                                      >
                                        {proj.name}
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {profileInfo.sectionsVisibility?.certifications !== false &&
        profileInfo.certifications &&
        profileInfo.certifications.length > 0 && (
          <section className="space-y-3 pt-2">
            <h2 className="section-heading">Certifications</h2>
            <div className="space-y-2">
              {profileInfo.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-0.5 text-zinc-800 dark:text-zinc-200 gap-3 min-w-0 group"
                >
                  <div className="flex items-center min-w-0 max-w-[70%] sm:max-w-[75%]">
                    {cert.credentialUrl ? (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-normal text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 no-underline text-sm md:text-base flex items-center gap-1 min-w-0"
                        title={cert.name}
                      >
                        <span className="truncate group-hover:underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4">
                          {cert.name}
                        </span>
                        <span className="inline-block shrink-0 text-xs opacity-50 group-hover:opacity-100 transition-transform duration-200 group-hover:-rotate-45 origin-center select-none no-underline">
                          →
                        </span>
                      </a>
                    ) : (
                      <span className="font-normal text-zinc-800 dark:text-zinc-200 text-sm md:text-base truncate">
                        {cert.name}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-zinc-200/60 dark:bg-zinc-800/60 min-w-[16px] shrink-0" />
                  <div className="flex items-center gap-2 font-mono text-xs md:text-sm text-zinc-400 dark:text-zinc-500 shrink-0 select-none">
                    <span>{cert.issuer}</span>
                    {cert.issueDate && <span>• {cert.issueDate}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* Skills Section */}
      {profileInfo.sectionsVisibility?.skills !== false &&
        profileInfo.skills &&
        profileInfo.skills.length > 0 && (() => {
          const mode = (profileInfo.skillsDisplayMode || "both").toLowerCase().trim();
          return (
            <section className="space-y-3 pt-2">
              <h2 className="section-heading">Skills</h2>

              {/* Icons-Only Mode */}
              {mode === "icons" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {profileInfo.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="group relative flex items-center justify-center p-2.5 rounded-lg bg-zinc-100/80 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 transition-all hover:scale-110 shadow-xs cursor-default"
                      title={skill}
                      aria-label={skill}
                    >
                      <TechIcon name={skill} size={22} useBrandColor />
                    </div>
                  ))}
                </div>
              )}

              {/* Text-Only Mode */}
              {mode === "text" && (
                <div className="flex flex-wrap gap-1.5">
                  {profileInfo.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs md:text-sm font-mono px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900/70 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Default / Badges Mode (Both Icons & Text) */}
              {mode !== "icons" && mode !== "text" && (
                <div className="flex flex-wrap gap-1.5">
                  {profileInfo.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs md:text-sm font-mono px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900/70 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <TechIcon name={skill} size={15} useBrandColor />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              )}
            </section>
          );
        })()}

      {/* Selected Work Section */}
      {profileInfo.sectionsVisibility?.selectedWork !== false &&
        featuredProjects &&
        featuredProjects.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="section-heading">Selected Work</h2>
              <Link
                to="/projects"
                prefetch="intent"
                className="group text-xs md:text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1.5"
              >
                <span>All projects</span>
                <span className="inline-block transition-transform duration-200 group-hover:-rotate-45 origin-center text-xs">
                  →
                </span>
              </Link>
            </div>

            <div className="space-y-5">
              {featuredProjects.map((project) => (
                <div key={project.slug} className="space-y-1 group">
                  <div className="flex items-baseline justify-between gap-2 min-w-0">
                    <Link
                      to={`/projects/${project.slug}`}
                      prefetch="intent"
                      className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline decoration-zinc-400 underline-offset-4 text-base md:text-lg truncate"
                      title={project.title}
                    >
                      {project.title}
                    </Link>
                    <span className="font-mono text-xs md:text-sm text-zinc-400 shrink-0">
                      {project.category}
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
                    {project.summary}
                  </p>
                  <div className="pt-0.5 flex items-center gap-3 text-sm md:text-base">
                    <Link
                      to={`/projects/${project.slug}`}
                      prefetch="intent"
                      className="group/btn text-zinc-900 dark:text-zinc-100 font-medium hover:underline inline-flex items-center gap-1.5"
                    >
                      <span>Case Study</span>
                      <span className="inline-block transition-transform duration-200 group-hover/btn:-rotate-45 origin-center text-sm">
                        →
                      </span>
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
                </div>
              ))}
            </div>
          </section>
        )}

      {/* Writing Section */}
      {profileInfo.sectionsVisibility?.writing !== false &&
        recentPosts &&
        recentPosts.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="section-heading">Writing</h2>
              <Link
                to="/blog"
                prefetch="intent"
                className="group text-xs md:text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1.5"
              >
                <span>All articles</span>
                <span className="inline-block transition-transform duration-200 group-hover:-rotate-45 origin-center text-xs">
                  →
                </span>
              </Link>
            </div>

            <div className="space-y-2">
              {recentPosts.map((post) => (
                <div key={post.slug} className="group">
                  <Link
                    to={`/blog/${post.slug}`}
                    prefetch="intent"
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 sm:py-1 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors gap-1 sm:gap-3 min-w-0"
                    title={post.title}
                  >
                    <span className="font-normal text-zinc-800 dark:text-zinc-200 group-hover:underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 text-sm md:text-base min-w-0 sm:truncate">
                      {post.title}
                    </span>
                    <div className="hidden sm:block flex-1 h-px bg-zinc-200 dark:bg-zinc-800 min-w-[20px] shrink-0" />
                    <span className="font-mono text-xs md:text-sm text-zinc-400 dark:text-zinc-500 shrink-0 select-none">
                      {post.displayDate}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* Research Section */}
      {profileInfo.sectionsVisibility?.research !== false &&
        featuredResearch &&
        featuredResearch.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="section-heading">Research</h2>
              <Link
                to="/research"
                prefetch="intent"
                className="group text-xs md:text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1.5"
              >
                <span>All papers</span>
                <span className="inline-block transition-transform duration-200 group-hover:-rotate-45 origin-center text-xs">
                  →
                </span>
              </Link>
            </div>

            <div className="space-y-4">
              {featuredResearch.map((paper) => (
                <div key={paper.slug} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 min-w-0">
                    <Link
                      to={`/research/${paper.slug}`}
                      prefetch="intent"
                      className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline decoration-zinc-400 underline-offset-4 text-sm md:text-base truncate"
                      title={paper.title}
                    >
                      {paper.title}
                    </Link>
                    <span className="font-mono text-xs md:text-sm text-zinc-400 shrink-0">
                      {paper.year}
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {paper.abstract}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* Elsewhere Section */}
      {profileInfo.sectionsVisibility?.elsewhere !== false &&
        profileInfo.socialLinks &&
        profileInfo.socialLinks.filter((item) => item && typeof item.href === "string" && item.href.trim().length > 0).length > 0 && (
        <section className="space-y-3 pt-2">
          <h2 className="section-heading">Elsewhere</h2>
          <div className="space-y-2">
            {profileInfo.socialLinks
              .filter((item) => item && typeof item.href === "string" && item.href.trim().length > 0)
              .map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-1.5 sm:py-1 text-sm md:text-base gap-2 sm:gap-3 min-w-0"
              >
                <span className="text-zinc-500 dark:text-zinc-400 font-mono text-xs md:text-sm shrink-0">
                  {item.label}
                </span>
                <div className="flex-1 h-px bg-zinc-200/60 dark:bg-zinc-800/60 min-w-[8px] sm:min-w-[16px]" />
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  title={item.display}
                  className="group text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-2 py-0.5 rounded-md transition-all duration-150 active:scale-[0.98] inline-flex items-center gap-1.5 font-mono text-xs md:text-sm min-w-0 max-w-[62%] sm:max-w-[75%]"
                >
                  <span className="truncate">{item.display}</span>
                  {item.external && (
                    <span className="inline-block shrink-0 opacity-60 group-hover:opacity-100 transition-transform duration-200 group-hover:-rotate-45 origin-center text-xs">
                      →
                    </span>
                  )}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
