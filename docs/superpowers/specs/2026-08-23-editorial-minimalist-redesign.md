# Design Specification: Editorial & Typography-First Minimalist Portfolio Overhaul

- **Date**: 2026-08-23
- **Inspiration**: [sirajchokshi.com](https://sirajchokshi.com/)
- **Theme**: Understated, monochrome, typography-first, fast, content-focused editorial design.

---

## 1. Objectives & Aesthetic Goals

1. **Monochrome & High Readability**:
   - Palette strictly composed of neutral shades (`zinc-950`, `zinc-900`, `zinc-800`, `zinc-700`, `zinc-500`, `zinc-400`, `zinc-200`, `zinc-100`, `white`).
   - Zero gradients, zero neon glows, zero glassmorphism blurs, and zero heavy drop shadow cards.
   - Dark/Light mode support with instant smooth CSS-variable color switching.

2. **Editorial Typographic Scale & Whitespace**:
   - Layout container: Narrow, distraction-free reading column (`max-w-[580px]` or `max-w-xl`, `mx-auto px-4 sm:px-6 py-10 sm:py-16`).
   - Generous line height (`leading-relaxed` / `leading-7`) and clean paragraph spacing.
   - Restrained font pairings: Clean modern sans-serif body with subtle monospace accents (`font-mono text-xs`) for metadata, dates, and technical tags.
   - Subtle hover states and text-based link interactions with external arrow indicators (`↗`).

3. **Content Structure & Information Hierarchy**:
   - **Header**: Minimalist inline horizontal header with site title (`Yahya`), compact navigation links (`Projects`, `Research`, `Contact`), and a subtle theme toggle.
   - **Hero Introduction**: Thoughtful, casual yet passionate 3-paragraph introduction detailing 3 years of experience (2y Network Infrastructure → 1y Cloud DevOps/SRE), GIET Moinabad education, and engineering focus.
   - **Experience Timeline**: Two-column year/role layout with hairline separator lines.
   - **Skills**: Compact inline text badges (strictly 9 skills).
   - **Selected Projects & Case Studies**: Editorial layout with project summary, tags, direct links (`Case Study →`, `GitHub ↗`, `Demo ↗`), and detailed markdown case study readers with monochrome-styled SVG Mermaid diagrams.
   - **Research & Whitepapers**: Clean paper abstracts with DOI tags and PDF view/download links.
   - **Contact**: Direct communication lines (Email, GitHub, LinkedIn, X — strictly no phone number) and a clean message form.
   - **Footer**: Discreet Elsewhere social links and subtle text link to `/admin` ("Portal").

---

## 2. Component Architecture & Routes

### A. Layout & Global Styling
- `app/styles/tailwind.css`: Monochrome theme tokens, clean focus rings, selection styling, and typography defaults.
- `app/components/Header.tsx`: Minimalist top bar with title, breadcrumb support on subpages, text nav links, and theme toggle.
- `app/components/Footer.tsx`: Minimal text footer with social links, copyright, and subtle `/admin` trigger.
- `app/components/layouts/UserLayout.tsx`: Standardized `max-w-[580px]` container.

### B. Pages
- `app/routes/public/_index.tsx`: Main editorial hub (Intro, Experience, 9 Skills, Education, Selected Projects, Selected Research, Elsewhere).
- `app/routes/public/projects.tsx`: Complete case studies list with category pills and clean summary cards.
- `app/routes/public/projects.$slug.tsx`: Longform case study reader with breadcrumbs, metadata, live links, markdown body, and theme-matched Mermaid diagrams.
- `app/routes/public/research.tsx`: Research papers index with abstracts and PDF links.
- `app/routes/public/contact.tsx`: Minimalist message form and verified reach-out channels.

### C. Diagram & Markdown Viewers
- `app/components/MermaidViewer.tsx`: Render SVG diagrams with neutral monochrome theme colors (light/dark adaptive).
- `app/components/MarkdownViewer.tsx`: Editorial typography styling for markdown content, headers, blockquotes, and code blocks.

---

## 3. Verification Plan

1. **Build Verification**: `bun run build` must compile client and SSR bundles with 0 errors.
2. **Visual & Responsive Testing**: Test on both light and dark mode across desktop (`>1024px`), tablet (`768px`), and mobile (`<640px`).
3. **Route Navigation Testing**: Verify HTTP 200 on `/`, `/projects`, `/projects/:slug`, `/research`, `/contact`, and 302 on `/admin`.
