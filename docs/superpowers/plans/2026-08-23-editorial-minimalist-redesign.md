# Editorial & Typography-First Minimalist Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the entire website into an understated, monochrome, typography-first editorial personal website inspired by [sirajchokshi.com](https://sirajchokshi.com/), eliminating decorative cards, gradients, glassmorphism, and AI-portfolio tropes.

**Architecture:** A lightweight, highly readable layout with a focused `max-w-[580px]` reading column, flush minimalist text navigation, 3-paragraph executive introduction, two-column hairline experience timeline, 9 inline skills, editorial project/research listings, longform reader case studies with monochrome Mermaid SVGs, and a clean contact form.

**Tech Stack:** Remix v2, Bun runtime, TailwindCSS (Vanilla utility classes), Framer Motion (subtle fade-ins only), React Icons / Lucide-React, gray-matter, Mermaid v11.

**Spec:** `docs/superpowers/specs/2026-08-23-editorial-minimalist-redesign.md`

## Global Constraints
- Palette strictly monochrome neutrals (`zinc-950`, `zinc-900`, `zinc-800`, `zinc-500`, `zinc-400`, `zinc-200`, `zinc-100`, `white`).
- Zero gradients, zero neon glows, zero glassmorphism blurs, and zero heavy drop shadow cards.
- Layout width strictly focused on `max-w-[580px]` (or `max-w-xl`).
- External links append `↗` arrow indicator.
- Strictly no phone number anywhere in metadata or contact sections.
- Preserve `/admin` portal accessible via a discreet footer link ("Portal").

---

### Task 1: Global Styling & Monochrome Design Tokens
**Files:**
- Modify: `app/styles/tailwind.css`

**Interfaces:**
- Consumes: Tailwind base styles and CSS custom properties.
- Produces: Clean typography base, monochrome selection colors, external link arrow rules, hairline dividers.

- [ ] **Step 1: Update `app/styles/tailwind.css` with editorial design tokens**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #ffffff;
    --text-primary: #18181b;
    --text-muted: #71717a;
    --border-color: #e4e4e7;
    --hover-bg: #f4f4f5;
  }

  .dark {
    --bg-primary: #09090b;
    --text-primary: #f4f4f5;
    --text-muted: #a1a1aa;
    --border-color: #27272a;
    --hover-bg: #18181b;
  }

  *::selection {
    background-color: #e4e4e7;
    color: #18181b;
  }

  .dark *::selection {
    background-color: #27272a;
    color: #f4f4f5;
  }

  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.75;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

a.external-link::after {
  content: " ↗";
  color: #a1a1aa;
  font-size: 0.85em;
  margin-left: 0.1em;
}
```

- [ ] **Step 2: Verify CSS with `bun run build`**
Run: `export PATH="$HOME/.bun/bin:$PATH"; bun run build`
Expected: Build passes.

- [ ] **Step 3: Commit**
```bash
git add app/styles/tailwind.css
git commit -m "style: apply monochrome typography-first global styles"
```

---

### Task 2: Minimalist Header, Layout Wrapper & Footer
**Files:**
- Modify: `app/components/Header.tsx`
- Modify: `app/components/layouts/UserLayout.tsx`
- Modify: `app/components/Footer.tsx`

**Interfaces:**
- Consumes: Theme provider from Remix root.
- Produces: Centered `max-w-[580px]` container, top nav header, minimalist footer with discreet `/admin` portal link.

- [ ] **Step 1: Update `app/components/Header.tsx`**
Implement flush unadorned header: Left side `Yahya` link, Right side links (`Projects`, `Research`, `Contact`) + Moon/Sun theme toggle button.
- [ ] **Step 2: Update `app/components/layouts/UserLayout.tsx`**
Set container to `mx-auto my-8 w-[92%] max-w-[580px] sm:my-14 space-y-12`.
- [ ] **Step 3: Update `app/components/Footer.tsx`**
Create clean text footer with "Elsewhere" links and a quiet "Portal" link routing to `/admin`.
- [ ] **Step 4: Verify with `bun run build`**
- [ ] **Step 5: Commit**
```bash
git add app/components/Header.tsx app/components/layouts/UserLayout.tsx app/components/Footer.tsx
git commit -m "feat: implement minimalist editorial header, layout wrapper, and footer"
```

---

### Task 3: Editorial Homepage Hub (`app/routes/public/_index.tsx`)
**Files:**
- Modify: `app/routes/public/_index.tsx`

**Interfaces:**
- Consumes: `getFeaturedProjects`, `getFeaturedResearch` from `~/Services/content.server`.
- Produces: Editorial introduction, two-column hairline experience timeline, 9 inline skills, education (GIET Moinabad), selected projects and research.

- [ ] **Step 1: Implement editorial introduction and sections in `_index.tsx`**
1. **Bio Paragraphs**:
   - `Cloud DevOps & Infrastructure Engineer.`
   - `Over the past 3 years, I've engineered network backbones and scaled cloud environments—transitioning from 2 years in enterprise network infrastructure to building declarative Kubernetes, Terraform, and GitOps pipelines.`
   - `Studied Engineering at Global Institute of Engineering & Technology (GIET), Moinabad. I value simple, observable, and resilient architectures.`
2. **Experience**:
   Two-column year split (`2024 — Present: Cloud DevOps Engineer`, `2022 — 2024: Network Infrastructure Engineer`) with subtle hairline separator lines and brief bullet accomplishments.
3. **Skills**:
   9 inline text badges with subtle border (`font-mono text-xs`).
4. **Selected Work & Research**:
   Editorial list items with bold inline titles, 1-line essence, and `Case Study →` links.
5. **Elsewhere**:
   Direct links to Email, GitHub, LinkedIn, X.

- [ ] **Step 2: Test rendering with Bun build**
Run: `export PATH="$HOME/.bun/bin:$PATH"; bun run build`
Expected: Passes.

- [ ] **Step 3: Commit**
```bash
git add app/routes/public/_index.tsx
git commit -m "feat: overhaul homepage with editorial typography-first layout"
```

---

### Task 4: Editorial Projects Index & Deep-Dive Case Study Reader
**Files:**
- Modify: `app/routes/public/projects.tsx`
- Modify: `app/routes/public/projects.$slug.tsx`

**Interfaces:**
- Consumes: `getAllProjects`, `getProjectBySlug` from `~/Services/content.server`.
- Produces: Editorial project listing and long-form case study article with breadcrumb navigation.

- [ ] **Step 1: Update `app/routes/public/projects.tsx`**
Replace heavy cards with clean editorial entries: Title, category pill, 1–2 sentence description, tech stack tags, and links (`Case Study →`, `GitHub ↗`, `Demo ↗`).
- [ ] **Step 2: Update `app/routes/public/projects.$slug.tsx`**
Refactor to an understated reader view: Breadcrumb `← Projects`, Case Study title, role, timeline, and `<MarkdownViewer />` rendering.
- [ ] **Step 3: Verify build**
- [ ] **Step 4: Commit**
```bash
git add app/routes/public/projects.tsx app/routes/public/projects.\$slug.tsx
git commit -m "feat: implement editorial project index and reader case study views"
```

---

### Task 5: Monochrome Theme Adaptive Mermaid & Markdown Viewers
**Files:**
- Modify: `app/components/MermaidViewer.tsx`
- Modify: `app/components/MarkdownViewer.tsx`

**Interfaces:**
- Consumes: Raw Markdown strings and Mermaid diagram syntax.
- Produces: Responsive SVG diagrams in pure monochrome linework (light/dark adaptive) and clean editorial typography prose.

- [ ] **Step 1: Configure `MermaidViewer.tsx` for monochrome theme**
Update Mermaid config `theme: "base"` with `primaryColor: "#f4f4f5"`, `primaryBorderColor: "#71717a"`, `lineColor: "#71717a"` for light mode, and dark equivalents for dark mode.
- [ ] **Step 2: Style `MarkdownViewer.tsx`**
Remove bulky card containers; format clean `h1-h4`, blockquotes with left hairline border, clean tables, and code blocks.
- [ ] **Step 3: Verify build**
- [ ] **Step 4: Commit**
```bash
git add app/components/MermaidViewer.tsx app/components/MarkdownViewer.tsx
git commit -m "feat: style mermaid and markdown viewers for monochrome editorial aesthetic"
```

---

### Task 6: Editorial Research & Contact Pages
**Files:**
- Modify: `app/routes/public/research.tsx`
- Modify: `app/routes/public/contact.tsx`

**Interfaces:**
- Consumes: `getAllResearchPapers` from `~/Services/content.server`.
- Produces: Understated research whitepapers index and clean contact form with verified channels (strictly no phone number).

- [ ] **Step 1: Update `app/routes/public/research.tsx`**
Render whitepapers with venue, year, title, abstract, tags, and PDF download links in clean editorial rows.
- [ ] **Step 2: Update `app/routes/public/contact.tsx`**
Render clean form inputs, availability status, and direct email/social links (strictly no phone number).
- [ ] **Step 3: Verify build**
- [ ] **Step 4: Commit**
```bash
git add app/routes/public/research.tsx app/routes/public/contact.tsx
git commit -m "feat: implement editorial research and contact pages"
```

---

### Task 7: Full Build & Route Verification
**Files:**
- Test all public routes and build outputs.

- [ ] **Step 1: Run production build**
Run: `export PATH="$HOME/.bun/bin:$PATH"; bun run build`
Expected: Client and SSR builds succeed with 0 errors.

- [ ] **Step 2: Verify all routes**
Run: Test `/`, `/projects`, `/projects/multi-region-cloud-gitops`, `/research`, `/contact`, `/admin`.
Expected: All public routes return HTTP 200, `/admin` returns HTTP 302.

- [ ] **Step 3: Final Commit & Progress Update**
```bash
git add .
git commit -m "chore: complete editorial minimalist redesign verification"
```
