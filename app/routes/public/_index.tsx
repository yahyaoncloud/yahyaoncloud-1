import { useState } from "react";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ChevronRight } from "lucide-react";
import { getFeaturedProjects, getFeaturedResearch } from "~/Services/content.server";

export async function loader() {
  const [featuredProjects, featuredResearch] = await Promise.all([
    getFeaturedProjects(),
    getFeaturedResearch(),
  ]);

  return json({
    featuredProjects,
    featuredResearch,
  });
}

export default function Index() {
  const { featuredProjects, featuredResearch } = useLoaderData<typeof loader>();
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
    { label: "Email", href: "mailto:hello@yahyaoncloud.com", display: "hello@yahyaoncloud.com", external: false },
    { label: "GitHub", href: "https://github.com/yahyaoncloud", display: "github.com/yahyaoncloud", external: true },
    { label: "LinkedIn", href: "https://linkedin.com/in/ykinwork1", display: "linkedin.com/in/ykinwork1", external: true },
    { label: "X", href: "https://x.com/yahyaoncloud", display: "@yahyaoncloud", external: true },
  ];

  const toggleExperience = (idx: number) => {
    setOpenExperienceIndex(openExperienceIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-12 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Introduction */}
      <section className="space-y-4">
        <p className="text-zinc-900 dark:text-zinc-100 font-medium text-base">
          Cloud DevOps & Infrastructure Engineer.
        </p>
        <p>
          Over the past 3 years, I've engineered network backbones and scaled cloud environments—transitioning from 2 years in enterprise network infrastructure to building declarative Kubernetes, Terraform, and GitOps architectures.
        </p>
        <p>
          I studied Engineering at Global Institute of Engineering & Technology (GIET), Moinabad. I focus on simple, observable, and resilient distributed systems.
        </p>
      </section>

      {/* Experience Section (Accordion inspired by Siraj Chokshi) */}
      <section className="space-y-4 pt-2">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
          Experience
        </h2>

        <div className="space-y-2">
          {experiences.map((exp, idx) => {
            const isOpen = openExperienceIndex === idx;
            return (
              <div
                key={idx}
                className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-x-2 sm:gap-x-4 items-start text-sm"
              >
                {/* Year + Present badge column */}
                <div className="py-1.5 flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <span className="font-normal">{exp.year}</span>
                  {exp.present && (
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                      Present
                    </span>
                  )}
                </div>

                {/* Accordion Row */}
                <div
                  className={`overflow-hidden rounded-lg transition-colors ${
                    isOpen ? "bg-zinc-50/80 dark:bg-zinc-900/60" : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExperience(idx)}
                    className="w-full flex items-center gap-2 py-1.5 px-2 text-left cursor-pointer text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 select-none group"
                  >
                    <ChevronRight
                      size={14}
                      className={`text-zinc-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-90 text-zinc-800 dark:text-zinc-200" : ""
                      }`}
                    />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 shrink-0">
                      {exp.company}
                    </span>
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 mx-2" />
                    <span className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm shrink-0">
                      {exp.role}
                    </span>
                  </button>

                  {/* Collapsible Content */}
                  {isOpen && (
                    <div className="px-6 pb-3 pt-1 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                      <p className="leading-relaxed">{exp.description}</p>
                      {exp.projects && exp.projects.length > 0 && (
                        <div className="space-y-1 pt-1">
                          {exp.projects.map((proj) => (
                            <div key={proj.name}>
                              {proj.internal ? (
                                <Link
                                  to={proj.url}
                                  className="text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4"
                                >
                                  {proj.name} ↗
                                </Link>
                              ) : (
                                <a
                                  href={proj.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4"
                                >
                                  {proj.name} ↗
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
              className="text-xs font-mono px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800/80"
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
            className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            All projects →
          </Link>
        </div>

        <div className="space-y-6">
          {featuredProjects.map((project) => (
            <div key={project.slug} className="space-y-1.5 group">
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  to={`/projects/${project.slug}`}
                  className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline decoration-zinc-400 underline-offset-4"
                >
                  {project.title}
                </Link>
                <span className="font-mono text-[11px] text-zinc-400 shrink-0">
                  {project.category}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                {project.summary}
              </p>
              <div className="pt-1 flex items-center gap-3 text-xs">
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

      {/* Research Section */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
            Research
          </h2>
          <Link
            to="/research"
            className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            All papers →
          </Link>
        </div>

        <div className="space-y-5">
          {featuredResearch.map((paper) => (
            <div key={paper.slug} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  to="/research"
                  className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline decoration-zinc-400 underline-offset-4"
                >
                  {paper.title}
                </Link>
                <span className="font-mono text-[11px] text-zinc-400 shrink-0">
                  {paper.year}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
          {elsewhereLinks.map((item) => (
            <div key={item.label} className="flex items-baseline justify-between gap-2 py-0.5 border-b border-zinc-100 dark:border-zinc-900">
              <span className="text-zinc-500">{item.label}</span>
              <a
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                className="font-mono text-zinc-900 dark:text-zinc-100 hover:underline"
              >
                {item.display}
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
