import React from "react";
import type { IconType } from "react-icons";
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
  DiPhp,
  DiRuby,
  DiFirebase,
} from "react-icons/di";
import {
  SiKubernetes,
  SiTerraform,
  SiArgo,
  SiGithubactions,
  SiDocker,
  SiLinux,
  SiPython,
  SiGnubash,
  SiTypescript,
  SiReact,
  SiRemix,
  SiTailwindcss,
  SiPostgresql,
  SiMongodb,
  SiGo,
  SiRust,
  SiGooglecloud,
  SiGrafana,
  SiPrometheus,
  SiAnsible,
  SiCisco,
  SiCloudflare,
  SiFirebase,
  SiSupabase,
  SiNextdotjs,
  SiVite,
  SiPrisma,
  SiGraphql,
  SiRedis,
  SiElasticsearch,
  SiNginx,
  SiApachekafka,
  SiGit,
  SiHelm,
  SiPytorch,
  SiTensorflow,
  SiOpencv,
  SiHuggingface,
  SiOpenai,
  SiJupyter,
  SiPandas,
  SiNumpy,
  SiScikitlearn,
  SiVitest,
  SiJest,
  SiCypress,
  SiRedhat,
  SiArchlinux,
  SiBun,
  SiDeno,
  SiFastapi,
  SiDjango,
  SiFlask,
  SiSpringboot,
  SiFlutter,
  SiDart,
  SiKotlin,
  SiSwift,
  SiElixir,
} from "react-icons/si";
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
} from "react-icons/lu";

interface IconMapping {
  keywords: string[];
  icon: IconType;
  color?: string;
}

const ICON_MAPPINGS: IconMapping[] = [
  // Cloud & DevOps
  { keywords: ["aws", "amazon", "eks", "vpc", "route53", "s3", "ec2", "lambda"], icon: DiAws, color: "text-[#FF9900]" },
  { keywords: ["kubernetes", "k8s"], icon: SiKubernetes, color: "text-[#326CE5]" },
  { keywords: ["argocd", "argo"], icon: SiArgo, color: "text-[#EF6B48]" },
  { keywords: ["terraform", "iac"], icon: SiTerraform, color: "text-[#7B42BC]" },
  { keywords: ["docker", "container", "containers"], icon: DiDocker, color: "text-[#2496ED]" },
  { keywords: ["github actions", "github action", "actions"], icon: SiGithubactions, color: "text-[#2088FF]" },
  { keywords: ["ci/cd", "cicd", "pipeline"], icon: LuWorkflow, color: "text-emerald-500" },
  { keywords: ["ansible"], icon: SiAnsible, color: "text-[#EE0000]" },
  { keywords: ["helm"], icon: SiHelm, color: "text-[#0F1689] dark:text-[#526BFF]" },
  { keywords: ["azure", "microsoft azure"], icon: VscAzure, color: "text-[#0078D4]" },
  { keywords: ["gcp", "google cloud"], icon: SiGooglecloud, color: "text-[#4285F4]" },
  { keywords: ["cloudflare"], icon: SiCloudflare, color: "text-[#F38020]" },

  // Linux & Networking
  { keywords: ["linux", "ubuntu", "debian", "kernel"], icon: DiLinux, color: "text-[#FCC624]" },
  { keywords: ["networking", "bgp", "ospf", "cisco", "network", "sd-wan", "routing"], icon: SiCisco, color: "text-[#1BA0D7]" },
  { keywords: ["bash", "shell", "scripting", "terminal", "zsh", "sh"], icon: SiGnubash, color: "text-emerald-400" },

  // Observability & SRE
  { keywords: ["prometheus"], icon: SiPrometheus, color: "text-[#E6522C]" },
  { keywords: ["grafana"], icon: SiGrafana, color: "text-[#F46800]" },
  { keywords: ["sre", "cloud architecture", "architecture", "distributed systems", "resilient"], icon: LuCloud, color: "text-sky-400" },

  // Languages & Runtimes
  { keywords: ["python", "py", "python 3", "python 3.11"], icon: DiPython, color: "text-[#3776AB]" },
  { keywords: ["typescript", "ts"], icon: SiTypescript, color: "text-[#3178C6]" },
  { keywords: ["javascript", "js", "ecmascript"], icon: DiJavascript1, color: "text-[#F7DF1E]" },
  { keywords: ["golang", "go 1", "go", "go 1.22+", "go 1.23"], icon: DiGo, color: "text-[#00ADD8]" },
  { keywords: ["rust"], icon: DiRust, color: "text-[#DEA584]" },
  { keywords: ["java"], icon: DiJava, color: "text-[#ED8B00]" },
  { keywords: ["kotlin"], icon: SiKotlin, color: "text-[#7F52FF]" },
  { keywords: ["swift"], icon: SiSwift, color: "text-[#F05138]" },
  { keywords: ["php"], icon: DiPhp, color: "text-[#777BB4]" },
  { keywords: ["ruby"], icon: DiRuby, color: "text-[#CC342D]" },
  { keywords: ["bun"], icon: SiBun, color: "text-[#FBF0DF]" },
  { keywords: ["node", "nodejs", "node.js"], icon: DiNodejs, color: "text-[#5FA04E]" },
  { keywords: ["deno"], icon: SiDeno, color: "text-zinc-200" },

  // Frontend & Frameworks
  { keywords: ["remix", "remix / typescript"], icon: SiRemix, color: "text-zinc-900 dark:text-zinc-100" },
  { keywords: ["react", "react 19", "react.js"], icon: DiReact, color: "text-[#61DAFB]" },
  { keywords: ["next.js", "nextjs", "next"], icon: SiNextdotjs, color: "text-zinc-900 dark:text-zinc-100" },
  { keywords: ["tailwind", "tailwindcss"], icon: SiTailwindcss, color: "text-[#06B6D4]" },
  { keywords: ["html", "html5"], icon: DiHtml5, color: "text-[#E34F26]" },
  { keywords: ["css", "css3"], icon: DiCss3, color: "text-[#1572B6]" },
  { keywords: ["vite"], icon: SiVite, color: "text-[#646CFF]" },

  // Backend & Databases
  { keywords: ["postgresql", "postgres"], icon: DiPostgresql, color: "text-[#4169E1]" },
  { keywords: ["mongodb", "mongo"], icon: DiMongodb, color: "text-[#47A248]" },
  { keywords: ["redis"], icon: DiRedis, color: "text-[#DC382D]" },
  { keywords: ["mysql"], icon: DiMysql, color: "text-[#4479A1]" },
  { keywords: ["prisma"], icon: SiPrisma, color: "text-[#2D3748] dark:text-zinc-200" },
  { keywords: ["supabase"], icon: SiSupabase, color: "text-[#3ECF8E]" },
  { keywords: ["firebase"], icon: SiFirebase, color: "text-[#FFCA28]" },
  { keywords: ["graphql"], icon: SiGraphql, color: "text-[#E10098]" },
  { keywords: ["kafka"], icon: SiApachekafka, color: "text-[#231F20] dark:text-zinc-200" },
  { keywords: ["elasticsearch"], icon: SiElasticsearch, color: "text-[#005571]" },
  { keywords: ["nginx"], icon: DiNginx, color: "text-[#009639]" },
  { keywords: ["fastapi"], icon: SiFastapi, color: "text-[#009688]" },
  { keywords: ["django"], icon: SiDjango, color: "text-[#092E20] dark:text-[#44B78B]" },
  { keywords: ["flask"], icon: SiFlask, color: "text-zinc-400" },

  // AI & ML & Tools
  { keywords: ["pytorch", "rocm"], icon: SiPytorch, color: "text-[#EE4C2C]" },
  { keywords: ["tensorflow"], icon: SiTensorflow, color: "text-[#FF6F00]" },
  { keywords: ["xgboost", "machine learning", "ml", "ai/ml", "ai"], icon: LuCpu, color: "text-purple-400" },
  { keywords: ["opencv"], icon: SiOpencv, color: "text-[#5C3EE8]" },
  { keywords: ["hugging face", "huggingface"], icon: SiHuggingface, color: "text-[#FFD21E]" },
  { keywords: ["openai"], icon: SiOpenai, color: "text-emerald-500" },
  { keywords: ["jupyter"], icon: SiJupyter, color: "text-[#F37626]" },
  { keywords: ["pandas"], icon: SiPandas, color: "text-[#150458] dark:text-[#E70488]" },
  { keywords: ["numpy"], icon: SiNumpy, color: "text-[#013243] dark:text-[#4DABCF]" },
  { keywords: ["scikit-learn", "sklearn"], icon: SiScikitlearn, color: "text-[#F7931E]" },
  { keywords: ["git", "github", "gitlab"], icon: DiGit, color: "text-[#F05032]" },
  { keywords: ["mcp server", "mcp", "json-rpc", "rpc"], icon: LuServer, color: "text-amber-500" },
  { keywords: ["security", "cryptography", "zero-knowledge"], icon: LuShield, color: "text-emerald-400" },
  { keywords: ["database", "db"], icon: LuDatabase, color: "text-indigo-400" },
];

export function getTechIcon(name: string): { Icon: IconType; color?: string } {
  if (!name) return { Icon: LuCode };
  const lower = name.toLowerCase().trim();

  // 1. Direct or multi-keyword matching
  for (const mapping of ICON_MAPPINGS) {
    for (const kw of mapping.keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|[\\s/&(),+-_])${escaped}([\\s/&(),+-_]|$)`, "i");
      if (regex.test(lower) || lower === kw) {
        return { Icon: mapping.icon, color: mapping.color };
      }
    }
  }

  // 2. Loose fallback matching
  for (const mapping of ICON_MAPPINGS) {
    for (const kw of mapping.keywords) {
      if (kw.length >= 3 && lower.includes(kw)) {
        return { Icon: mapping.icon, color: mapping.color };
      }
    }
  }

  return { Icon: LuCode };
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
