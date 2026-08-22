import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { motion } from "framer-motion";
import {
  MapPin,
  Mail,
  ExternalLink,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Layers,
  FileText,
  Terminal,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import YahyaImage from "~/assets/yahya.png";
import {
  getFeaturedProjects,
  getFeaturedResearch,
  type ProjectCaseStudy,
  type ResearchPaper,
} from "~/Services/content.server";

export async function loader() {
  const [featuredProjects, featuredResearch] = await Promise.all([
    getFeaturedProjects(3),
    getFeaturedResearch(2),
  ]);

  return json({
    featuredProjects,
    featuredResearch,
  });
}

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// Strictly 9 core inline skills
const CORE_SKILLS = [
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

const EXPERIENCES = [
  {
    role: "Cloud DevOps Engineer",
    company: "Cloud & Distributed Systems",
    period: "2024 — Present (1 Year)",
    type: "Full-time",
    description: [
      "Architected multi-region Kubernetes clusters on AWS with declarative Terraform IaC and ArgoCD GitOps pipelines.",
      "Implemented automated canary progressive delivery with Prometheus telemetry-driven rollbacks, cutting MTTR by 60%.",
      "Standardized container build pipelines in GitHub Actions with automated image signing, vulnerability scanning, and multi-arch support.",
    ],
    tech: ["AWS EKS", "Terraform", "Kubernetes", "ArgoCD", "GitHub Actions", "Prometheus"],
  },
  {
    role: "Network Infrastructure Engineer",
    company: "Enterprise Infrastructure & Networks",
    period: "2022 — 2024 (2 Years)",
    type: "Full-time",
    description: [
      "Engineered hybrid cloud interconnects spanning on-premises data centers and AWS VPCs via 10G AWS Direct Connect and BGP routing.",
      "Implemented redundant WireGuard / IPsec VPN fallbacks and sub-second BFD convergence for high-availability mission-critical traffic.",
      "Diagnosed low-level packet anomalies with Wireshark and enforced kernel-level microsegmentation policies with Cilium eBPF.",
    ],
    tech: ["BGP / OSPF", "AWS Direct Connect", "IPsec & WireGuard", "Cilium eBPF", "Linux Routing", "Wireshark"],
  },
];

export default function Index() {
  const { featuredProjects, featuredResearch } = useLoaderData<typeof loader>();

  return (
    <motion.div
      className="space-y-16 sm:space-y-20 font-sans"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* 1. HERO / PROFILE SECTION */}
      <motion.section variants={fadeInUp} className="space-y-6">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Yahya
            </h1>
            <p className="text-base sm:text-lg font-medium text-zinc-600 dark:text-zinc-400">
              Cloud DevOps & Infrastructure Engineer
            </p>
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-zinc-400" />
                Hyderabad, India
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Available for engineering roles
              </span>
            </div>
          </div>

          <div className="relative shrink-0">
            <img
              src={YahyaImage}
              alt="Yahya"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-sm"
            />
          </div>
        </div>

        {/* Framework mode summary: casual yet passionate */}
        <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
          I build resilient cloud platforms and high-throughput network infrastructure. Over the past 3 years, my focus has shifted from routing enterprise packets and configuring BGP interconnects to automating multi-region Kubernetes clusters, declarative GitOps workflows, and eBPF-driven observability. I enjoy diving into the mechanics of distributed systems and turning complex architectures into repeatable code.
        </p>

        {/* Quick Contact & Social Badges (Strictly NO phone) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <a
            href="mailto:hello@yahyaoncloud.com"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <Mail size={13} />
            <span>hello@yahyaoncloud.com</span>
          </a>
          <a
            href="https://github.com/yahyaoncloud"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <FaGithub size={13} />
            <span>GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/ykinwork1"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <FaLinkedin size={13} />
            <span>LinkedIn</span>
          </a>
          <a
            href="https://x.com/yahyaoncloud"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <FaSquareXTwitter size={13} />
            <span>X</span>
          </a>
        </div>
      </motion.section>

      {/* 2. EXPERIENCE SECTION (3 Years: 2y Network Infra -> 1y Cloud DevOps) */}
      <motion.section variants={fadeInUp} className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Experience (3 Years)
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400">2022 — Present</span>
        </div>

        <div className="space-y-6">
          {EXPERIENCES.map((exp, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/50 dark:bg-zinc-900/30 space-y-3 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {exp.role}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{exp.company}</p>
                </div>
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full w-fit">
                  {exp.period}
                </span>
              </div>

              <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 list-disc pl-4">
                {exp.description.map((item, i) => (
                  <li key={i} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {exp.tech.map((t, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 3. INLINE SKILLS SECTION (Strictly <= 9 Skills) */}
      <motion.section variants={fadeInUp} className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
          <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Core Technical Skills
          </h2>
          <span className="text-xs text-zinc-400 font-mono ml-auto">9 Focus Areas</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {CORE_SKILLS.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.section>

      {/* 4. EDUCATION SECTION */}
      <motion.section variants={fadeInUp} className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
          <GraduationCap size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Education
          </h2>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Bachelor of Technology in Computer Science & Engineering
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Global Institute of Engineering & Technology (GIET), Moinabad
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400 shrink-0">Hyderabad, India</span>
        </div>
      </motion.section>

      {/* 5. FEATURED PROJECT CASE STUDIES */}
      <motion.section variants={fadeInUp} className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Project Case Studies
            </h2>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>All Studies</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-4">
          {featuredProjects.map((project: ProjectCaseStudy) => (
            <Link
              key={project.slug}
              to={`/projects/${project.slug}`}
              className="group block p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/60 transition-all duration-200"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {project.category || "Case Study"}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{project.period}</span>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                  <span>{project.title}</span>
                  <ArrowRight
                    size={15}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-600 dark:text-indigo-400 shrink-0"
                  />
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {project.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.techStack.slice(0, 5).map((tech, i) => (
                    <span
                      key={i}
                      className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 5 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                      +{project.techStack.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* 6. RESEARCH PAPERS & WHITEPAPERS HIGHLIGHT */}
      <motion.section variants={fadeInUp} className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Research & Whitepapers
            </h2>
          </div>
          <Link
            to="/research"
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View All Papers</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-4">
          {featuredResearch.map((paper: ResearchPaper) => (
            <div
              key={paper.slug}
              className="p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/50 dark:bg-zinc-900/30 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-zinc-400">{paper.venue}</span>
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{paper.year}</span>
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {paper.title}
              </h3>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                {paper.abstract}
              </p>

              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {paper.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  to="/research"
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2"
                >
                  <span>Read Paper</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
