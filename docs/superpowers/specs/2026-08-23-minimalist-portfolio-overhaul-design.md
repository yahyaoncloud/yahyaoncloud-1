# Minimalist Portfolio Overhaul Design Specification

## Overview
A complete transformation of the Yahya On Cloud personal website from a blog platform into a modern, minimalist portfolio website powered by **Bun**. The site features comprehensive project case studies (with Markdown articles, Mermaid architecture diagrams, live demo links, and images), a dedicated research papers section, a refined experience timeline (3 years: 2 years Network Infrastructure Engineer → 1 year Cloud DevOps Engineer), inline skills (≤ 9 items), education (GIET, Moinabad), a floating transparent navbar, a unified layout wrapper, and an indirect footer link to the preserved Admin Portal.

---

## 1. Tooling, Runtime & Package Management
- **Runtime**: Bun (`bun run dev`, `bun run build`, `bun run start`).
- **Dependencies**:
  - Add `mermaid` for interactive architecture and flow diagrams.
  - Retain `gray-matter`, `react-markdown`, `remark-gfm`, and `@remix-run/*` dependencies.
  - Update `package.json` scripts and generate/update Bun lockfile.

---

## 2. Information Architecture & Routing

### Public Routes
- `/` (`app/routes/public/_index.tsx`):
  - Hero profile (photo, title, location, casual yet passionate summary highlighting engineering experience, contact links without phone).
  - Experience timeline: 3 years total (1 year Cloud DevOps Engineer, 2 years Network Infrastructure Engineer).
  - Inline skills badge list (strictly ≤ 9 skills).
  - Education (GIET, Moinabad).
  - Featured Project Case Studies preview.
  - Research Papers highlights.
- `/projects` (`app/routes/public/projects.tsx`):
  - Gallery of end-to-end project case studies with category tags, live demo links, and GitHub repository links.
- `/projects/:slug` (`app/routes/public/projects.$slug.tsx`):
  - Dedicated full-page project case study article with embedded Mermaid architecture diagrams, technical deep-dive, key decisions, metrics, and screenshots.
- `/research` (`app/routes/public/research.tsx`):
  - Showcase of research papers and technical whitepapers with abstracts, key findings, citations, and PDF viewer/download links.
- `/contact` (`app/routes/public/contact.tsx`):
  - Minimalist contact form and direct connections (Email, LinkedIn, GitHub, X).
- `/resume` (`app/routes/resume.tsx`):
  - Retained public resume viewer.

### Removed Routes
- Public blog routes: `/blog`, `/blog/posts`, `/blog/post/:slug`.

### Preserved Subsystems
- `/admin/*`, `/auth/*`, `/login`, `/api/*` remain intact and functional.
- The Admin Portal is accessible via an indirect, discreet link/button located in the footer.

---

## 3. Content System (`content/`)

### Project Case Studies (`content/projects/*.md`)
Each project Markdown file includes:
```yaml
---
title: "Multi-Region Cloud Infrastructure & GitOps Platform"
slug: "multi-region-cloud-gitops"
summary: "High-availability multi-region Kubernetes platform with automated canary deployments and Terraform IaC."
period: "2024 - 2025"
role: "Lead Cloud DevOps Engineer"
techStack:
  - AWS
  - Kubernetes
  - Terraform
  - GitHub Actions
  - ArgoCD
  - Prometheus
demoUrl: "https://demo.yahyaoncloud.com"
githubUrl: "https://github.com/yahyaoncloud"
coverImage: "/images/projects/cloud-gitops-cover.webp"
featured: true
order: 1
---
```
Article sections:
1. Executive Summary & Problem Context
2. Architecture & Data Flow (with embedded `mermaid` graph)
3. Technical Implementation & Infrastructure as Code
4. High-Availability & Disaster Recovery Strategies
5. Observable Outcomes & Performance Metrics

### Research Papers (`content/research/*.md`)
Each research paper Markdown file includes:
```yaml
---
title: "Zero-Trust Network Topologies in Hybrid Multi-Cloud Architectures"
slug: "zero-trust-hybrid-multicloud"
authors:
  - "Yahya"
venue: "Technical Research Report / Whitepaper"
year: "2024"
pdfUrl: "/papers/zero-trust-hybrid-multicloud.pdf"
doi: "10.1145/example.2024.01"
tags:
  - Network Infrastructure
  - Hybrid Cloud
  - Zero Trust
  - SDN
abstract: "An analytical study on minimizing latency overhead while enforcing cryptographic identity verification across distributed hybrid cloud networks."
featured: true
order: 1
---
```

---

## 4. UI/UX & Design System

1. **Floating Minimalist Navbar**:
   - Pinned at top center: `max-w-xl`, pill shape, transparent background with `backdrop-blur-md bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60`.
   - Links: `Home`, `Projects`, `Research`, `Contact` + Dark/Light Mode toggle (`Sun`/`Moon`).
   - Clean, no heavy backgrounds or distracting borders.

2. **Unified Layout Wrapper**:
   - Consistent `max-w-3xl mx-auto px-4 sm:px-6` on all pages.
   - Harmonic spacing: `pt-24 pb-16` ensuring consistent vertical alignment.

3. **Color Palette & Typography**:
   - Zinc/Slate neutral scale with subtle indigo/violet accents.
   - Dark mode default with seamless light mode toggle.
   - Typography: Clean Inter sans-serif with monospace code blocks and clear visual hierarchy.

4. **Footer**:
   - Minimalist copyright, social links, and a discreet, subtle Admin Portal link (`Portal` with a subtle key/terminal icon) in the bottom metadata line.

---

## 5. Implementation Phases
1. **Tooling & Branch**: Switch runtime commands and lockfile to Bun on the `minimalist` branch.
2. **Content Engine & Assets**: Create `content/projects/`, `content/research/`, and `app/Services/content.server.ts` loader.
3. **Diagrams & Markdown**: Implement `MermaidViewer` client component and `MarkdownViewer`.
4. **Layout & Navigation**: Build the floating navbar, minimalist footer with discreet admin button, and unified `UserLayout`.
5. **Pages**:
   - Overhaul `app/routes/public/_index.tsx` (Hero, Experience, Skills, Education, Featured Projects & Papers).
   - Build `app/routes/public/projects.tsx` and `app/routes/public/projects.$slug.tsx`.
   - Build `app/routes/public/research.tsx`.
   - Polish `app/routes/public/contact.tsx`.
6. **Route Cleanup & Verification**: Update `app/routeConfig.ts` to remove blog routes, run typechecks, and verify with dev server.
