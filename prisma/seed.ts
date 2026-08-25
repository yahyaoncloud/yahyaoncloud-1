import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Profile Info
  console.log("Seeding ProfileInfo...");
  const profileData = {
    key: "homepage_profile",
    headline: "Cloud DevOps & Infrastructure Engineer.",
    bio: [
      "Over the past 3 years, I've engineered network backbones and scaled cloud environments—transitioning from 2 years in enterprise network infrastructure to building declarative Kubernetes, Terraform, and GitOps architectures.",
      "I studied Engineering at Global Institute of Engineering & Technology (GIET), Moinabad. I focus on simple, observable, and resilient distributed systems.",
    ],
    skills: [
      "AWS (EKS, VPC, Route53)",
      "Kubernetes & ArgoCD",
      "Terraform (IaC)",
      "Docker & Containers",
      "CI/CD (GitHub Actions)",
      "Linux & Networking (BGP/OSPF)",
      "Python & Bash Scripting",
      "Cloud Architecture & SRE",
      "Remix / TypeScript",
    ],
    certifications: [
      {
        name: "Cisco Certified Network Professional (CCNP)",
        issuer: "Cisco",
        credentialUrl: "https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/professional.html",
      },
      {
        name: "Cisco Certified Network Associate (CCNA)",
        issuer: "Cisco",
        credentialUrl: "https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html",
      },
      {
        name: "Microsoft Certified: Azure Administrator Associate",
        issuer: "Microsoft",
        credentialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/",
      },
      {
        name: "Microsoft Certified: Azure Solutions Architect Expert",
        issuer: "Microsoft",
        credentialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/",
      },
      {
        name: "Microsoft Certified: Azure Fundamentals",
        issuer: "Microsoft",
        credentialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
      },
      {
        name: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services",
        credentialUrl: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
      },
    ],
    experiences: [
      {
        year: "2024",
        present: true,
        company: "Gulf Intelligence & Media",
        role: "Architect / Full-stack Developer",
        description:
          "Architecting real-time geospatial intelligence, ML threat scoring pipelines, and cross-platform document synthesis engines using Go, Python, and React.",
        projects: [
          { name: "HormuzWatch", url: "/projects/hormuzwatch", internal: true },
          { name: "RaweeGo", url: "/projects/raweego", internal: true },
        ],
      },
      {
        year: "2023",
        present: false,
        company: "Enterprise Systems",
        role: "Full-stack & Infrastructure Engineer",
        description:
          "Engineered distributed point-of-sale tenant platforms, Kafka event-driven architectures, and encrypted certification authoring studios.",
        projects: [
          { name: "NoteTruck", url: "/projects/notetruck", internal: true },
          { name: "AburPOS Central", url: "/projects/aburpos-central", internal: true },
        ],
      },
    ],
    socialLinks: [
      { label: "Twitter", href: "https://x.com/yahyaoncloud", display: "https://twitter.com/yahyaoncloud", external: true },
      { label: "GitHub", href: "https://github.com/yahyaoncloud", display: "https://github.com/yahyaoncloud", external: true },
      { label: "LinkedIn", href: "https://linkedin.com/in/ykinwork1", display: "https://linkedin.com/in/ykinwork1", external: true },
      { label: "Email", href: "mailto:hello@yahyaoncloud.com", display: "hello@yahyaoncloud.com", external: false },
    ],
  };

  await prisma.profileInfo.upsert({
    where: { key: "homepage_profile" },
    update: profileData,
    create: profileData,
  });

  // 2. Seed Project Case Studies
  console.log("Seeding Project Case Studies...");
  const projects = [
    {
      slug: "hormuzwatch",
      title: "HormuzWatch — Gulf Intelligence Platform",
      category: "SaaS, Security, AI/ML, Observability, Infrastructure",
      period: "2024 - 2026",
      role: "Architect / Full-stack Developer",
      summary: "Real-time geospatial surveillance, multi-source news intelligence, and ensemble anomaly detection for strategic maritime regions in the Gulf. Combines AIS vessel tracking, aviation telemetry, and 16-news-source RSS pipeline with ML-powered threat scoring.",
      techStack: [
        "Go 1.23",
        "Python 3.11",
        "PyTorch ROCm",
        "XGBoost",
        "React 19",
        "TypeScript",
        "PostgreSQL",
        "Terraform",
      ],
      featured: true,
      order: 1,
      content: `## Executive Summary

HormuzWatch is a unified real-time maritime and aviation surveillance platform paired with a multi-source news intelligence engine for strategic Gulf waterways. It replaces fragmented manual monitoring by combining live AIS vessel feeds, OpenSky aviation telemetry, and an automated 16-source OSINT RSS ingestion pipeline with machine learning anomaly detection and threat scoring.`,
    },
    {
      slug: "raweego",
      title: "RaweeGo — Pocket Narrator / Document-to-Audio Platform",
      category: "SaaS, Developer Tool, AI/ML, Mobile, Automation",
      period: "2024 - 2025",
      role: "Architect / Full-stack Developer",
      summary: "Cross-platform document-to-audio platform with a Flutter mobile app, Rust native core engine, Go backend REST API, Python Piper TTS microservice, and React marketing website. End-to-end flow: mobile app inspects documents via Rust FFI → uploads to Go server → Go orchestrates Python TTS → audio streamed back to mobile for playback.",
      techStack: [
        "Flutter",
        "Rust FFI",
        "Go 1.22",
        "Python Piper TTS",
        "React 19",
        "Three.js",
      ],
      featured: true,
      order: 2,
      content: `## Executive Summary

RaweeGo is an end-to-end, privacy-respecting document-to-audio platform engineered as a clean monorepo across five isolated domains. It enables mobile users to convert documents into natural, neural-synthesized audio streams locally and efficiently without proprietary cloud speech lock-in.`,
    },
    {
      slug: "notetruck",
      title: "NoteTruck — Personal Certification Notes & Authoring Studio",
      category: "Developer Tool, SaaS, Observability",
      period: "2024 - 2025",
      role: "Architect / Full-stack Developer",
      summary: "High-performance single-port personal authoring studio and knowledge repository for cloud, networking, and security certification notes (AWS, Kubernetes, Azure, Cisco). Features Go backend with SQLite FTS5 search, live SSE sync, JWT auth, and embedded React Router v7/Vite frontend with Shadcn UI.",
      techStack: [
        "Go 1.22+",
        "React Router v7",
        "SQLite FTS5",
        "LUKS2 Encryption",
        "Docker",
        "Shadcn UI",
      ],
      featured: true,
      order: 3,
      content: `## Executive Summary

NoteTruck is a high-performance single-binary authoring studio and structured knowledge repository engineered for cloud, network, and security certification preparation. It provides an encrypted, zero-latency local-first workspace with real-time multi-tab synchronization and lightning-fast full-text search.`,
    },
    {
      slug: "aburpos-central",
      title: "AburPOS Central System — Tenant & License Management Platform",
      category: "SaaS, Infrastructure, Automation",
      period: "2025",
      role: "Architect / Backend Developer",
      summary: "Cloud-based central management platform for distributed AburPOS tenants. Handles tenant onboarding/provisioning, license generation/validation/renewal with tier-based limits (Small/Medium/Enterprise), and server health monitoring via Kafka event-driven architecture.",
      techStack: [
        "Go 1.24+",
        "Apache Kafka",
        "MongoDB",
        "Gin Framework",
        "Swagger/OpenAPI",
        "AWS EC2",
      ],
      featured: true,
      order: 4,
      content: `## Executive Summary

AburPOS Central System is a high-availability cloud control plane designed to manage distributed point-of-sale (POS) deployments across multi-branch enterprise networks. Built with Go 1.24, Apache Kafka, and MongoDB, it centralizes tenant lifecycle orchestration, cryptographic license validation, remote server health monitoring, and asynchronous state synchronization.`,
    },
  ];

  // Remove obsolete projects
  const activeSlugs = projects.map((p) => p.slug);
  await prisma.projectCaseStudy.deleteMany({
    where: {
      slug: {
        notIn: activeSlugs,
      },
    },
  });

  for (const proj of projects) {
    await prisma.projectCaseStudy.upsert({
      where: { slug: proj.slug },
      update: proj,
      create: proj,
    });
  }

  // 3. Seed Research Papers
  console.log("Seeding Research Papers...");
  const researchPapers = [
    {
      slug: "ebpf-cloud-traffic-engineering",
      title: "eBPF-Driven Cloud Traffic Engineering: Latency Optimization in Multi-Tenant Kubernetes",
      authors: ["Yahya Khan"],
      venue: "Preprint / Technical Report",
      year: "2024",
      abstract: "Analyzing kernel-level packet filtering and XDP acceleration to bypass standard Linux iptables overhead, demonstrating up to 40% throughput improvement and 28% lower tail latency in containerized mesh environments.",
      pdfUrl: "https://arxiv.org/abs/example-ebpf-kubernetes",
      doi: "10.1145/example.2024.ebpf",
      tags: ["eBPF", "Kubernetes", "Linux Kernel", "Traffic Engineering", "Networking"],
      featured: true,
      order: 1,
      content: `## Abstract

Modern microservice architectures demand ultra-low latency packet routing. This paper explores utilizing extended Berkeley Packet Filters (eBPF) and eXpress Data Path (XDP) within the Linux kernel to bypass the traditional netfilter stack in multi-tenant Kubernetes clusters.

## Methodology & Findings

- Evaluated kernel hook efficiency against traditional iptables and IPVS routing tables.
- Achieved a 38% reduction in P99 latency during 100k req/sec HTTP benchmark loads.`,
    },
    {
      slug: "autonomous-sre-remediation",
      title: "Autonomous Diagnostic Agents in Production Infrastructure: Reducing MTTR via Declarative State Verification",
      authors: ["Yahya Khan"],
      venue: "Infrastructure Systems Workshop",
      year: "2024",
      abstract: "A framework for autonomous diagnostic agents that correlate telemetry data, execute non-destructive diagnostic runbooks, and formulate remediation hypotheses in distributed cloud topologies.",
      pdfUrl: "https://arxiv.org/abs/example-agentic-sre",
      doi: "10.1145/example.2024.sre",
      tags: ["Agentic AI", "SRE", "DevOps", "Incident Management", "Cloud Automation"],
      featured: true,
      order: 2,
      content: `## Abstract

Incident triage in cloud infrastructure requires rapid correlation across heterogeneous logs, traces, and metrics. We present an autonomous agent architecture that reduces Mean Time to Resolution (MTTR) by running live topological graph walks and state verifications.`,
    },
  ];

  for (const paper of researchPapers) {
    await prisma.researchPaper.upsert({
      where: { slug: paper.slug },
      update: paper,
      create: paper,
    });
  }

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
