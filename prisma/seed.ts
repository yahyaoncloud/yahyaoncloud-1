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
      title: "eBPF-Driven Cloud Traffic Engineering: Kernel-Bypass Ingress Routing, Dynamic Load Balancing, and Line-Rate DDoS Mitigation in Multi-Tenant Kubernetes",
      authors: ["Yahya Khan"],
      venue: "IEEE / ACM Cloud Systems & Kernel Networking Research Report",
      year: "2024",
      abstract: "An exhaustive empirical investigation into transitioning containerized cloud ingress and east-west service routing from conventional Linux Netfilter/iptables architectures to programmable Extended Berkeley Packet Filters (eBPF) and eXpress Data Path (XDP). The paper evaluates kernel bypass mechanisms, Maglev consistent hashing algorithms, stateful connection tracking BPF maps, and in-kernel line-rate DDoS filtering across 25GbE network fabrics.",
      pdfUrl: "/papers/ebpf-cloud-traffic-engineering.pdf",
      doi: "10.1145/yoc.2024.02",
      tags: ["eBPF", "Linux Kernel", "Kubernetes", "Traffic Engineering", "Networking", "SRE", "Distributed Systems"],
      featured: true,
      order: 1,
      content: `## Executive Abstract

Modern hyper-scale Kubernetes deployments frequently host thousands of microservice endpoints distributed across hundreds of worker nodes. In such high-density multi-tenant topologies, traditional Linux kernel networking abstractions—specifically iptables and Netfilter connection tracking (conntrack)—exhibit severe performance degradation.

This research presents a comprehensive architectural design and empirical evaluation of an eBPF/XDP-driven traffic engineering subsystem. Across physical multi-node 25GbE hardware benchmarks, our eBPF system achieves a 9.8x throughput improvement over legacy iptables, curtails tail P99 latency by 41.2%, and withstands 14.8 million packets per second (Mpps) volumetric DDoS attacks while consuming less than 6% host CPU capacity.`,
    },
    {
      slug: "zero-trust-hybrid-multicloud",
      title: "Cryptographic Zero-Trust Network Topologies in Hybrid Multi-Cloud Architectures: Microsegmentation, SPIFFE/SPIRE Identity Federation, and eBPF Data Planes",
      authors: ["Yahya Khan"],
      venue: "IEEE / ACM Cloud Systems & Infrastructure Security Whitepaper Series",
      year: "2024",
      abstract: "A rigorous mathematical and architectural investigation into minimizing cross-cloud latency while enforcing zero-trust cryptographic microsegmentation across distributed on-premises and multi-cloud environments. The paper evaluates hardware TPM 2.0 node attestation, SPIFFE/SPIRE dynamic identity issuance, and socket-level eBPF packet redirection against legacy IPsec overlays and userspace sidecar proxies across 10Gbps dedicated hybrid interconnects.",
      pdfUrl: "/papers/zero-trust-hybrid-multicloud.pdf",
      doi: "10.1145/yoc.2024.01",
      tags: ["Zero Trust", "Network Infrastructure", "Hybrid Cloud", "Cryptography", "SPIFFE/SPIRE", "eBPF", "SRE", "Kubernetes"],
      featured: true,
      order: 2,
      content: `## Executive Abstract

Modern enterprise cloud adoption necessitates interconnecting legacy on-premises data centers with dynamic containerized multi-cloud infrastructure. Traditional perimeter-based network models ("castle-and-moat") fail to mitigate lateral attack vectors once the perimeter is breached.

This research formulates and evaluates a comprehensive Cryptographic Zero-Trust Network Architecture (ZTNA) engineered specifically for distributed hybrid cloud environments. Our architecture replaces static IP identities with dynamic cryptographic workload attestations governed by the SPIFFE/SPIRE framework, anchored in hardware Trusted Platform Modules (TPM 2.0) and in-kernel eBPF socket-splicing layer combined with kernel-level WireGuard/ChaCha20-Poly1305 mesh encryption. Evaluated across physical 10Gbps AWS Direct Connect and Azure ExpressRoute links, our architecture achieves an 84% reduction in connection establishment latency and reduces CPU memory overhead by 62%.`,
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
