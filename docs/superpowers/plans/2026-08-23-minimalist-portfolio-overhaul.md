# Minimalist Portfolio Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Yahya On Cloud personal website from a blog platform into a modern, minimalist portfolio website powered by Bun, featuring end-to-end Markdown + Mermaid project case studies, a research paper section, a streamlined experience timeline (2y Network Infra → 1y Cloud DevOps), inline skills (≤ 9), education (GIET, Moinabad), floating transparent navbar, and an indirect footer link to the Admin portal.

**Architecture:** Remix Vite application running on Bun with server-side parsed Markdown + frontmatter content loaders (`content/projects/`, `content/research/`) and client-side theme-aware Mermaid diagram rendering. The layout is standardized across all public pages in a consistent `max-w-3xl` container.

**Tech Stack:** Remix v2, React 18, Bun, Tailwind CSS, Shadcn UI / Radix UI, Framer Motion, Gray-Matter, React-Markdown, Remark-GFM, Mermaid.

**Spec:** [`docs/superpowers/specs/2026-08-23-minimalist-portfolio-overhaul-design.md`](file:///run/media/tp24/SHARED/Projects/Portfolio/yahyaoncloud-1/docs/superpowers/specs/2026-08-23-minimalist-portfolio-overhaul-design.md)

## Global Constraints
- Branch: `minimalist`
- Package Manager & Runtime: Bun (`~/.bun/bin/bun`)
- Public Routes: `/`, `/projects`, `/projects/:slug`, `/research`, `/contact`, `/resume`
- Removed Routes: `/blog`, `/blog/posts`, `/blog/post/:slug`
- Preserved Routes: `/admin/*`, `/auth/*`, `/login`, `/api/*`
- Contact details: Strictly NO phone numbers.
- Skills count: Strictly ≤ 9 inline skills.
- Experience: Exactly 3 years total (2 years Network Infrastructure Engineer → 1 year Cloud DevOps Engineer).
- Education: GIET, Moinabad.
- Navbar: Floating, transparent/blur background, pill-shaped.
- Footer: Includes indirect subtle button to `/admin`.

---

### Task 1: Tooling & Runtime Transition to Bun

**Files:**
- Modify: `package.json`
- Output: `bun.lock` / `bun.lockb`

**Interfaces:**
- Consumes: System bun binary at `~/.bun/bin/bun`
- Produces: Installed dependencies with `mermaid` added and Bun lockfile generated

- [ ] **Step 1: Add mermaid dependency and verify package scripts**
Add `mermaid: "^11.4.0"` to dependencies in `package.json`.

- [ ] **Step 2: Run bun install**
Run: `export PATH="$HOME/.bun/bin:$PATH"; bun install`
Expected: Dependencies installed and lockfile created/updated.

- [ ] **Step 3: Test bun build dry-run**
Run: `export PATH="$HOME/.bun/bin:$PATH"; bun run build`
Expected: Remix build executes cleanly.

- [ ] **Step 4: Commit**
```bash
git add package.json bun.lock* package-lock.json
git commit -m "chore: migrate package management and tooling to bun and add mermaid"
```

---

### Task 2: Content Storage & Server-Side Content Loader

**Files:**
- Create: `content/projects/multi-region-cloud-gitops.md`
- Create: `content/projects/hybrid-sdn-infrastructure.md`
- Create: `content/projects/observability-mesh-telemetry.md`
- Create: `content/research/zero-trust-hybrid-multicloud.md`
- Create: `content/research/ebpf-cloud-traffic-engineering.md`
- Create: `app/Services/content.server.ts`

**Interfaces:**
- Consumes: Node/Bun `fs`, `path`, and `gray-matter`
- Produces: `ProjectCaseStudy` and `ResearchPaper` TypeScript interfaces and loader functions (`getAllProjects`, `getProjectBySlug`, `getAllResearchPapers`, `getFeaturedProjects`, `getFeaturedResearch`)

- [ ] **Step 1: Create rich Markdown project case study files**
Write realistic, deep-dive Markdown case study files in `content/projects/` containing YAML frontmatter and Mermaid architecture diagrams (`graph TD` / `sequenceDiagram`), problem statements, infrastructure-as-code patterns, and quantifiable results.

- [ ] **Step 2: Create Markdown research paper files**
Write research paper files in `content/research/` containing YAML frontmatter (authors, venue, year, abstract, doi, tags, pdfUrl) and summary findings.

- [ ] **Step 3: Implement content.server.ts**
Write `app/Services/content.server.ts` with error handling, sorting by `order` and `date`, and frontmatter parsing.

- [ ] **Step 4: Verify content server functions**
Run a test script via `bun -e "import { getAllProjects } from './app/Services/content.server'; getAllProjects().then(console.log);"` to confirm all files parse properly.

- [ ] **Step 5: Commit**
```bash
git add content/ app/Services/content.server.ts
git commit -m "feat: add markdown content store and server-side content loader"
```

---

### Task 3: Interactive Mermaid & Markdown Viewers

**Files:**
- Create: `app/components/MermaidViewer.tsx`
- Create: `app/components/MarkdownViewer.tsx`

**Interfaces:**
- Consumes: `react-markdown`, `remark-gfm`, `mermaid`, `useTheme`
- Produces: `<MermaidViewer chart={code} />` and `<MarkdownViewer content={markdownString} />`

- [ ] **Step 1: Implement MermaidViewer.tsx**
Create a client-safe Mermaid renderer component that handles hydration gracefully, dynamically re-renders when light/dark theme changes, and outputs crisp scalable SVG diagrams.

- [ ] **Step 2: Implement MarkdownViewer.tsx**
Create `app/components/MarkdownViewer.tsx` using `react-markdown` and `remark-gfm`, mapping code blocks with language `mermaid` to `<MermaidViewer />`, styling typography, blockquotes, inline code, and lists matching the minimalist aesthetic.

- [ ] **Step 3: Verify component syntax and imports**
Run `export PATH="$HOME/.bun/bin:$PATH"; bun run typecheck` to ensure no TypeScript or JSX compilation errors.

- [ ] **Step 4: Commit**
```bash
git add app/components/MermaidViewer.tsx app/components/MarkdownViewer.tsx
git commit -m "feat: implement theme-aware MermaidViewer and MarkdownViewer components"
```

---

### Task 4: Floating Navbar, Minimalist Layout Wrapper & Footer

**Files:**
- Modify: `app/components/Header.tsx`
- Modify: `app/components/Footer.tsx`
- Modify: `app/components/layouts/UserLayout.tsx`
- Modify: `app/routes/public/layout.tsx`

**Interfaces:**
- Consumes: `useTheme`, `Link`, `useLocation`
- Produces: Responsive floating pill navbar, unified `max-w-3xl` container, and subtle footer with indirect `/admin` button

- [ ] **Step 1: Overhaul Header.tsx into a floating transparent navbar**
Implement a floating pill navbar centered at `top-4`, with links to `Home` (`/`), `Projects` (`/projects`), `Research` (`/research`), `Contact` (`/contact`), and the theme switcher button. Remove legacy heavy menus and unnecessary banners.

- [ ] **Step 2: Overhaul Footer.tsx**
Implement a clean minimalist footer with social links, copyright, and a discreet link button to `/admin` ("Portal") in the footer bottom bar.

- [ ] **Step 3: Standardize UserLayout.tsx and public layout.tsx**
Ensure `UserLayout.tsx` wraps all children in a consistent `max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16` structure, removing blog-specific sidebars or heavy full-screen image backdrops that clutter the UI.

- [ ] **Step 4: Verify layout responsiveness and typechecking**
Run `export PATH="$HOME/.bun/bin:$PATH"; bun run typecheck`.

- [ ] **Step 5: Commit**
```bash
git add app/components/Header.tsx app/components/Footer.tsx app/components/layouts/UserLayout.tsx app/routes/public/layout.tsx
git commit -m "feat: implement floating transparent navbar, unified layout wrapper, and subtle admin footer trigger"
```

---

### Task 5: Route Configuration & Blog Subsystem Removal

**Files:**
- Modify: `app/routeConfig.ts`
- Delete: `app/routes/public/blog.tsx`
- Delete: `app/routes/public/blog_.post.$slug.tsx`
- Delete: `app/routes/public/blog_.posts.tsx`
- Delete: `app/routes/public/guestbook_.twitter-info.tsx` (if obsolete)

**Interfaces:**
- Consumes: Remix `defineRoutes`
- Produces: Updated public route mapping (`/`, `/projects`, `/projects/:slug`, `/research`, `/contact`, `/resume`) and preserved `/admin/*` routes.

- [ ] **Step 1: Update app/routeConfig.ts**
Remove all public blog routes (`blog`, `blog/posts`, `blog/post/:slug`). Add `projects`, `projects/:slug`, and `research`. Retain `/admin/*`, `/auth/*`, `/login`, `/api/*`, and `/resume`.

- [ ] **Step 2: Remove legacy blog route files from filesystem**
Delete `app/routes/public/blog.tsx`, `app/routes/public/blog_.post.$slug.tsx`, and `app/routes/public/blog_.posts.tsx`.

- [ ] **Step 3: Verify route configuration**
Run `export PATH="$HOME/.bun/bin:$PATH"; bun run build` to confirm routes resolve cleanly.

- [ ] **Step 4: Commit**
```bash
git add app/routeConfig.ts
git rm app/routes/public/blog*.tsx
git commit -m "refactor: remove public blog routes and update route configuration for projects and research"
```

---

### Task 6: Homepage Overhaul (`app/routes/public/_index.tsx`)

**Files:**
- Modify: `app/routes/public/_index.tsx`

**Interfaces:**
- Consumes: `getFeaturedProjects`, `getFeaturedResearch` from `app/Services/content.server.ts`
- Produces: Complete minimalist portfolio homepage view

- [ ] **Step 1: Write loader in app/routes/public/_index.tsx**
Fetch featured projects and research papers server-side via `content.server.ts`.

- [ ] **Step 2: Implement Hero & Profile section**
Profile image (`app/assets/yahya.png`), name ("Yahya"), title ("Cloud DevOps & Infrastructure Engineer"), casual yet passionate bio (framework mode reflecting genuine engineering experience), location, and quick contact badges (Email, GitHub, LinkedIn, X — **strictly no phone**).

- [ ] **Step 3: Implement Experience section (3 Years)**
- **Cloud DevOps Engineer** (1 Year): Automated Kubernetes clusters, GitOps pipelines with ArgoCD/GitHub Actions, Terraform IaC, AWS cloud infrastructure.
- **Network Infrastructure Engineer** (2 Years): Enterprise routing & switching (BGP, OSPF), hybrid cloud direct connects/VPNs, SDN, network monitoring.

- [ ] **Step 4: Implement Inline Skills section (≤ 9 skills)**
Exactly 9 inline badges: `AWS`, `Kubernetes`, `Terraform`, `Docker`, `CI/CD (GitHub Actions)`, `Linux & Networking`, `Python/Bash`, `System Architecture`, `Remix / TypeScript`.

- [ ] **Step 5: Implement Education section**
GIET (Global Institute of Engineering & Technology), Moinabad.

- [ ] **Step 6: Implement Featured Project Studies and Research Paper highlights**
Interactive cards with tags, descriptions, and direct links to `/projects/:slug` and `/research`.

- [ ] **Step 7: Verify homepage compilation**
Run `export PATH="$HOME/.bun/bin:$PATH"; bun run typecheck`.

- [ ] **Step 8: Commit**
```bash
git add app/routes/public/_index.tsx
git commit -m "feat: complete minimalist portfolio homepage with profile, experience, skills, education, and featured work"
```

---

### Task 7: Project Case Studies Pages (`/projects` and `/projects/:slug`)

**Files:**
- Create: `app/routes/public/projects.tsx`
- Create: `app/routes/public/projects.$slug.tsx`

**Interfaces:**
- Consumes: `getAllProjects`, `getProjectBySlug` from `content.server.ts`, `<MarkdownViewer />`
- Produces: Project studies index and interactive deep-dive article page

- [ ] **Step 1: Implement app/routes/public/projects.tsx**
Grid listing of all project case studies with tech stack badges, duration, demo links, GitHub links, and links to full case studies.

- [ ] **Step 2: Implement app/routes/public/projects.$slug.tsx**
Detailed project article view with breadcrumb navigation, metadata header, tech stack badges, live demo / GitHub action buttons, and complete `MarkdownViewer` article rendering Mermaid architecture diagrams and key metrics.

- [ ] **Step 3: Verify project pages and slug handling**
Run `export PATH="$HOME/.bun/bin:$PATH"; bun run build`.

- [ ] **Step 4: Commit**
```bash
git add app/routes/public/projects.tsx app/routes/public/projects.\$slug.tsx
git commit -m "feat: implement project case studies gallery and deep-dive article route with mermaid diagrams"
```

---

### Task 8: Research Papers Page (`/research`)

**Files:**
- Create: `app/routes/public/research.tsx`

**Interfaces:**
- Consumes: `getAllResearchPapers` from `content.server.ts`
- Produces: Research paper showcase page

- [ ] **Step 1: Implement app/routes/public/research.tsx**
Display list of research papers and technical whitepapers with title, authors, venue, year, tags, expandable abstract, DOI links, and direct PDF view/download links.

- [ ] **Step 2: Verify research page compilation**
Run `export PATH="$HOME/.bun/bin:$PATH"; bun run typecheck`.

- [ ] **Step 3: Commit**
```bash
git add app/routes/public/research.tsx
git commit -m "feat: implement research papers showcase page"
```

---

### Task 9: Polish Contact Page & End-to-End Verification

**Files:**
- Modify: `app/routes/public/contact.tsx`

**Interfaces:**
- Consumes: Shadcn UI elements and mail/social links
- Produces: Streamlined contact page

- [ ] **Step 1: Refactor app/routes/public/contact.tsx**
Align with the minimalist design system: clean inputs, direct contact links (Email, LinkedIn, GitHub, X; **no phone number**), and responsive message submission.

- [ ] **Step 2: Run full build and test dev server**
Run: `export PATH="$HOME/.bun/bin:$PATH"; bun run build`
Start dev server and test all routes (`/`, `/projects`, `/projects/multi-region-cloud-gitops`, `/research`, `/contact`, `/admin`) to verify zero errors, fast load, and responsive layout.

- [ ] **Step 3: Commit**
```bash
git add app/routes/public/contact.tsx
git commit -m "feat: polish contact page and verify end-to-end portfolio functionality"
```
