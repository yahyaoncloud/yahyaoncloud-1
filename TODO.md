# YahyaOnCloud Admin Portal & Fullstack Web Application — Master Roadmap

> **Architecture Overview**: Pure modular fullstack React Router / Remix application for Yahya's personal portfolio, engineering case studies, research showcase, and deep blog integration. Single-owner architecture powered by MongoDB (Prisma), Supabase Object Storage (for structured blog files & assets), Firebase RTDB for real-time guestbook entries with SSO, and a minimalist, zero-bloat dependency footprint following domain-driven design principles.

---

## Strategic Pillars & Architectural Principles

1. **Pure Fullstack React Router / Remix**: Lean, modular, domain-based directory organization (feature slices: `blog`, `projects`, `research`, `guestbook`, `profile`, `admin`, `auth`).
2. **Single-Owner Model**: Cleanly eliminate multi-author system and Author portal; all portfolio and blog content belongs directly to Yahya.
3. **Minimalist & Zero Bloat**: Purge redundant packages, extraneous UI libraries, unused authentication layers, and legacy dependencies.
4. **Structured Object Storage**: Supabase storage bucket hierarchy for blog markdown, frontmatter, and media assets (`blogs/<slug>/...`).
5. **Real-time Guestbook with SSO**: Lightweight Firebase Realtime Database (RTDB) sync for guestbook comments with Google/GitHub SSO login and a 30-day retention cleanup policy.
6. **Privacy & Transparency**: Compact Privacy Policy page and footer modal disclosing 30-day data retention, analytics, and cookie practices.
7. **Clean Software Engineering**: Strict separation of concerns (loaders/actions -> domain services -> storage/database layer), strong TypeScript contracts, and unified design tokens.

---

## Roadmap Phases Summary

- [x] **Phase 1**: Dependency Audit, Minimalization & Domain-Based Modular Restructuring (TypeScript strict type safety achieved: 0 errors)
- [x] **Phase 2**: Single-Owner Consolidation & Navigation Alignment (Author management eliminated, unified under Yahya)
- [ ] **Phase 3**: Supabase Object Storage Pipeline for Structured Blog & Asset Serving
- [ ] **Phase 4**: Engineering Content Management (Posts, Projects, Research, Featured Spotlight, Taxonomies)
- [ ] **Phase 5**: Firebase RTDB Guestbook with SSO & 30-Day Retention Policy
- [ ] **Phase 6**: Site & Profile Management (About, Linktree, Resumes, Media)
- [ ] **Phase 7**: Communication, Privacy Policy & Global Site Settings
- [ ] **Phase 8**: Dashboard Analytics, UI Theme Standardization & End-to-End Verification

---

## Domain 1: Modular Architecture, Code Refactoring & Project Minimalization

*Goal: Transform into a lean, modular, domain-driven React Router architecture while stripping out bloatware and unnecessary libraries.*

- [ ] **1.1 Dependency Audit & Bloat Removal**
  - [ ] Audit `package.json` and remove redundant/conflicting libraries (e.g. consolidate toast libraries to one, remove unused auth wrappers or legacy UI packages).
  - [ ] Clean up unused config files, dead scripts, and orphaned utility files.
- [ ] **1.2 Domain-Driven Directory Restructuring (Feature Slices)**
  - [ ] Reorganize server code into clean domain modules under `app/modules/` or `app/Services/<domain>/`:
    - `modules/blog`: Blog service, Supabase storage adapter, post parser, markdown utilities.
    - `modules/projects`: Case studies, tech stack models, GitHub integration.
    - `modules/research`: Academic papers, DOI helpers, PDF upload handlers.
    - `modules/guestbook`: Firebase RTDB connector, SSO signer validation, 30-day retention pruner.
    - `modules/profile`: About bio, timeline, skills, Linktree, business card generator.
    - `modules/admin`: Auth guards, dashboard metrics, global settings.
  - [ ] Enforce clean boundaries: Route loaders/actions call domain services; domain services interact with Prisma/Supabase/Firebase.
- [ ] **1.3 Web & Software Development Principles Alignment**
  - [ ] Apply **SOLID** & **DRY**: Shared validation schemas, typed API responses, reusable table/modal primitives.
  - [ ] **Type Safety**: Eliminate `any` types in loaders and action handlers; define strict Zod/TypeScript domain contracts.
  - [ ] **Performance**: Server-side caching headers, minimal bundle size, dynamic imports for heavy client libraries (like QR/PDF).

---

## Domain 2: Core Architecture & Single-Owner Consolidation

*Goal: Remove multi-author complexity and unify all capabilities under Yahya as the sole owner and administrator.*

- [ ] **2.1 Route & File Cleanup**
  - [ ] Remove author portal directory (`app/routes/authors/`) and legacy author route entries in `app/routeConfig.ts`.
  - [ ] Remove `app/routes/admin/authors.tsx` and `app/routes/admin/authors.$id.tsx`.
  - [ ] Remove unused `app/routes/admin/users.tsx` or streamline into single admin account management.
  - [ ] Remove author authentication middleware (`author-auth.server.ts`) and unify under `admin-auth.server.ts`.
- [ ] **2.2 Direct Ownership Binding**
  - [ ] Ensure all blog posts, case studies, and research papers default directly to Yahya (no author selection required during creation/editing).
  - [ ] Update Prisma queries and content seeders to reflect single-owner model.
- [ ] **2.3 Sidebar & Header Navigation Alignment**
  - [ ] Update `app/components/Sidebar.tsx` navigation tree:
    - **Dashboard**: `/admin/dashboard`
    - **Engineering Content**: Projects (`/admin/projects`), Research (`/admin/research`), Blog Articles (`/admin/posts`), Featured Showcase (`/admin/featured-articles`), Taxonomies (Categories `/admin/categories`, Tags `/admin/tags`).
    - **Site & Bio**: About Page (`/admin/about`), Homepage Cards (`/admin/homepage-cards`), Linktree (`/admin/linktree`), Resumes (`/admin/resumes`), Business Card QR (`/admin/business-card`), Media Library (`/admin/media`).
    - **Communication**: Messages (`/admin/messages`), Guestbook (`/admin/guestbook`).
    - **Settings**: My Account (`/admin/settings`), Site Settings (`/admin/site-settings`).
  - [ ] Fix broken / mismatched links (e.g. `/admin/resume/qr` -> `/admin/business-card`).

---

## Domain 3: Supabase Object Storage & Structured Blog Pipeline

*Goal: Reliable, high-performance object storage for markdown files, frontmatter, images, and documents.*

- [ ] **3.1 Supabase Storage Architecture & Buckets**
  - [ ] Ensure automatic initialization for buckets: `blog-content`, `portfolio-assets`, `resumes`.
  - [ ] Define folder schema:
    ```text
    supabase-storage/
    ├── blogs/
    │   └── <slug>/
    │       ├── post.md          # Structured Markdown / MDX + YAML Frontmatter
    │       ├── cover.webp       # Primary cover image
    │       └── media/           # Embedded screenshots, charts, assets
    ├── projects/
    │   └── <slug>/...           # Project case study media & assets
    ├── research/
    │   └── <slug>/<paper>.pdf   # Research paper PDFs & slides
    └── resumes/
        └── <filename>.pdf       # Master and tailored CV versions
    ```
- [ ] **3.2 Storage Helper Services (`app/Services/supabase-storage.server.ts`)**
  - [ ] Implement `saveBlogPostToSupabase(slug, markdownContent, frontmatter, coverFile?)`.
  - [ ] Implement `getBlogPostFromSupabase(slug)` with fallback to MongoDB / local cache.
  - [ ] Implement `uploadBlogMedia(slug, file)` returning CDN public URL.
  - [ ] Implement `deleteBlogPostFromSupabase(slug)` for complete cascading cleanup.
  - [ ] Implement `syncAllLocalMarkdownToSupabase()` migration/sync utility.
- [ ] **3.3 Public Serving & Cache Layer**
  - [ ] Fast memory/HTTP caching for rendered markdown fetched from Supabase.
  - [ ] Ensure markdown frontmatter metadata stays synchronized with MongoDB indices for instant search & filtering.

---

## Domain 4: Engineering Content Management

*Goal: Frictionless authoring, rich markdown preview, taxonomy management, and featured content curation.*

- [ ] **4.1 Blog Posts Management (`/admin/posts`, `/admin/post/create`, `/admin/post/edit/$slug`)**
  - [ ] Clean Data Table with search, status filters (Draft, Published, Archived), and pagination.
  - [ ] Markdown editor with real-time split-screen preview, syntax highlighting, and Mermaid diagram support.
  - [ ] Direct drag-and-drop image upload to Supabase storage with automatic markdown link insertion `![alt](url)`.
  - [ ] Auto-calculation of reading time (minuteRead), word count, and SEO slug generator.
  - [ ] Category & Tag multi-select pills with inline quick-add.
  - [ ] Direct import/upload of existing `.md` / `.mdx` files with auto-parsing of frontmatter.
- [ ] **4.2 Featured Articles & Showcase Curation (`/admin/featured-articles`)**
  - [ ] Implement `/admin/featured-articles.tsx`.
  - [ ] Curate and reorder hero spotlights and featured stories for the homepage & blog index.
  - [ ] Multi-content tab: Featured Blog Posts, Featured Case Studies, Featured Research Papers.
  - [ ] Toggle active featured status with immediate live preview card.
- [ ] **4.3 Projects / Case Studies (`/admin/projects`, `create`, `edit/$slug`)**
  - [ ] Full CRUD for project case studies with tech stack tag selector.
  - [ ] Live demo and GitHub repository link managers.
  - [ ] Drag/numeric order priority for portfolio grid display.
- [ ] **4.4 Research Papers (`/admin/research`, `create`, `edit/$slug`)**
  - [ ] Full CRUD for research publications (Venue, DOI, Year, Authors list, Abstract).
  - [ ] Direct PDF upload to Supabase storage with public download link.
- [ ] **4.5 Categories & Tags (`/admin/categories`, `/admin/tags`)**
  - [ ] Real-time CRUD with AdminDataTable, slug validation, and post count badge counters.

---

## Domain 5: Firebase RTDB Guestbook with SSO & Retention Policy

*Goal: Lightweight, real-time community messages with Google/GitHub SSO authentication and automatic 30-day lifecycle.*

- [ ] **5.1 Public Guestbook Experience (`/guestbook`)**
  - [ ] Beautiful, minimalist public guestbook UI matching the dark/light portfolio aesthetic.
  - [ ] 1-Click Social Sign-in (Google & GitHub SSO) via Firebase Auth for visitors to leave messages.
  - [ ] Real-time message streaming from Firebase Realtime Database (RTDB) with optimistic UI updates.
  - [ ] Anti-spam rate limiting (max 1 message per user per hour).
- [ ] **5.2 Firebase RTDB Connectivity & Architecture**
  - [ ] Configure minimal Firebase Realtime Database connection under `app/utils/firebase-rtdb.server.ts`.
  - [ ] Schema:
    ```json
    {
      "guestbook": {
        "<messageId>": {
          "uid": "user_sso_id",
          "name": "Jane Doe",
          "avatar": "https://...",
          "provider": "github",
          "message": "Awesome work on the research papers!",
          "createdAt": 1740000000000,
          "approved": true
        }
      }
    }
    ```
- [ ] **5.3 30-Day Retention Policy & Auto-Pruning**
  - [ ] Implement automatic 30-day expiration cleanup worker/hook for RTDB messages older than `Date.now() - 30 * 24 * 60 * 60 * 1000`.
  - [ ] Inform visitors in the UI that guestbook messages and transient analytics are retained for 30 days.
- [ ] **5.4 Admin Guestbook Moderation (`/admin/guestbook`)**
  - [ ] View real-time message stream with approve / hide / delete controls.
  - [ ] One-click moderation with instant toast feedback.

---

## Domain 6: Site & Profile Content Management

*Goal: Dynamic customization of bio, resume versions, digital business card, linktree, and media assets.*

- [ ] **6.1 About & Profile Editor (`/admin/about`)**
  - [ ] Interactive timeline manager for Work Experience and Education.
  - [ ] Bio paragraphs editor with rich formatting.
  - [ ] Skills matrix manager (Languages, Cloud, DevOps, Frameworks, Architecture).
  - [ ] Certifications manager with verification link validation.
  - [ ] Social links manager (GitHub, LinkedIn, Twitter/X, Email, YouTube, Substack).
- [ ] **6.2 Linktree & Bio Page (`/admin/linktree`)**
  - [ ] Custom link creator with icon selector, analytics click tracking, and drag-to-reorder.
  - [ ] Theme switcher (Minimal Dark, Glassmorphism, Cyberpunk, Velvet).
  - [ ] Dynamic shortlink generator (`/me/:shortCode`).
- [ ] **6.3 Digital Business Card & QR Generator (`/admin/business-card`)**
  - [ ] 3.5" x 2" print-ready interactive flip card with high-resolution QR export.
  - [ ] Configurable QR destinations (Linktree, Resume, Contact VCard).
  - [ ] Downloadable SVG/PNG QR codes for networking.
- [ ] **6.4 Resume & CV Management (`/admin/resumes`)**
  - [ ] Upload and manage multiple PDF CV versions directly in Supabase Storage.
  - [ ] Set primary/active resume for public `/resume` and `/resources/download/resume/:id` endpoints.
  - [ ] Download counter and analytics.
- [ ] **6.5 Media Library & PDF Assets (`/admin/media`, `/admin/assets`)**
  - [ ] Grid/List file browser for all assets stored in Supabase.
  - [ ] Direct drag-and-drop batch uploader.
  - [ ] One-click "Copy CDN URL", file size display, and deletion confirmation.

---

## Domain 7: Privacy Policy, Communication & Global Configuration

*Goal: Legal transparency with 30-day retention disclosures, contact inquiries, and persistent site settings.*

- [ ] **7.1 Privacy Policy & Footer Disclosures (`/privacy-policy`)**
  - [ ] Clean, transparent Privacy Policy page explaining:
    - 30-day retention period for guestbook messages and analytics logs.
    - SSO authentication (Google & GitHub) data usage (public name & avatar only, no marketing emails).
    - Local storage / cookie usage for dark mode and session auth.
  - [ ] Mini footer link & accessible quick modal on public pages.
- [ ] **7.2 Contact Inquiries (`/admin/messages`)**
  - [ ] Real-time inbox for messages submitted via `/contact`.
  - [ ] Mark as read / unread / archived toggle.
  - [ ] One-click `mailto:` reply with subject pre-filled.
  - [ ] Delete or export inquiries.
- [ ] **7.3 Global Site Settings & SEO (`/admin/site-settings`)**
  - [ ] Complete database / JSON persistence for global settings (replacing static stub).
  - [ ] Site title, tagline, default meta description, keywords.
  - [ ] Google Analytics / Measurement ID configuration.
  - [ ] Maintenance mode toggle with public route interceptor.

---

## Domain 8: Analytics, Theme Standardization & Verification

*Goal: Observability, cohesive design tokens, and rigorous automated verification.*

- [ ] **8.1 Dashboard Overview (`/admin/dashboard`)**
  - [ ] Analytics summary cards (Total Views, Unique Visitors, Top Referrers, Top Countries).
  - [ ] Top performing blog posts and case studies.
  - [ ] Recent activity stream (visits, inquiries, guestbook entries).
  - [ ] Quick shortcut actions to compose posts, upload resumes, or edit bio.
- [ ] **8.2 Admin Account & Security (`/admin/settings`)**
  - [ ] Admin profile update (Username, Email).
  - [ ] Password reset / update with secure bcrypt hashing.
  - [ ] Sidebar behavior preference (Persistent Open vs. Collapsed Compact).
- [ ] **8.3 UI Theme Standardization**
  - [ ] Consistent dark/light mode palette with zinc/indigo accents.
  - [ ] Standardize typography, card borders, modals, toast alerts (Sonner), and loading states.
  - [ ] Mobile responsive drawer for sidebar on tablets & phones.
- [ ] **8.4 Verification & Testing**
  - [ ] Run `npm run typecheck` to ensure zero TypeScript errors.
  - [ ] Run `npm run build` to ensure clean Remix server/client build.
  - [ ] End-to-end route testing across all public and admin flows.
