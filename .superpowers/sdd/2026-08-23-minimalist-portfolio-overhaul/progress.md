# SDD ledger — plan: docs/superpowers/plans/2026-08-23-minimalist-portfolio-overhaul.md

## Preflight Scan
| Task Pair / Task | Relationship / Check | Finding | Ruling |
|---|---|---|---|
| Task 1 & All | Runtime & Dependency Layer | Bun runtime + mermaid | Approved |
| Task 2 & Task 3 | Content Store -> Markdown/Mermaid Viewers | Shared Markdown schemas | Approved |
| Task 4 & Task 5,6,7,8 | Layout Wrapper -> Page Routes | Standard `max-w-3xl` container across all public views | Approved |
| Task 5 & Task 6,7,8 | Route Config -> Page Components | Clean removal of blog routes, additions of projects/research | Approved |

## Progress
- [x] Task 1: Tooling & Runtime Transition to Bun (commits: 22ef939)
- [x] Task 2: Content Storage & Server-Side Content Loader (commits: b211ced)
- [x] Task 3: Interactive Mermaid & Markdown Viewers (commits: d1e7192)
- [x] Task 4: Floating Navbar, Minimalist Layout Wrapper & Footer (commits: f92fdce)
- [x] Task 5: Route Configuration & Blog Subsystem Removal (commits: 60590dd)
- [x] Task 6: Homepage Overhaul (app/routes/public/_index.tsx) (commits: 86f2f97)
- [x] Task 7: Project Case Studies Pages (/projects and /projects/:slug) (commits: e8cda3d)
- [x] Task 8: Research Papers Page (/research) (commits: 1b0ba0e)
- [x] Task 9: Polish Contact Page & End-to-End Verification (commits: 15d7543, 5368ff8)

## Verification Status
- Production build: `bun run build` PASSED (client + SSR bundles built cleanly).
- Local Dev Server: `bun run dev` PASSED on port 5174.
- Route Status Checks:
  - `200 OK` -> `/`
  - `200 OK` -> `/projects`
  - `200 OK` -> `/projects/multi-region-cloud-gitops`
  - `200 OK` -> `/projects/hybrid-sdn-infrastructure`
  - `200 OK` -> `/projects/observability-mesh-telemetry`
  - `200 OK` -> `/research`
  - `200 OK` -> `/contact`
  - `302 Found` -> `/admin` (Redirect to login)
