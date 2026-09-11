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
      "3+ years engineering enterprise network backbones and production cloud infrastructure—transitioning from routing/switching (CCNP/CCNA, BGP/OSPF, SD-WAN) to declarative Kubernetes, Terraform IaC, and GitOps architectures.",
      "Specializing in high-reliability AWS/Azure platforms, zero-drift CI/CD pipelines, kernel-level observability (eBPF), and scalable distributed systems.",
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
      "Golang",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Prometheus & Grafana",
      "Ansible & Helm",
      "Cloudflare",
    ],
    skillsDisplayMode: "both",
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
        year: "2024–2025",
        present: false,
        company: "Minute KSA",
        role: "Cloud DevOps Engineer",
        description:
          "Production AWS platform engineering for a high-concurrency ride-hailing platform. Managed multi-tenant EKS clusters, ArgoCD GitOps deployments, Terraform IaC modules, Prometheus/Grafana observability, and automated CI/CD pipelines maintaining 99.95% uptime.",
      },
      {
        year: "2022–2024",
        present: false,
        company: "Faabee Technologies",
        role: "Network Infrastructure Engineer",
        description:
          "Enterprise networking across multi-site infrastructure. Managed BGP/OSPF dynamic routing, Cisco switching, SD-WAN failover, IPsec VPN tunnels, and hybrid cloud connectivity with automated telemetry and incident troubleshooting.",
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
      slug: "ytpmd",
      title: "ytpMD — PDF-to-Markdown Engine for Technical Documentation & AI Workflows",
      category: "Developer Tools",
      period: "2025 - 2026",
      role: "Creator / Developer",
      summary: "High-performance Go CLI converting technical PDFs into chapter-segmented Markdown with YAML frontmatter, token metrics, and Model Context Protocol (MCP) server support for RAG and AI coding agents.",
      techStack: [
        "Go",
        "MCP",
        "AI Agents",
        "RAG",
        "React",
        "Vite",
        "Firebase",
        "Debian",
      ],
      demoUrl: "https://ytpmd.aburcloud.com",
      githubUrl: "https://github.com/ytp24/ytpmd",
      featured: true,
      order: 1,
      content: `## Executive Summary

ytpMD is a high-performance, local-first document processing engine that converts technical PDF manuals and books into clean, structured, chapter-segmented Markdown documentation. Rather than producing one large unmanageable file, ytpMD analyzes document structure and generates an organized documentation library with individual chapter notes, YAML frontmatter, token metrics, and AI agent manifests.`,
    },
    {
      slug: "hormuzwatch",
      title: "HormuzWatch — Gulf Intelligence Platform",
      category: "AI & Observability",
      period: "2024 - 2026",
      role: "Architect / Full-stack Developer",
      summary: "Real-time maritime and aviation surveillance platform for strategic Gulf waterways. Combines live AIS kinematic feeds, OpenSky telemetry, and a 16-source OSINT news pipeline with ensemble ML anomaly detection (IsolationForest + LOF + XGBoost) and WebSocket streaming.",
      techStack: [
        "Go",
        "Python",
        "PyTorch",
        "XGBoost",
        "React",
        "TypeScript",
        "PostgreSQL",
        "Terraform",
        "Azure",
      ],
      demoUrl: "https://hormuzwatch.aburcloud.com",
      githubUrl: "https://github.com/yahyaoncloud/hormuzwatch",
      featured: true,
      order: 2,
      content: `## Executive Summary

HormuzWatch is a unified real-time maritime and aviation surveillance platform paired with a multi-source news intelligence engine for strategic Gulf waterways. It replaces fragmented manual monitoring by combining live AIS vessel feeds, OpenSky aviation telemetry, and an automated 16-source OSINT RSS ingestion pipeline with machine learning anomaly detection and threat scoring.`,
    },
    {
      slug: "firewood",
      title: "Firewood — Zero-Knowledge Offline Password & Secret Vault",
      category: "Security",
      period: "2024 - 2025",
      role: "Creator / Mobile & Security Engineer",
      summary: "Offline-first zero-knowledge secrets vault built with Flutter and Dart. Features Argon2id key derivation (64MB, 3 iterations) and XChaCha20-Poly1305 AEAD field-level authenticated encryption with zero remote footprint.",
      techStack: [
        "Flutter",
        "Dart",
        "Argon2id",
        "Cryptography",
        "Isar Database",
        "Android",
        "Linux",
      ],
      demoUrl: "",
      githubUrl: "https://github.com/yahyaoncloud/firewood",
      featured: true,
      order: 3,
      content: `## Executive Summary

Firewood is a high-security, local-first, and completely offline password and credentials manager built with Flutter and Dart. Designed around a strict zero-knowledge security architecture, Firewood ensures that sensitive user secrets never touch remote servers or unencrypted persistent storage.`,
    },
    {
      slug: "notetruck",
      title: "NoteTruck — Personal Certification Notes & Authoring Studio",
      category: "Cloud & DevOps",
      period: "2024 - 2025",
      role: "Architect / Full-stack Developer",
      summary: "Single-binary documentation studio and knowledge repository for cloud certifications. Features Go embedded runtime, SQLite FTS5 full-text search, real-time SSE multi-tab sync, and LUKS2 AES-XTS 512-bit encrypted partition.",
      techStack: [
        "Go",
        "SQLite",
        "React",
        "Docker",
        "Tailwind CSS",
        "Vite",
      ],
      demoUrl: "https://notetruck.aburcloud.com",
      githubUrl: "https://github.com/yahyaoncloud/notetruck",
      featured: true,
      order: 4,
      content: `## Executive Summary

NoteTruck is a high-performance single-binary authoring studio and structured knowledge repository engineered for cloud, network, and security certification preparation. It provides an encrypted, zero-latency local-first workspace with real-time multi-tab synchronization and lightning-fast full-text search.`,
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
      slug: "zero-trust-hybrid-multicloud",
      title: "Zero-Trust Network Topologies in Hybrid Multi-Cloud Architectures",
      authors: ["Yahya"],
      venue: "Technical Research Report & Architecture Whitepaper",
      year: "2024",
      abstract: "An analytical investigation into minimizing latency overhead while enforcing cryptographic identity verification and microsegmentation across distributed on-premises and multi-cloud environments. The paper evaluates eBPF kernel-level routing against legacy IPsec overlays in production-grade throughput benchmarks.",
      pdfUrl: "/papers/zero-trust-hybrid-multicloud.pdf",
      doi: "10.1145/yoc.2024.01",
      tags: ["Network Infrastructure", "Hybrid Cloud", "Zero Trust", "SDN"],
      featured: true,
      order: 1,
      content: `## Executive Abstract

Modern enterprise cloud adoption necessitates interconnecting legacy on-premises data centers with dynamic containerized multi-cloud infrastructure. Traditional perimeter-based network models ("castle-and-moat") fail to mitigate lateral attack vectors once the perimeter is breached.

This research paper proposes a hybrid Zero-Trust Network Architecture (ZTNA) model that replaces static IP-based perimeter firewalls with cryptographic identity verification, dynamic Mutual TLS (mTLS), and kernel-level eBPF packet filtering.

---

## Core Findings & Benchmark Summary

1. **Kernel Bypass & Efficiency**: eBPF-based socket-level packet redirection reduces TCP handshaking latency by 28.4% compared to standard userspace sidecar proxies.
2. **Dynamic Identity Binding**: Cryptographic SPIFFE/SPIRE identity tokens bound to ephemeral Kubernetes workloads eliminate reliance on static CIDR whitelist blocks.
3. **Resilience under Network Partitioning**: Decentralized policy enforcement engines on each node ensure that temporary control-plane disconnections do not degrade existing data-plane throughput.`,
    },
  ];

  for (const paper of researchPapers) {
    await prisma.researchPaper.upsert({
      where: { slug: paper.slug },
      update: paper,
      create: paper,
    });
  }

  // 4. Seed Categories, Tags, and Published Blog Post
  console.log("Seeding Categories & Tags...");
  const devopsCategory = await prisma.category.upsert({
    where: { slug: "cloud-devops" },
    update: {},
    create: {
      catID: "cat-cloud-devops",
      name: "Cloud & DevOps",
      slug: "cloud-devops",
    },
  });

  const k8sTag = await prisma.tag.upsert({
    where: { name: "Kubernetes" },
    update: {},
    create: {
      tagID: "tag-kubernetes",
      name: "Kubernetes",
    },
  });

  const terraformTag = await prisma.tag.upsert({
    where: { name: "Terraform" },
    update: {},
    create: {
      tagID: "tag-terraform",
      name: "Terraform",
    },
  });

  console.log("Seeding Default Author & Blog Post...");
  let author = await prisma.author.findFirst({ where: { username: "yahya" } });
  if (!author) {
    author = await prisma.author.create({
      data: {
        authorId: "yahya-owner",
        username: "yahya",
        authorName: "Yahya",
        authorProfession: "Cloud DevOps & Infrastructure Engineer",
        role: "superadmin",
      },
    });
  }

  await prisma.post.upsert({
    where: { slug: "building-observable-resilient-cloud-infrastructure" },
    update: {},
    create: {
      slug: "building-observable-resilient-cloud-infrastructure",
      title: "Architecting Observable & Resilient Cloud Infrastructure with GitOps",
      summary: "A practical deep-dive into establishing declarative Kubernetes clusters with ArgoCD, Terraform IaC, and zero-drift GitOps pipelines.",
      content: `## Introduction

Operating high-reliability infrastructure at scale requires treating every component of your architecture as code. Declarative configuration, automated reconciliation, and continuous observability form the bedrock of resilient cloud systems.

## Declarative State with GitOps

By storing the entire cluster topology within Git repositories, teams achieve:
- **Auditability**: Every infrastructure mutation is recorded with author and rationale.
- **Automated Drift Detection**: Controllers continuously align live cluster state with desired state.
- **Rapid Disaster Recovery**: Restoring an entire environment takes minutes via declarative manifests.

## Key Observability Pillars

1. **Metrics**: Prometheus & Grafana capturing real-time latency (P50, P95, P99) and resource saturation.
2. **Logs**: Centralized structured JSON logging with distributed tracing identifiers.
3. **Automated Runbooks**: Self-healing loops verifying cluster health and executing progressive rollouts.`,
      status: "published",
      featured: true,
      minuteRead: 5,
      views: 120,
      likes: 24,
      authorId: author.id,
      categoryIds: [devopsCategory.id],
      tagIds: [k8sTag.id, terraformTag.id],
    },
  });

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
