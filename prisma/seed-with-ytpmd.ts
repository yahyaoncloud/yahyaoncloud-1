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
        year: "2024–2025",
        present: false,
        company: "Minute KSA",
        role: "Cloud DevOps Engineer",
        description:
          "Supported production AWS infrastructure for a ride-hailing platform, focusing on cloud infrastructure, containerized workloads, CI/CD, infrastructure automation, cloud networking, production troubleshooting, reliability, and cost optimization.",
      },
      {
        year: "2022–2024",
        present: false,
        company: "Faabee Technologies",
        role: "Network Infrastructure Engineer",
        description:
          "Supported enterprise network infrastructure and production operations, focusing on routing and switching, SD-WAN, network security, hybrid cloud connectivity, incident troubleshooting, network automation, and operational reliability.",
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
      category: "Developer Tools, AI/ML, Documentation",
      period: "2025 - 2026",
      role: "Creator / Developer",
      summary: "High-performance, local-first PDF-to-chapter-based Markdown engine built for technical documentation, RAG pipelines, and AI-agent workflows. Slices PDFs by TOC, generates YAML frontmatter, breadcrumbs, and AGENTS.md manifests.",
      techStack: [
        "Go 1.22+",
        "PDF Processing",
        "MCP Server",
        "JSON-RPC 2.0",
        "Debian / Snap",
        "React",
        "Vite",
        "Firebase",
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
        "Terraform (Azure)",
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
      category: "Mobile, Security, Cryptography",
      period: "2024 - 2025",
      role: "Creator / Mobile & Security Engineer",
      summary: "Local-first offline password and credentials manager built with Flutter, Riverpod, and Isar. Implements zero-knowledge manual field-level encryption using Argon2id key derivation and XChaCha20-Poly1305 AEAD authenticated encryption.",
      techStack: [
        "Flutter 3.22+",
        "Dart",
        "Argon2id KDF",
        "XChaCha20-Poly1305 AEAD",
        "Isar Database",
        "Riverpod 2.5",
        "Linux Desktop / Android",
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
      demoUrl: "https://notetruck.aburcloud.com",
      githubUrl: "https://github.com/yahyaoncloud/notetruck",
      featured: true,
      order: 4,
      content: `## Executive Summary

NoteTruck is a high-performance single-binary authoring studio and structured knowledge repository engineered for cloud, network, and security certification preparation. It provides an encrypted, zero-latency local-first workspace with real-time multi-tab synchronization and lightning-fast full-text search.`,
    },
  ];
## AI-Agent Architecture

A central design goal of ytpMD is making generated documentation immediately understandable to AI agents.

The tool automatically generates an \`AGENTS.md\` manifest describing the document structure, chapter mappings, and token metrics.

An agent can therefore inspect the manifest first and determine:

1. What document is available
2. How the document is divided
3. Which chapter is relevant
4. Approximately how much context each chapter contains
5. Which files should be loaded for a particular task

This supports efficient context selection instead of forcing an AI system to process the complete source document.

The generated documentation can be used with:

- Local LLM workflows
- RAG pipelines
- LangChain
- LlamaIndex
- Coding agents
- AI development environments
- Custom document-processing agents

## MCP Integration

ytpMD includes an MCP stdio server that exposes the generated documentation to compatible AI environments.

\`\`\`bash
ytpmd mcp
\`\`\`

The MCP integration uses the Model Context Protocol and JSON-RPC 2.0 to provide an agent-oriented interface to the documentation workflow.

It is designed for environments including:

- Cursor
- Claude Desktop
- Google Antigravity
- VS Code
- Other MCP-compatible clients

This allows ytpMD-generated documentation to become part of an agent's working context without requiring the original PDF to be repeatedly processed.

## Document Processing Pipeline

ytpMD focuses on producing useful technical documentation rather than performing raw text extraction.

The processing pipeline includes:

\`\`\`text
PDF
 │
 ├── Document validation
 │
 ├── Encryption detection
 │
 ├── Text extraction
 │
 ├── Front-matter analysis
 │
 ├── Table-of-contents analysis
 │
 ├── Chapter detection
 │
 ├── Header/footer cleanup
 │
 ├── Hyphenation cleanup
 │
 ├── Appendix detection
 │
 ├── Index/bibliography cutoff
 │
 └── Markdown generation
\`\`\`

The output is designed to preserve meaningful document structure while removing common extraction noise.

## PDF Processing

The engine handles several common PDF-processing conditions:

- Table-of-contents-based chapter segmentation
- Front-matter skipping
- Header and footer cleanup
- Hyphenation normalization
- Appendix detection
- Index detection
- Bibliography cutoff
- Scanned-document warnings
- Encrypted PDF detection
- Markdown generation
- Chapter-level metadata generation

The result is a cleaner and more predictable documentation corpus for downstream tooling.

## Performance

The core conversion engine is implemented in Go with concurrency as a primary design consideration.

Batch processing can use worker goroutines to process multiple PDFs in parallel rather than requiring sequential conversion.

This architecture is intended for workflows involving:

- Large technical documentation collections
- Multiple certification books
- Repeated document conversion
- Local knowledge-base construction
- Automated ingestion pipelines

## Local-First Design

ytpMD is designed around local document processing.

The conversion workflow does not require:

- Telemetry
- Mandatory cloud processing
- External AI APIs
- Uploading source PDFs to a hosted processing service

PDFs are processed locally and Markdown documentation is generated locally.

This makes the tool appropriate for technical documentation and knowledge sources that users prefer to keep on their own systems.

## Generated Documentation Structure

A generated documentation directory contains more than extracted chapter text.

\`\`\`text
Documentation/
├── README.md
├── AGENTS.md
├── 01_chapter.md
├── 02_chapter.md
├── 03_chapter.md
└── ...
\`\`\`

\`README.md\` provides human-oriented navigation.

\`AGENTS.md\` provides machine-oriented document structure and token information.

Individual chapter files contain the actual documentation together with YAML frontmatter.

This creates a lightweight convention for using the same documentation repository from both traditional Markdown tooling and AI-agent workflows.

## Installation

ytpMD provides multiple installation methods.

The installation script can be used directly:

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/ytp24/ytpMD/main/scripts/install.sh | bash
\`\`\`

The project also supports package-based installation through:

- Snap
- Homebrew
- AUR
- Debian packages

## Web Application

The project includes a retro Windows 95-inspired showcase application built with React and Vite.

The web application provides an interactive presentation layer for the command-line tool and its ecosystem.

It includes:

- Interactive terminal simulation
- Installation commands
- Package download information
- SHA256 checksums
- MCP configuration
- Interactive documentation
- Project architecture information

The showcase is hosted through Firebase Hosting.

## Technology

### Core Engine

- Go
- PDF processing
- Concurrent worker pools
- Markdown generation
- YAML frontmatter

### AI Integration

- Model Context Protocol
- JSON-RPC 2.0
- AI-agent manifests
- RAG-oriented document structure

### Web

- React
- Vite
- CSS
- Firebase Hosting

## Design Principles

### Local First

Source documents should not need to leave the user's machine simply to become structured Markdown.

### Structure Over Raw Extraction

The objective is not merely to extract text. The objective is to produce documentation that retains useful document hierarchy.

### Human and Machine Readability

Generated Markdown should remain understandable to humans while exposing enough structure for automated systems and AI agents.

### Efficient Context Usage

Chapter segmentation, token estimates, and agent manifests allow downstream systems to select relevant context rather than loading entire books unnecessarily.

### Portable Output

The generated documentation consists of ordinary Markdown and YAML metadata, making it usable with standard developer tooling without requiring a proprietary database or hosted platform.

## Use Cases

ytpMD can be used for:

- Technical books
- Certification manuals
- Engineering documentation
- Internal PDF knowledge bases
- RAG corpus preparation
- Local LLM knowledge repositories
- AI-agent context preparation
- Developer documentation pipelines
- Batch PDF-to-Markdown conversion

## Open Source

ytpMD is released under the Apache License 2.0.

The project continues to evolve across PDF extraction, packaging, testing, documentation, and AI-agent workflows. Contributions, feedback, and ideas are welcome as the project continues to evolve.

## Links

- GitHub: https://github.com/ytp24/ytpMD
- Demo: https://ytpmd-1222d.web.app
`,
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
