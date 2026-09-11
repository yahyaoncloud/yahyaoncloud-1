import React from "react";

// Devicons
import {
  DiAws,
  DiDocker,
  DiLinux,
  DiPython,
  DiGit,
  DiReact,
  DiNodejs,
  DiPostgresql,
  DiMongodb,
  DiGo,
  DiRust,
  DiJava,
  DiHtml5,
  DiCss3,
  DiJavascript1,
  DiNginx,
  DiRedis,
  DiMysql,
  DiFirebase,
  DiTerminal,
  DiDebian,
  DiUbuntu,
  DiApple,
  DiWindows,
  DiJenkins,
} from "react-icons/di";

// Simple Icons (Curated for Yahya's stack: DevOps, Cloud, Systems, Security)
import {
  SiKubernetes,
  SiTerraform,
  SiArgo,
  SiGithubactions,
  SiGithub,
  SiGitlab,
  SiHelm,
  SiAnsible,
  SiCloudflare,
  SiCisco,
  SiGnubash,
  SiApache,
  SiPrometheus,
  SiGrafana,
  SiTypescript,
  SiRemix,
  SiTailwindcss,
  SiVite,
  SiFlutter,
  SiDart,
  SiSqlite,
  SiPrisma,
  SiSupabase,
  SiPytorch,
  SiTensorflow,
  SiOpenai,
} from "react-icons/si";

// VS Code / Cloud / Lucide Icons
import { VscAzure } from "react-icons/vsc";
import {
  LuCode,
  LuTerminal,
  LuCpu,
  LuCloud,
  LuServer,
  LuWorkflow,
  LuShield,
  LuDatabase,
  LuNetwork,
  LuCheck,
  LuLayoutGrid,
} from "~/components/ui/icons";

type TechIconType = React.ComponentType<{
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
  [key: string]: any;
}>;

interface TechMap {
  keywords: string[];
  icon: TechIconType;
  color?: string;
}

const REGISTRY: TechMap[] = [
  // Cloud & Providers
  { keywords: ["aws", "amazon", "eks", "ec2", "s3", "lambda", "route53", "vpc", "cloudwatch", "iam", "cloudformation"], icon: DiAws, color: "text-[#FF9900]" },
  { keywords: ["azure", "microsoft azure", "aks"], icon: VscAzure, color: "text-[#0078D4]" },
  { keywords: ["cloudflare", "workers", "pages"], icon: SiCloudflare, color: "text-[#F38020]" },
  { keywords: ["gcp", "google cloud", "gke", "cloud run", "bigquery"], icon: LuCloud, color: "text-[#4285F4]" },
  { keywords: ["digitalocean"], icon: LuCloud, color: "text-[#0080FF]" },
  { keywords: ["vercel", "netlify"], icon: LuCloud, color: "text-zinc-900 dark:text-zinc-100" },

  // Containers, Orchestration & IaC
  { keywords: ["kubernetes", "k8s"], icon: SiKubernetes, color: "text-[#326CE5]" },
  { keywords: ["docker", "container", "containers", "podman"], icon: DiDocker, color: "text-[#2496ED]" },
  { keywords: ["argocd", "argo"], icon: SiArgo, color: "text-[#EF6B48]" },
  { keywords: ["helm"], icon: SiHelm, color: "text-[#0F1689] dark:text-[#526BFF]" },
  { keywords: ["terraform", "iac", "opentofu"], icon: SiTerraform, color: "text-[#7B42BC]" },
  { keywords: ["ansible", "puppet", "chef", "pulumi"], icon: SiAnsible, color: "text-[#EE0000]" },

  // CI/CD & Version Control
  { keywords: ["github actions", "github action", "actions"], icon: SiGithubactions, color: "text-[#2088FF]" },
  { keywords: ["ci/cd", "cicd", "pipeline", "continuous integration"], icon: LuWorkflow, color: "text-emerald-500" },
  { keywords: ["github"], icon: SiGithub, color: "text-zinc-900 dark:text-zinc-100" },
  { keywords: ["gitlab", "bitbucket"], icon: SiGitlab, color: "text-[#FC6D26]" },
  { keywords: ["git"], icon: DiGit, color: "text-[#F05032]" },
  { keywords: ["jenkins", "circleci"], icon: DiJenkins, color: "text-[#D24939]" },

  // Linux & Networking
  { keywords: ["linux", "kernel", "archlinux", "redhat", "centos", "fedora", "alpine"], icon: DiLinux, color: "text-[#FCC624]" },
  { keywords: ["ubuntu"], icon: DiUbuntu, color: "text-[#E95420]" },
  { keywords: ["debian"], icon: DiDebian, color: "text-[#A81D33]" },
  { keywords: ["cisco", "networking", "bgp", "ospf", "sd-wan", "routing", "switch", "vpn", "vlan"], icon: SiCisco, color: "text-[#1BA0D7]" },
  { keywords: ["bash", "shell", "scripting", "zsh", "sh"], icon: SiGnubash, color: "text-emerald-400" },
  { keywords: ["terminal", "cli"], icon: DiTerminal, color: "text-zinc-200" },
  { keywords: ["nginx", "traefik"], icon: DiNginx, color: "text-[#009639]" },
  { keywords: ["apache"], icon: SiApache, color: "text-[#D22128]" },

  // Observability & SRE
  { keywords: ["prometheus"], icon: SiPrometheus, color: "text-[#E6522C]" },
  { keywords: ["grafana"], icon: SiGrafana, color: "text-[#F46800]" },
  { keywords: ["sre", "cloud architecture", "architecture", "distributed systems", "resilient", "high availability", "datadog", "newrelic", "splunk", "sentry"], icon: LuCloud, color: "text-sky-400" },

  // Programming Languages & Runtimes
  { keywords: ["python", "py", "python 3", "python 3.11"], icon: DiPython, color: "text-[#3776AB]" },
  { keywords: ["typescript", "ts"], icon: SiTypescript, color: "text-[#3178C6]" },
  { keywords: ["javascript", "js", "ecmascript"], icon: DiJavascript1, color: "text-[#F7DF1E]" },
  { keywords: ["golang", "go", "go 1.22+", "go 1.23"], icon: DiGo, color: "text-[#00ADD8]" },
  { keywords: ["rust"], icon: DiRust, color: "text-[#DEA584]" },
  { keywords: ["java", "kotlin", "scala"], icon: DiJava, color: "text-[#ED8B00]" },
  { keywords: ["c++", "cpp", "c", "c#", "csharp", "zig"], icon: LuCode, color: "text-[#00599C]" },
  { keywords: ["node", "nodejs", "node.js", "bun", "deno"], icon: DiNodejs, color: "text-[#5FA04E]" },

  // Frontend & Frameworks
  { keywords: ["remix", "remix / typescript"], icon: SiRemix, color: "text-zinc-900 dark:text-zinc-100" },
  { keywords: ["react", "react 19", "react.js", "react native", "next.js", "nextjs"], icon: DiReact, color: "text-[#61DAFB]" },
  { keywords: ["tailwind", "tailwindcss"], icon: SiTailwindcss, color: "text-[#06B6D4]" },
  { keywords: ["vite", "webpack"], icon: SiVite, color: "text-[#646CFF]" },
  { keywords: ["html", "html5"], icon: DiHtml5, color: "text-[#E34F26]" },
  { keywords: ["css", "css3", "sass", "bootstrap"], icon: DiCss3, color: "text-[#1572B6]" },
  { keywords: ["flutter"], icon: SiFlutter, color: "text-[#02569B]" },
  { keywords: ["dart"], icon: SiDart, color: "text-[#0175C2]" },

  // Databases, Caches & Storage
  { keywords: ["postgresql", "postgres"], icon: DiPostgresql, color: "text-[#4169E1]" },
  { keywords: ["mongodb", "mongo"], icon: DiMongodb, color: "text-[#47A248]" },
  { keywords: ["redis"], icon: DiRedis, color: "text-[#DC382D]" },
  { keywords: ["mysql"], icon: DiMysql, color: "text-[#4479A1]" },
  { keywords: ["sqlite", "isar", "isar database"], icon: SiSqlite, color: "text-[#003B57]" },
  { keywords: ["prisma"], icon: SiPrisma, color: "text-[#2D3748] dark:text-zinc-200" },
  { keywords: ["supabase"], icon: SiSupabase, color: "text-[#3ECF8E]" },
  { keywords: ["firebase"], icon: DiFirebase, color: "text-[#FFCA28]" },

  // AI, ML & Security
  { keywords: ["pytorch", "rocm"], icon: SiPytorch, color: "text-[#EE4C2C]" },
  { keywords: ["tensorflow", "keras"], icon: SiTensorflow, color: "text-[#FF6F00]" },
  { keywords: ["openai", "chatgpt", "gpt"], icon: SiOpenai, color: "text-emerald-500" },
  { keywords: ["xgboost", "machine learning", "ml", "ai/ml", "ai", "deep learning", "llm", "langchain", "ollama"], icon: LuCpu, color: "text-purple-400" },
  { keywords: ["security", "cryptography", "zero-knowledge", "auth", "oauth", "jwt", "argon2id", "xchacha20"], icon: LuShield, color: "text-emerald-400" },

  // Operating Systems & Hardware
  { keywords: ["macos", "apple", "ios"], icon: DiApple, color: "text-zinc-400" },
  { keywords: ["windows"], icon: DiWindows, color: "text-[#0078D6]" },
];

function matchSingle(token: string): { icon: TechIconType; color?: string } | null {
  if (!token) return null;
  const lower = token.toLowerCase().trim();
  const clean = lower.replace(/[^a-z0-9]/g, "");
  if (!clean) return null;

  for (const item of REGISTRY) {
    for (const kw of item.keywords) {
      if (lower === kw || clean === kw.replace(/[^a-z0-9]/g, "")) {
        return { icon: item.icon, color: item.color };
      }
      if (kw.length >= 3 && (lower.startsWith(kw) || lower.endsWith(kw))) {
        return { icon: item.icon, color: item.color };
      }
    }
  }

  for (const item of REGISTRY) {
    for (const kw of item.keywords) {
      if (kw.length >= 3 && lower.includes(kw)) {
        return { icon: item.icon, color: item.color };
      }
    }
  }

  return null;
}

export function getTechIcon(name: string): { Icon: TechIconType; color?: string } {
  if (!name) return { Icon: LuCode };

  // 1. Try full string match
  const full = matchSingle(name);
  if (full) return { Icon: full.icon, color: full.color };

  // 2. Try compound token split
  const tokens = name.split(/[\(\)&/+,|\-]+/).map((t) => t.trim()).filter(Boolean);
  for (const t of tokens) {
    const sub = matchSingle(t);
    if (sub) return { Icon: sub.icon, color: sub.color };
  }

  // 3. Fallback category matching
  const lower = name.toLowerCase();
  if (lower.includes("db") || lower.includes("database") || lower.includes("sql") || lower.includes("store")) {
    return { Icon: LuDatabase, color: "text-indigo-400" };
  }
  if (lower.includes("cloud") || lower.includes("infra") || lower.includes("serverless")) {
    return { Icon: LuCloud, color: "text-sky-400" };
  }
  if (lower.includes("security") || lower.includes("auth") || lower.includes("shield") || lower.includes("crypto")) {
    return { Icon: LuShield, color: "text-emerald-400" };
  }
  if (lower.includes("net") || lower.includes("route") || lower.includes("ip") || lower.includes("dns")) {
    return { Icon: LuNetwork, color: "text-cyan-400" };
  }
  if (lower.includes("api") || lower.includes("microservice") || lower.includes("backend") || lower.includes("server")) {
    return { Icon: LuServer, color: "text-amber-500" };
  }
  if (lower.includes("ai") || lower.includes("ml") || lower.includes("model") || lower.includes("neural") || lower.includes("rag")) {
    return { Icon: LuCpu, color: "text-purple-400" };
  }
  if (lower.includes("test") || lower.includes("qa") || lower.includes("spec")) {
    return { Icon: LuCheck, color: "text-emerald-500" };
  }
  if (lower.includes("ui") || lower.includes("design") || lower.includes("frontend") || lower.includes("web") || lower.includes("layout")) {
    return { Icon: LuLayoutGrid, color: "text-pink-500" };
  }

  return { Icon: LuCode, color: "text-zinc-400" };
}

interface TechIconProps {
  name: string;
  className?: string;
  size?: number;
  useBrandColor?: boolean;
}

export const TechIcon: React.FC<TechIconProps> = ({
  name,
  className = "",
  size = 14,
  useBrandColor = false,
}) => {
  const { Icon, color } = getTechIcon(name);

  return (
    <Icon
      size={size}
      className={`shrink-0 inline-block transition-colors ${useBrandColor && color ? color : ""} ${className}`}
      aria-hidden="true"
    />
  );
};
