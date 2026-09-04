import React from "react";
import type { IconType } from "react-icons";

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
  DiPhp,
  DiRuby,
  DiFirebase,
  DiTerminal,
  DiDebian,
  DiUbuntu,
  DiApple,
  DiWindows,
  DiJenkins,
} from "react-icons/di";

// Simple Icons
import {
  SiKubernetes,
  SiTerraform,
  SiArgo,
  SiGithubactions,
  SiGithub,
  SiGitlab,
  SiBitbucket,
  SiCircleci,
  SiPodman,
  SiHelm,
  SiOpentofu,
  SiPulumi,
  SiAnsible,
  SiPuppet,
  SiChef,
  SiVagrant,
  SiGooglecloud,
  SiCloudflare,
  SiDigitalocean,
  SiVercel,
  SiNetlify,
  SiHeroku,
  SiArchlinux,
  SiRedhat,
  SiCentos,
  SiFedora,
  SiAlpinelinux,
  SiCisco,
  SiGnubash,
  SiApache,
  SiTraefikproxy,
  SiPrometheus,
  SiGrafana,
  SiDatadog,
  SiNewrelic,
  SiSplunk,
  SiSentry,
  SiTypescript,
  SiKotlin,
  SiSwift,
  SiElixir,
  SiScala,
  SiZig,
  SiLua,
  SiR,
  SiBun,
  SiDeno,
  SiRemix,
  SiNextdotjs,
  SiVuedotjs,
  SiNuxtdotjs,
  SiSvelte,
  SiAngular,
  SiTailwindcss,
  SiBootstrap,
  SiSass,
  SiVite,
  SiWebpack,
  SiGraphql,
  SiApollographql,
  SiFastapi,
  SiDjango,
  SiFlask,
  SiNestjs,
  SiExpress,
  SiSpringboot,
  SiSpring,
  SiLaravel,
  SiFlutter,
  SiDart,
  SiSqlite,
  SiPrisma,
  SiSupabase,
  SiApachekafka,
  SiRabbitmq,
  SiElasticsearch,
  SiApachecassandra,
  SiApachecouchdb,
  SiAmazondynamodb,
  SiCockroachlabs,
  SiGooglebigquery,
  SiSnowflake,
  SiNeo4J,
  SiClickhouse,
  SiPytorch,
  SiTensorflow,
  SiKeras,
  SiOpencv,
  SiHuggingface,
  SiOpenai,
  SiJupyter,
  SiPandas,
  SiNumpy,
  SiScikitlearn,
  SiLangchain,
  SiOllama,
  SiJest,
  SiVitest,
  SiCypress,
  SiSelenium,
  SiPostman,
  SiFigma,
  SiNotion,
  SiSlack,
  SiDiscord,
  SiJira,
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
} from "react-icons/lu";

interface TechMap {
  keywords: string[];
  icon: IconType;
  color?: string;
}

const REGISTRY: TechMap[] = [
  // Cloud & Providers
  { keywords: ["aws", "amazon", "eks", "ec2", "s3", "lambda", "route53", "vpc", "cloudwatch", "iam", "cloudformation"], icon: DiAws, color: "text-[#FF9900]" },
  { keywords: ["azure", "microsoft azure", "aks"], icon: VscAzure, color: "text-[#0078D4]" },
  { keywords: ["gcp", "google cloud", "gke", "cloud run", "bigquery"], icon: SiGooglecloud, color: "text-[#4285F4]" },
  { keywords: ["cloudflare", "workers", "pages"], icon: SiCloudflare, color: "text-[#F38020]" },
  { keywords: ["digitalocean"], icon: SiDigitalocean, color: "text-[#0080FF]" },
  { keywords: ["vercel"], icon: SiVercel, color: "text-zinc-900 dark:text-zinc-100" },
  { keywords: ["netlify"], icon: SiNetlify, color: "text-[#00C7B7]" },
  { keywords: ["heroku"], icon: SiHeroku, color: "text-[#430098]" },

  // Containers, Orchestration & IaC
  { keywords: ["kubernetes", "k8s"], icon: SiKubernetes, color: "text-[#326CE5]" },
  { keywords: ["docker", "container", "containers"], icon: DiDocker, color: "text-[#2496ED]" },
  { keywords: ["podman"], icon: SiPodman, color: "text-[#892CA0]" },
  { keywords: ["argocd", "argo"], icon: SiArgo, color: "text-[#EF6B48]" },
  { keywords: ["helm"], icon: SiHelm, color: "text-[#0F1689] dark:text-[#526BFF]" },
  { keywords: ["terraform", "iac"], icon: SiTerraform, color: "text-[#7B42BC]" },
  { keywords: ["opentofu"], icon: SiOpentofu, color: "text-[#FFDA00]" },
  { keywords: ["pulumi"], icon: SiPulumi, color: "text-[#8A3391]" },
  { keywords: ["ansible"], icon: SiAnsible, color: "text-[#EE0000]" },
  { keywords: ["puppet"], icon: SiPuppet, color: "text-[#FFAE1A]" },
  { keywords: ["chef"], icon: SiChef, color: "text-[#F38B00]" },
  { keywords: ["vagrant"], icon: SiVagrant, color: "text-[#1563FF]" },

  // CI/CD & Version Control
  { keywords: ["github actions", "github action", "actions"], icon: SiGithubactions, color: "text-[#2088FF]" },
  { keywords: ["ci/cd", "cicd", "pipeline", "continuous integration"], icon: LuWorkflow, color: "text-emerald-500" },
  { keywords: ["github"], icon: SiGithub, color: "text-zinc-900 dark:text-zinc-100" },
  { keywords: ["gitlab"], icon: SiGitlab, color: "text-[#FC6D26]" },
  { keywords: ["bitbucket"], icon: SiBitbucket, color: "text-[#0052CC]" },
  { keywords: ["git"], icon: DiGit, color: "text-[#F05032]" },
  { keywords: ["jenkins"], icon: DiJenkins, color: "text-[#D24939]" },
  { keywords: ["circleci"], icon: SiCircleci, color: "text-[#343434] dark:text-zinc-200" },

  // Linux & Networking
  { keywords: ["linux", "kernel"], icon: DiLinux, color: "text-[#FCC624]" },
  { keywords: ["ubuntu"], icon: DiUbuntu, color: "text-[#E95420]" },
  { keywords: ["debian"], icon: DiDebian, color: "text-[#A81D33]" },
  { keywords: ["archlinux", "arch"], icon: SiArchlinux, color: "text-[#1793D1]" },
  { keywords: ["redhat", "rhel"], icon: SiRedhat, color: "text-[#EE0000]" },
  { keywords: ["centos"], icon: SiCentos, color: "text-[#262577] dark:text-[#9392E0]" },
  { keywords: ["fedora"], icon: SiFedora, color: "text-[#51A2DA]" },
  { keywords: ["alpine", "alpinelinux"], icon: SiAlpinelinux, color: "text-[#0D597F]" },
  { keywords: ["cisco", "networking", "bgp", "ospf", "sd-wan", "routing", "switch", "vpn", "vlan"], icon: SiCisco, color: "text-[#1BA0D7]" },
  { keywords: ["bash", "shell", "scripting", "zsh", "sh"], icon: SiGnubash, color: "text-emerald-400" },
  { keywords: ["terminal", "cli"], icon: DiTerminal, color: "text-zinc-200" },
  { keywords: ["nginx"], icon: DiNginx, color: "text-[#009639]" },
  { keywords: ["apache"], icon: SiApache, color: "text-[#D22128]" },
  { keywords: ["traefik"], icon: SiTraefikproxy, color: "text-[#24A1C1]" },

  // Observability & SRE
  { keywords: ["prometheus"], icon: SiPrometheus, color: "text-[#E6522C]" },
  { keywords: ["grafana"], icon: SiGrafana, color: "text-[#F46800]" },
  { keywords: ["datadog"], icon: SiDatadog, color: "text-[#632CA6]" },
  { keywords: ["newrelic", "new relic"], icon: SiNewrelic, color: "text-[#1CE783]" },
  { keywords: ["splunk"], icon: SiSplunk, color: "text-[#000000] dark:text-zinc-200" },
  { keywords: ["sentry"], icon: SiSentry, color: "text-[#362D59] dark:text-[#8D7BE4]" },
  { keywords: ["sre", "cloud architecture", "architecture", "distributed systems", "resilient", "high availability"], icon: LuCloud, color: "text-sky-400" },

  // Programming Languages & Runtimes
  { keywords: ["python", "py", "python 3", "python 3.11"], icon: DiPython, color: "text-[#3776AB]" },
  { keywords: ["typescript", "ts"], icon: SiTypescript, color: "text-[#3178C6]" },
  { keywords: ["javascript", "js", "ecmascript"], icon: DiJavascript1, color: "text-[#F7DF1E]" },
  { keywords: ["golang", "go", "go 1.22+", "go 1.23"], icon: DiGo, color: "text-[#00ADD8]" },
  { keywords: ["rust"], icon: DiRust, color: "text-[#DEA584]" },
  { keywords: ["java"], icon: DiJava, color: "text-[#ED8B00]" },
  { keywords: ["kotlin"], icon: SiKotlin, color: "text-[#7F52FF]" },
  { keywords: ["swift"], icon: SiSwift, color: "text-[#F05138]" },
  { keywords: ["c++", "cpp", "c", "c#", "csharp"], icon: LuCode, color: "text-[#00599C]" },
  { keywords: ["php"], icon: DiPhp, color: "text-[#777BB4]" },
  { keywords: ["ruby"], icon: DiRuby, color: "text-[#CC342D]" },
  { keywords: ["elixir"], icon: SiElixir, color: "text-[#4B275F]" },
  { keywords: ["scala"], icon: SiScala, color: "text-[#DC322F]" },
  { keywords: ["zig"], icon: SiZig, color: "text-[#F7A41D]" },
  { keywords: ["lua"], icon: SiLua, color: "text-[#000080] dark:text-[#4169E1]" },
  { keywords: ["r"], icon: SiR, color: "text-[#276DC3]" },
  { keywords: ["bun"], icon: SiBun, color: "text-[#FBF0DF]" },
  { keywords: ["node", "nodejs", "node.js"], icon: DiNodejs, color: "text-[#5FA04E]" },
  { keywords: ["deno"], icon: SiDeno, color: "text-zinc-200" },

  // Frontend & Frameworks
  { keywords: ["remix", "remix / typescript"], icon: SiRemix, color: "text-zinc-900 dark:text-zinc-100" },
  { keywords: ["react", "react 19", "react.js", "react native"], icon: DiReact, color: "text-[#61DAFB]" },
  { keywords: ["next.js", "nextjs", "next"], icon: SiNextdotjs, color: "text-zinc-900 dark:text-zinc-100" },
  { keywords: ["vue", "vue.js", "vuejs"], icon: SiVuedotjs, color: "text-[#4FC08D]" },
  { keywords: ["nuxt", "nuxt.js", "nuxtjs"], icon: SiNuxtdotjs, color: "text-[#00DC82]" },
  { keywords: ["svelte", "sveltekit"], icon: SiSvelte, color: "text-[#FF3E00]" },
  { keywords: ["angular"], icon: SiAngular, color: "text-[#DD0031]" },
  { keywords: ["tailwind", "tailwindcss"], icon: SiTailwindcss, color: "text-[#06B6D4]" },
  { keywords: ["bootstrap"], icon: SiBootstrap, color: "text-[#7952B3]" },
  { keywords: ["sass", "scss"], icon: SiSass, color: "text-[#CC6699]" },
  { keywords: ["html", "html5"], icon: DiHtml5, color: "text-[#E34F26]" },
  { keywords: ["css", "css3"], icon: DiCss3, color: "text-[#1572B6]" },
  { keywords: ["vite"], icon: SiVite, color: "text-[#646CFF]" },
  { keywords: ["webpack"], icon: SiWebpack, color: "text-[#8DD6F9]" },
  { keywords: ["graphql"], icon: SiGraphql, color: "text-[#E10098]" },
  { keywords: ["apollo"], icon: SiApollographql, color: "text-[#311C87] dark:text-[#7D5BE2]" },
  { keywords: ["fastapi"], icon: SiFastapi, color: "text-[#009688]" },
  { keywords: ["django"], icon: SiDjango, color: "text-[#092E20] dark:text-[#44B78B]" },
  { keywords: ["flask"], icon: SiFlask, color: "text-zinc-400" },
  { keywords: ["nestjs"], icon: SiNestjs, color: "text-[#E0234E]" },
  { keywords: ["express", "express.js"], icon: SiExpress, color: "text-zinc-400" },
  { keywords: ["springboot", "spring"], icon: SiSpringboot, color: "text-[#6DB33F]" },
  { keywords: ["laravel"], icon: SiLaravel, color: "text-[#FF2D20]" },
  { keywords: ["flutter"], icon: SiFlutter, color: "text-[#02569B]" },
  { keywords: ["dart"], icon: SiDart, color: "text-[#0175C2]" },

  // Databases, Caches & Queues
  { keywords: ["postgresql", "postgres"], icon: DiPostgresql, color: "text-[#4169E1]" },
  { keywords: ["mongodb", "mongo"], icon: DiMongodb, color: "text-[#47A248]" },
  { keywords: ["redis"], icon: DiRedis, color: "text-[#DC382D]" },
  { keywords: ["mysql"], icon: DiMysql, color: "text-[#4479A1]" },
  { keywords: ["sqlite"], icon: SiSqlite, color: "text-[#003B57]" },
  { keywords: ["prisma"], icon: SiPrisma, color: "text-[#2D3748] dark:text-zinc-200" },
  { keywords: ["supabase"], icon: SiSupabase, color: "text-[#3ECF8E]" },
  { keywords: ["firebase"], icon: DiFirebase, color: "text-[#FFCA28]" },
  { keywords: ["kafka", "apache kafka"], icon: SiApachekafka, color: "text-[#231F20] dark:text-zinc-200" },
  { keywords: ["rabbitmq"], icon: SiRabbitmq, color: "text-[#FF6600]" },
  { keywords: ["elasticsearch", "elastic"], icon: SiElasticsearch, color: "text-[#005571]" },
  { keywords: ["cassandra"], icon: SiApachecassandra, color: "text-[#1287B1]" },
  { keywords: ["couchdb"], icon: SiApachecouchdb, color: "text-[#E42528]" },
  { keywords: ["dynamodb"], icon: SiAmazondynamodb, color: "text-[#4053D6]" },
  { keywords: ["cockroachdb", "cockroach"], icon: SiCockroachlabs, color: "text-[#6933FF]" },
  { keywords: ["snowflake"], icon: SiSnowflake, color: "text-[#29B5E8]" },
  { keywords: ["neo4j"], icon: SiNeo4J, color: "text-[#008CC1]" },
  { keywords: ["clickhouse"], icon: SiClickhouse, color: "text-[#FFCC01]" },

  // AI, ML & Vector DBs
  { keywords: ["pytorch", "rocm"], icon: SiPytorch, color: "text-[#EE4C2C]" },
  { keywords: ["tensorflow"], icon: SiTensorflow, color: "text-[#FF6F00]" },
  { keywords: ["keras"], icon: SiKeras, color: "text-[#D00000]" },
  { keywords: ["opencv"], icon: SiOpencv, color: "text-[#5C3EE8]" },
  { keywords: ["huggingface", "hugging face"], icon: SiHuggingface, color: "text-[#FFD21E]" },
  { keywords: ["openai", "chatgpt", "gpt"], icon: SiOpenai, color: "text-emerald-500" },
  { keywords: ["jupyter"], icon: SiJupyter, color: "text-[#F37626]" },
  { keywords: ["pandas"], icon: SiPandas, color: "text-[#150458] dark:text-[#E70488]" },
  { keywords: ["numpy"], icon: SiNumpy, color: "text-[#013243] dark:text-[#4DABCF]" },
  { keywords: ["scikit-learn", "scikitlearn", "sklearn"], icon: SiScikitlearn, color: "text-[#F7931E]" },
  { keywords: ["xgboost", "machine learning", "ml", "ai/ml", "ai", "deep learning", "llm"], icon: LuCpu, color: "text-purple-400" },
  { keywords: ["langchain"], icon: SiLangchain, color: "text-[#1C3C3C] dark:text-[#2DD4BF]" },
  { keywords: ["ollama"], icon: SiOllama, color: "text-zinc-900 dark:text-zinc-100" },
  { keywords: ["chroma", "chromadb", "qdrant", "pinecone", "weaviate", "milvus", "vector db", "vectordb"], icon: LuDatabase, color: "text-amber-500" },

  // Testing & Quality
  { keywords: ["jest"], icon: SiJest, color: "text-[#C21325]" },
  { keywords: ["vitest"], icon: SiVitest, color: "text-[#729B1B]" },
  { keywords: ["cypress"], icon: SiCypress, color: "text-[#17202C] dark:text-zinc-200" },
  { keywords: ["playwright"], icon: LuCheck, color: "text-[#2EAD33]" },
  { keywords: ["selenium"], icon: SiSelenium, color: "text-[#43B02A]" },

  // Tools & Security
  { keywords: ["mcp server", "mcp", "json-rpc", "rpc", "api", "rest"], icon: LuServer, color: "text-amber-500" },
  { keywords: ["security", "cryptography", "zero-knowledge", "auth", "oauth", "jwt"], icon: LuShield, color: "text-emerald-400" },
  { keywords: ["postman"], icon: SiPostman, color: "text-[#FF6C37]" },
  { keywords: ["figma"], icon: SiFigma, color: "text-[#F24E1E]" },
  { keywords: ["notion"], icon: SiNotion, color: "text-zinc-900 dark:text-zinc-100" },
  { keywords: ["slack"], icon: SiSlack, color: "text-[#4A154B]" },
  { keywords: ["discord"], icon: SiDiscord, color: "text-[#5865F2]" },
  { keywords: ["jira"], icon: SiJira, color: "text-[#0052CC]" },
  { keywords: ["macos", "apple", "ios"], icon: DiApple, color: "text-zinc-400" },
  { keywords: ["windows"], icon: DiWindows, color: "text-[#0078D6]" },
];

function matchSingle(token: string): { icon: IconType; color?: string } | null {
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

export function getTechIcon(name: string): { Icon: IconType; color?: string } {
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
