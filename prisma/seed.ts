import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Profile Info
  console.log("Seeding ProfileInfo...");
  await prisma.profileInfo.upsert({
    where: { key: "homepage_profile" },
    update: {},
    create: {
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
      experiences: [
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
      ],
      socialLinks: [
        { label: "Twitter", href: "https://x.com/yahyaoncloud", display: "https://twitter.com/yahyaoncloud", external: true },
        { label: "GitHub", href: "https://github.com/yahyaoncloud", display: "https://github.com/yahyaoncloud", external: true },
        { label: "LinkedIn", href: "https://linkedin.com/in/ykinwork1", display: "https://linkedin.com/in/ykinwork1", external: true },
        { label: "Email", href: "mailto:hello@yahyaoncloud.com", display: "hello@yahyaoncloud.com", external: false },
      ],
    },
  });

  // 2. Seed Project Case Studies
  console.log("Seeding Project Case Studies...");
  const projects = [
    {
      slug: "multi-region-cloud-gitops",
      title: "Multi-Region Cloud GitOps Platform",
      category: "Infrastructure",
      period: "2024",
      role: "Lead Infrastructure Architect",
      summary: "Multi-region Kubernetes and GitOps delivery pipeline orchestrating mission-critical microservices with automated failover and zero-downtime rollouts.",
      techStack: ["AWS EKS", "Terraform", "ArgoCD", "Kubernetes", "Helm", "GitHub Actions"],
      githubUrl: "https://github.com/yahyaoncloud/cloud-gitops-infra",
      demoUrl: "https://gitops.yahyaoncloud.com",
      featured: true,
      order: 1,
      content: `## Architecture Overview

This platform implements a multi-region active-active architecture spanning \`us-east-1\` and \`eu-west-1\` on AWS. Utilizing Terraform for modular infrastructure as code and ArgoCD ApplicationSets for declarative GitOps synchronization.

### Key Highlights

- **Declarative Infrastructure**: 100% Terraform coverage across VPC peering, Route53 latency routing, and IAM roles.
- **Continuous Delivery**: Automated pull-request preview environments and progressive canary rollouts via Argo Rollouts.
- **Disaster Recovery**: Automated RTO < 60 seconds with cross-region Amazon Aurora and DynamoDB global tables.`,
    },
    {
      slug: "observability-mesh-telemetry",
      title: "Distributed Observability & Telemetry Mesh",
      category: "Observability",
      period: "2023 - 2024",
      role: "DevOps / SRE Engineer",
      summary: "Unified eBPF and OpenTelemetry distributed tracing mesh processing 40k+ events/sec with Prometheus and Grafana dashboards.",
      techStack: ["OpenTelemetry", "Prometheus", "Grafana", "eBPF", "Grafana Loki", "Tempo"],
      githubUrl: "https://github.com/yahyaoncloud/observability-mesh",
      demoUrl: "https://telemetry.yahyaoncloud.com",
      featured: true,
      order: 2,
      content: `## Distributed Tracing & Metric Pipelines

Engineered a high-throughput telemetry pipeline collecting traces, logs, and kernel metrics with sub-millisecond overhead.

### Implementation Details

- **OpenTelemetry Collector Gateway**: Clustered OTel collectors with adaptive sampling to curtail ingestion costs by 65%.
- **eBPF Kernel Probing**: Non-invasive network latency and TCP retransmission tracking using Cilium Hubble.
- **Alerting & SLO Tracking**: Automated alerting rules with Slack and PagerDuty escalations.`,
    },
    {
      slug: "hybrid-sdn-infrastructure",
      title: "Hybrid Cloud Enterprise Network & Zero-Trust SDN",
      category: "Networking",
      period: "2022 - 2023",
      role: "Network Engineer",
      summary: "Enterprise SDN migration interconnecting on-premises data centers to AWS VPCs via IPSec tunnels, BGP routing, and Zero-Trust access.",
      techStack: ["BGP", "OSPF", "Cisco Nexus", "WireGuard", "AWS DirectConnect", "Zero Trust"],
      githubUrl: "https://github.com/yahyaoncloud/hybrid-network-sdn",
      demoUrl: "https://sdn.yahyaoncloud.com",
      featured: true,
      order: 3,
      content: `## Network Backbone Architecture

Designed high-reliability interconnects between legacy bare-metal infrastructure and modern public cloud regions.

### Highlights

- **Dynamic Routing**: Dual-homed BGP peering with AS prepending and route filtering to avoid asymmetric routing.
- **Microsegmentation**: Layer-4/Layer-7 access policies enforcing least-privilege security per service tier.`,
    },
  ];

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
