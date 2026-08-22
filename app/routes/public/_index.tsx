import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
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

  const experiences = [
    {
      period: "2024 — Present",
      role: "Cloud DevOps Engineer",
      description:
        "Architecting multi-region Kubernetes clusters, GitOps pipelines with ArgoCD, Terraform IaC automation, and distributed observability meshes across AWS and hybrid clouds.",
    },
    {
      period: "2022 — 2024",
      role: "Network Infrastructure Engineer",
      description:
        "Managed enterprise multi-vendor routing and switching, BGP peering, OSPF network backbones, hardware firewalls, site-to-site VPN tunnels, and zero-trust SDN migrations.",
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

      {/* Experience Section */}
      <section className="space-y-4 pt-2">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
          Experience
        </h2>
        <div className="space-y-6">
          {experiences.map((exp, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {exp.role}
                </span>
                <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                  {exp.period}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                {exp.description}
              </p>
            </div>
          ))}
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
