import { useState } from "react";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ChevronRight } from "lucide-react";
import { getFeaturedProjects, getFeaturedResearch, getAllBlogPosts } from "~/Services/content.server";

export async function loader() {
  const [featuredProjects, featuredResearch, allPosts] = await Promise.all([
    getFeaturedProjects(),
    getFeaturedResearch(),
    getAllBlogPosts(),
  ]);

  return json({
    featuredProjects,
    featuredResearch,
    recentPosts: allPosts.slice(0, 3),
  });
}

export default function Index() {
  const { featuredProjects, featuredResearch, recentPosts } = useLoaderData<typeof loader>();
  const [openExperienceIndex, setOpenExperienceIndex] = useState<number | null>(0);

  const experiences = [
    {
      year: "2024",
      present: true,
      company: "Cloud & DevOps",
      role: "Engineer",
      description:
        "Architecting multi-region Kubernetes clusters, GitOps pipelines with ArgoCD, Terraform IaC automation, and distributed observability meshes across AWS and hybrid clouds.",
      projects: [
        { name: "Multi-Region Cloud GitOps Platform", url: "/projects/multi-region-cloud-gitops", internal: true },
        { name: "Distributed Observability & Telemetry Mesh", url: "/projects/observability-mesh-telemetry", internal: true },
      ],
    },
    {
      year: "2022",
      present: false,
      company: "Network Infrastructure",
      role: "Engineer",
      description:
        "Managed enterprise multi-vendor routing and switching, BGP peering, OSPF network backbones, hardware firewalls, site-to-site VPN tunnels, and zero-trust SDN migrations.",
      projects: [
        { name: "Hybrid Cloud Enterprise Network & Zero-Trust SDN", url: "/projects/hybrid-sdn-infrastructure", internal: true },
        { name: "eBPF-Driven Cloud Traffic Engineering", url: "/research", internal: true },
      ],
    },
  ];

  const skills = [
    "AWS (EKS, VPC, Route53)",
    "Kubernetes & ArgoCD",
    "Terraform (IaC)",
    "Docker & Containers",
    "CI/CD (GitHub Actions)",
    "Linux & Networking (BGP/OSPF)",
    "Python & Bash Scripting",
    "Cloud Architecture & SRE",
    "Remix / TypeScript",
  ];

  const elsewhereLinks = [
    { label: "Twitter", href: "https://x.com/yahyaoncloud", display: "https://twitter.com/yahyaoncloud", external: true },
    { label: "GitHub", href: "https://github.com/yahyaoncloud", display: "https://github.com/yahyaoncloud", external: true },
    { label: "LinkedIn", href: "https://linkedin.com/in/ykinwork1", display: "https://linkedin.com/in/ykinwork1", external: true },
    { label: "Email", href: "mailto:hello@yahyaoncloud.com", display: "hello@yahyaoncloud.com", external: false },
  ];

  const toggleExperience = (idx: number) => {
    setOpenExperienceIndex(openExperienceIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-10 text-[15px] md:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Introduction */}
      <section className="space-y-3">
        <p className="text-zinc-900 dark:text-zinc-100 font-semibold text-base md:text-[17px]">
          Cloud DevOps & Infrastructure Engineer.
        </p>
        <p className="text-[15px] md:text-base leading-relaxed">
          Over the past 3 years, I've engineered network backbones and scaled cloud environments—transitioning from 2 years in enterprise network infrastructure to building declarative Kubernetes, Terraform, and GitOps architectures.
        </p>
        <p className="text-[15px] md:text-base leading-relaxed">
          I studied Engineering at Global Institute of Engineering & Technology (GIET), Moinabad. I focus on simple, observable, and resilient distributed systems.
        </p>
      </section>

      {/* Experience Section (Accordion inspired by Siraj Chokshi) */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
          Experience
        </h2>

        <div className="space-y-2">
          {experiences.map((exp, idx) => {
            const isOpen = openExperienceIndex === idx;
            return (
              <div
                key={idx}
                className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-x-3 md:gap-x-4 items-start text-sm md:text-[15px]"
              >
                {/* Year + Present badge column */}
                <div className="py-1 flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <span className="font-normal font-mono text-xs md:text-sm">{exp.year}</span>
                  {exp.present && (
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 text-[10px] md:text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Present
                    </span>
                  )}
                </div>

                {/* Accordion Row */}
                <div
                  className={`overflow-hidden rounded-lg transition-colors min-w-0 ${
                    isOpen ? "bg-zinc-50/80 dark:bg-zinc-900/60" : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExperience(idx)}
                    className="w-full flex items-center gap-2 py-1.5 px-2 text-left cursor-pointer text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 select-none group active:scale-[0.99] transition-all min-w-0"
                  >
                    <ChevronRight
                      size={15}
                      className={`text-zinc-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-90 text-zinc-800 dark:text-zinc-200" : ""
                      }`}
                    />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate text-sm md:text-[15px]">
                      {exp.company}
                    </span>
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 min-w-[16px] shrink-0" />
                    <span className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm shrink-0">
                      {exp.role}
                    </span>
                  </button>

                  {/* Collapsible Content */}
                  {isOpen && (
                    <div className="px-6 pb-3 pt-1 space-y-2 text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                      <p className="leading-relaxed">{exp.description}</p>
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
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Skills Section */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
          Skills
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill, idx) => (
            <span
              key={idx}
              className="text-xs md:text-[12.5px] font-mono px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800/80"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Selected Work Section */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
            Selected Work
          </h2>
          <Link
            to="/projects"
            className="text-xs md:text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            All projects →
          </Link>
        </div>

        <div className="space-y-5">
          {featuredProjects.map((project) => (
            <div key={project.slug} className="space-y-1 group">
              <div className="flex items-baseline justify-between gap-2 min-w-0">
                <Link
                  to={`/projects/${project.slug}`}
                  className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline decoration-zinc-400 underline-offset-4 text-sm md:text-base truncate"
                  title={project.title}
                >
                  {project.title}
                </Link>
                <span className="font-mono text-xs text-zinc-400 shrink-0">
                  {project.category}
                </span>
              </div>
              <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                {project.summary}
              </p>
              <div className="pt-0.5 flex items-center gap-3 text-xs md:text-sm">
                <Link
                  to={`/projects/${project.slug}`}
                  className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline"
                >
                  Case Study →
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

      {/* Writing Section */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
              Writing
            </h2>
            <Link
              to="/blog"
              className="text-xs md:text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              All articles →
            </Link>
          </div>

          <div className="space-y-2">
            {recentPosts.map((post) => (
              <div key={post.slug} className="group">
                <Link
                  to={`/blog/${post.slug}`}
                  className="flex items-center justify-between py-1 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors gap-3 min-w-0"
                  title={post.title}
                >
                  <span className="font-normal text-zinc-800 dark:text-zinc-200 group-hover:underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 text-sm md:text-base truncate min-w-0">
                    {post.title}
                  </span>
                  <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 min-w-[20px] shrink-0" />
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
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
            Research
          </h2>
          <Link
            to="/research"
            className="text-xs md:text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            All papers →
          </Link>
        </div>

        <div className="space-y-4">
          {featuredResearch.map((paper) => (
            <div key={paper.slug} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2 min-w-0">
                <Link
                  to="/research"
                  className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline decoration-zinc-400 underline-offset-4 text-sm md:text-base truncate"
                  title={paper.title}
                >
                  {paper.title}
                </Link>
                <span className="font-mono text-xs text-zinc-400 shrink-0">
                  {paper.year}
                </span>
              </div>
              <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {paper.abstract}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Elsewhere Section */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
          Elsewhere
        </h2>
        <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-y-2.5 items-baseline text-sm md:text-[15px]">
          {elsewhereLinks.map((item) => (
            <div key={item.label} className="contents">
              <span className="text-zinc-500 dark:text-zinc-400 font-normal">
                {item.label}
              </span>
              <div>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className="text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-1.5 py-0.5 -ml-1.5 rounded transition-all duration-150 active:scale-[0.98] inline-block font-mono text-xs md:text-sm"
                >
                  {item.display}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
