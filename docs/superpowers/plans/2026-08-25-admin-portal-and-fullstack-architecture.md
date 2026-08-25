# Single-Owner Admin Portal & Fullstack Modular Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and complete the end-to-end single-owner admin portal and fullstack portfolio application for Yahya, featuring Supabase object storage for structured blog markdown and media, real-time Firebase RTDB guestbook with GitHub/Google SSO, 30-day retention pruning, and a minimalist modular architecture.

**Architecture:** Pure modular fullstack React Router / Remix architecture with domain slices (`modules/blog`, `modules/projects`, `modules/research`, `modules/guestbook`, `modules/profile`, `modules/admin`). Prisma MongoDB for indexed relational data, Supabase Storage for structured content/assets, and Firebase RTDB for real-time guestbook streaming.

**Tech Stack:** React 18, Remix / React Router, TypeScript, Tailwind CSS, Prisma (MongoDB), Supabase Storage JS SDK, Firebase Auth & RTDB, Framer Motion, Lucide React, Sonner.

**Spec:** [TODO.md](file:///run/media/tp24/SHARED/Projects/Portfolio/yahyaoncloud-1/TODO.md)

---

## Global Constraints

- Pure fullstack React Router / Remix modular design.
- Single-owner architecture (all content authored by Yahya; no multi-author portal).
- Supabase storage bucket hierarchy (`blogs/<slug>/post.md`, `blogs/<slug>/cover.webp`, `media/*`).
- Firebase RTDB guestbook with Google/GitHub SSO login and 30-day retention pruning.
- Minimalist dependency footprint (consolidate redundant libraries, e.g. single toast provider).

---

## Tasks & Phases

### Task 1: Project Minimalization & Dependency Audit
- **Files**:
  - Modify: `package.json`
  - Modify: `app/routeConfig.ts`
- **Actions**:
  - Consolidate toast notifications to `sonner`.
  - Prune unused legacy author routes from `app/routeConfig.ts`.
  - Remove dead dependencies from `package.json`.

### Task 2: Single-Owner Consolidation & Navigation Alignment
- **Files**:
  - Modify: `app/components/Sidebar.tsx`
  - Modify: `app/routes/admin/layout.tsx`
  - Delete/Clean: `app/routes/admin/authors.tsx`, `app/routes/admin/authors.$id.tsx`, `app/routes/admin/users.tsx`
- **Actions**:
  - Cleanly update `app/components/Sidebar.tsx` with all active domains: Dashboard, Projects, Research, Blog, Featured Showcase, Taxonomies, About, Homepage Cards, Linktree, Resumes, Business Card QR, Media, Inquiries, Guestbook, Settings.
  - Fix any route mismatches.

### Task 3: Supabase Object Storage Pipeline for Structured Blog Serving
- **Files**:
  - Create: `app/Services/supabase-storage.server.ts`
  - Modify: `app/utils/supabase.server.ts`
- **Actions**:
  - Implement bucket validation & auto-creation (`blog-content`, `portfolio-assets`, `resumes`).
  - Implement `saveBlogPostToSupabase(slug, markdown, frontmatter, coverFile)`.
  - Implement `getBlogPostFromSupabase(slug)` with fallback.
  - Implement `uploadBlogMedia(slug, file)`.
  - Implement `syncAllLocalMarkdownToSupabase()` migration script.

### Task 4: Engineering Content Management (Posts, Projects, Research, Featured Showcase, Taxonomies)
- **Files**:
  - Create: `app/routes/admin/featured-articles.tsx`
  - Modify: `app/routes/admin/posts.tsx`
  - Modify: `app/routes/admin/post.create.tsx`
  - Modify: `app/routes/admin/post.edit.$slug.tsx`
  - Modify: `app/routes/admin/projects.tsx`, `app/routes/admin/projects.create.tsx`, `app/routes/admin/projects.edit.$slug.tsx`
  - Modify: `app/routes/admin/research.tsx`, `app/routes/admin/research.create.tsx`, `app/routes/admin/research.edit.$slug.tsx`
  - Modify: `app/routes/admin/categories.tsx`, `app/routes/admin/tags.tsx`
- **Actions**:
  - Complete `/admin/featured-articles.tsx` with multi-content curation and reordering.
  - Wire blog post create/edit forms to upload to Supabase Storage with live markdown preview.
  - Ensure single-owner default for all post/project/paper creation.

### Task 5: Firebase RTDB Guestbook with SSO & 30-Day Retention
- **Files**:
  - Create: `app/utils/firebase-rtdb.server.ts`
  - Modify: `app/routes/public/guestbook.tsx`
  - Modify: `app/routes/admin/guestbook.tsx`
- **Actions**:
  - Connect Firebase Realtime Database with 1-click Google/GitHub SSO login.
  - Implement automatic 30-day message retention cleaner.
  - Wire admin moderation controls (approve, delete, reply).

### Task 6: Site & Profile Content (About, Linktree, Digital Business Card QR, Resumes, Media)
- **Files**:
  - Modify: `app/routes/admin/about.tsx`
  - Modify: `app/routes/admin/linktree.tsx`
  - Modify: `app/routes/admin/business-card.tsx`
  - Modify: `app/routes/admin/resumes.tsx`
  - Modify: `app/routes/admin/media.tsx`
- **Actions**:
  - Verify and polish full CRUD and Supabase storage uploads for resumes and media.
  - Verify interactive business card and printable 3.5"x2" layout.

### Task 7: Communication, Privacy Policy & Site Settings Persistence
- **Files**:
  - Modify: `app/routes/public/privacy-policy.tsx`
  - Modify: `app/routes/admin/messages.tsx`
  - Modify: `app/routes/admin/site-settings.tsx`
  - Modify: `app/Services/site-settings.server.ts`
- **Actions**:
  - Complete `/privacy-policy` with 30-day retention and SSO data disclosures.
  - Implement database/file persistence for `/admin/site-settings.tsx`.
  - Polish contact messages inbox with `mailto:` shortcuts.

### Task 8: Verification & Build
- **Actions**:
  - Run `npm run typecheck` to guarantee 0 TypeScript errors.
  - Run `npm run build` to verify clean production build.
