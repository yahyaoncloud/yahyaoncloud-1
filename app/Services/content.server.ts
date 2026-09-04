import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { prisma } from "~/utils/prisma.server";

export interface BlogPost {
  title: string;
  slug: string;
  date: string;
  displayDate: string;
  summary?: string;
  tags?: string[];
  author?: string;
  featured?: boolean;
  order?: number;
  content: string;
}

export interface ProjectCaseStudy {
  title: string;
  slug: string;
  summary: string;
  period: string;
  role: string;
  category?: string;
  techStack: string[];
  demoUrl?: string;
  githubUrl?: string;
  coverImage?: string;
  featured?: boolean;
  order?: number;
  content: string;
}

export interface ResearchPaper {
  title: string;
  slug: string;
  authors: string[];
  venue: string;
  year: string;
  pdfUrl?: string;
  doi?: string;
  tags: string[];
  abstract: string;
  featured?: boolean;
  order?: number;
  content?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface SectionVisibility {
  summary?: boolean;        // Headline & intro bio
  experience?: boolean;     // Experience / career history
  elsewhere?: boolean;      // Social links & contact
  certifications?: boolean; // Certifications section
  skills?: boolean;         // Skills badges
  selectedWork?: boolean;   // Selected work / featured projects
  writing?: boolean;        // Writing / blog posts
  research?: boolean;       // Research papers
}

export interface ProfileInfoData {
  headline: string;
  bio: string[];
  experiences: Array<{
    year: string;
    present: boolean;
    company: string;
    role: string;
    description: string;
    projects?: Array<{ name: string; url: string; internal?: boolean }>;
  }>;
  skills: string[];
  certifications?: CertificationItem[];
  socialLinks: Array<{
    label: string;
    href: string;
    display: string;
    external: boolean;
  }>;
  sectionsVisibility?: SectionVisibility;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");
const RESEARCH_DIR = path.join(process.cwd(), "content", "research");

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function formatDateToDisplay(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

// ----------------------------------------------------
// In-Memory Fast Cache with Auto-Invalidation & Timeout Guard
// ----------------------------------------------------
const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 120 * 1000; // 2 minutes

function getFromMemoryCache<T>(key: string): T | null {
  const item = memoryCache.get(key);
  if (item && Date.now() < item.expiresAt) {
    return item.value as T;
  }
  return null;
}

function setToMemoryCache<T>(key: string, value: T, ttlMs = CACHE_TTL_MS): void {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function invalidateContentCache(): void {
  memoryCache.clear();
}

async function withDbTimeout<T>(promise: Promise<T>, fallback: T, timeoutMs = 2500): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutHandle = setTimeout(() => {
      resolve(fallback);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (timeoutHandle) clearTimeout(timeoutHandle);
    return result;
  } catch {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    return fallback;
  }
}

// ----------------------------------------------------
// Blog Posts (Prisma + Markdown Fallback/Sync)
// ----------------------------------------------------

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const cached = getFromMemoryCache<BlogPost[]>("all_blog_posts");
  if (cached) return cached;

  const postsMap = new Map<string, BlogPost>();

  // 1. Read local markdown files
  try {
    ensureDirectoryExists(BLOG_DIR);
    const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const filePath = path.join(BLOG_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const defaultSlug = file.replace(/\.md$/, "");
      const rawDate = data.date ? String(data.date) : "2024-01-01";
      const slug = data.slug || defaultSlug;

      postsMap.set(slug, {
        title: data.title || "Untitled Article",
        slug,
        date: rawDate,
        displayDate: data.displayDate || formatDateToDisplay(rawDate),
        summary: data.summary || "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: data.author || "@yahyaoncloud",
        featured: Boolean(data.featured),
        order: Number(data.order) || 99,
        content: content.trim(),
      });
    }
  } catch (error) {
    console.error("Error reading blog posts from disk:", error);
  }

  // 2. Read from Prisma DB with timeout guarantee
  try {
    const dbPosts = await withDbTimeout(
      prisma.post.findMany({
        where: { status: "published" },
        orderBy: { date: "desc" },
        include: { author: true, tags: true },
      }),
      []
    );

    if (dbPosts && dbPosts.length > 0) {
      for (const p of dbPosts) {
        postsMap.set(p.slug, {
          title: p.title,
          slug: p.slug,
          date: p.date.toISOString().split("T")[0],
          displayDate: formatDateToDisplay(p.date.toISOString()),
          summary: p.summary || "",
          tags: p.tags.map((t) => t.name),
          author: p.author?.authorName || "@yahyaoncloud",
          featured: p.featured,
          order: 1,
          content: p.content,
        });
      }
    }
  } catch (err) {
    console.warn("DB posts retrieval notice:", err);
  }

  const result = Array.from(postsMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  setToMemoryCache("all_blog_posts", result);
  return result;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const cacheKey = `blog_post_${slug}`;
  const cached = getFromMemoryCache<BlogPost>(cacheKey);
  if (cached) return cached;

  try {
    const p = await withDbTimeout(
      prisma.post.findUnique({
        where: { slug },
        include: { author: true, tags: true },
      }),
      null
    );

    if (p) {
      const result: BlogPost = {
        title: p.title,
        slug: p.slug,
        date: p.date.toISOString().split("T")[0],
        displayDate: formatDateToDisplay(p.date.toISOString()),
        summary: p.summary || "",
        tags: p.tags.map((t) => t.name),
        author: p.author?.authorName || "@yahyaoncloud",
        featured: p.featured,
        order: 1,
        content: p.content,
      };
      setToMemoryCache(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn("DB single post retrieval notice:", err);
  }

  // Fallback to local markdown file
  try {
    ensureDirectoryExists(BLOG_DIR);
    const filePath = path.join(BLOG_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);
      const rawDate = data.date ? String(data.date) : "2024-01-01";
      const result: BlogPost = {
        title: data.title || "Untitled Article",
        slug,
        date: rawDate,
        displayDate: data.displayDate || formatDateToDisplay(rawDate),
        summary: data.summary || "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: data.author || "@yahyaoncloud",
        featured: Boolean(data.featured),
        order: Number(data.order) || 99,
        content: content.trim(),
      };
      setToMemoryCache(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn("Local post retrieval notice:", err);
  }

  const all = await getAllBlogPosts();
  const matched = all.find((p) => p.slug === slug) || null;
  if (matched) {
    setToMemoryCache(cacheKey, matched);
  }
  return matched;
}

export async function saveBlogPost(post: BlogPost): Promise<boolean> {
  try {
    invalidateContentCache();
    ensureDirectoryExists(BLOG_DIR);
    const filePath = path.join(BLOG_DIR, `${post.slug}.md`);

    const frontMatter = {
      title: post.title,
      slug: post.slug,
      date: post.date,
      displayDate: post.displayDate || formatDateToDisplay(post.date),
      summary: post.summary || "",
      author: post.author || "@yahyaoncloud",
      tags: post.tags || [],
      featured: Boolean(post.featured),
      order: post.order ?? 99,
    };

    const fileContent = matter.stringify(post.content || "", frontMatter);
    fs.writeFileSync(filePath, fileContent, "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving blog post:", err);
    return false;
  }
}

export async function deleteBlogPost(slug: string): Promise<boolean> {
  try {
    invalidateContentCache();
    const filePath = path.join(BLOG_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (err) {
    console.error("Error deleting blog post:", err);
  }
  return false;
}

// ----------------------------------------------------
// Projects (Prisma + Markdown)
// ----------------------------------------------------

export async function getAllProjects(): Promise<ProjectCaseStudy[]> {
  const cached = getFromMemoryCache<ProjectCaseStudy[]>("all_projects");
  if (cached) return cached;

  const projectsMap = new Map<string, ProjectCaseStudy>();

  // 1. Read local markdown files
  try {
    ensureDirectoryExists(PROJECTS_DIR);
    const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const filePath = path.join(PROJECTS_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const defaultSlug = file.replace(/\.md$/, "");

      projectsMap.set(data.slug || defaultSlug, {
        title: data.title || "Untitled Project",
        slug: data.slug || defaultSlug,
        summary: data.summary || "",
        period: data.period || "2024",
        role: data.role || "Lead Cloud Engineer",
        category: data.category || "Cloud & DevOps",
        techStack: Array.isArray(data.techStack) ? data.techStack : [],
        demoUrl: data.demoUrl || undefined,
        githubUrl: data.githubUrl || undefined,
        featured: Boolean(data.featured),
        order: Number(data.order) || 99,
        content: content.trim(),
      });
    }
  } catch (error) {
    console.error("Error reading projects:", error);
  }

  // 2. Read from Prisma DB with timeout guarantee
  try {
    const dbProjects = await withDbTimeout(
      prisma.projectCaseStudy.findMany({
        orderBy: { order: "asc" },
      }),
      []
    );

    if (dbProjects && dbProjects.length > 0) {
      for (const p of dbProjects) {
        projectsMap.set(p.slug, {
          title: p.title,
          slug: p.slug,
          summary: p.summary,
          period: p.period,
          role: p.role,
          category: p.category,
          techStack: p.techStack,
          demoUrl: p.demoUrl || undefined,
          githubUrl: p.githubUrl || undefined,
          featured: p.featured,
          order: p.order,
          content: p.content,
        });
      }
    }
  } catch (err) {
    console.warn("DB projects retrieval notice:", err);
  }

  const result = Array.from(projectsMap.values()).sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99)
  );

  setToMemoryCache("all_projects", result);
  return result;
}

export async function getProjectBySlug(slug: string): Promise<ProjectCaseStudy | null> {
  const cacheKey = `project_${slug}`;
  const cached = getFromMemoryCache<ProjectCaseStudy>(cacheKey);
  if (cached) return cached;

  try {
    const p = await withDbTimeout(
      prisma.projectCaseStudy.findUnique({
        where: { slug },
      }),
      null
    );

    if (p) {
      const result: ProjectCaseStudy = {
        title: p.title,
        slug: p.slug,
        summary: p.summary,
        period: p.period,
        role: p.role,
        category: p.category,
        techStack: p.techStack,
        demoUrl: p.demoUrl || undefined,
        githubUrl: p.githubUrl || undefined,
        featured: p.featured,
        order: p.order,
        content: p.content,
      };
      setToMemoryCache(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn("DB single project retrieval notice:", err);
  }

  const all = await getAllProjects();
  const matched = all.find((p) => p.slug === slug) || null;
  if (matched) {
    setToMemoryCache(cacheKey, matched);
  }
  return matched;
}

export async function getFeaturedProjects(): Promise<ProjectCaseStudy[]> {
  const all = await getAllProjects();
  return all.filter((p) => p.featured);
}

export async function saveProject(project: ProjectCaseStudy): Promise<boolean> {
  try {
    invalidateContentCache();
    // Save to DB
    await prisma.projectCaseStudy.upsert({
      where: { slug: project.slug },
      update: {
        title: project.title,
        summary: project.summary,
        period: project.period,
        role: project.role,
        category: project.category || "Cloud & DevOps",
        techStack: project.techStack,
        demoUrl: project.demoUrl,
        githubUrl: project.githubUrl,
        featured: project.featured ?? false,
        order: project.order ?? 0,
        content: project.content,
      },
      create: {
        slug: project.slug,
        title: project.title,
        summary: project.summary,
        period: project.period,
        role: project.role,
        category: project.category || "Cloud & DevOps",
        techStack: project.techStack,
        demoUrl: project.demoUrl,
        githubUrl: project.githubUrl,
        featured: project.featured ?? false,
        order: project.order ?? 0,
        content: project.content,
      },
    }).catch((err) => console.warn("DB save project warning:", err));

    // Save to markdown
    ensureDirectoryExists(PROJECTS_DIR);
    const filePath = path.join(PROJECTS_DIR, `${project.slug}.md`);

    const frontMatter = {
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      period: project.period,
      role: project.role,
      category: project.category || "Cloud & DevOps",
      techStack: project.techStack,
      demoUrl: project.demoUrl,
      githubUrl: project.githubUrl,
      featured: project.featured,
      order: project.order ?? 99,
    };

    const fileContent = matter.stringify(project.content || "", frontMatter);
    fs.writeFileSync(filePath, fileContent, "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving project:", err);
    return false;
  }
}

export async function deleteProject(slug: string): Promise<boolean> {
  try {
    invalidateContentCache();
    await prisma.projectCaseStudy.delete({
      where: { slug },
    }).catch(() => null);

    const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (err) {
    console.error("Error deleting project:", err);
  }
  return false;
}

// ----------------------------------------------------
// Research Papers (Prisma + Markdown)
// ----------------------------------------------------

export async function getAllResearchPapers(): Promise<ResearchPaper[]> {
  const cached = getFromMemoryCache<ResearchPaper[]>("all_research");
  if (cached) return cached;

  const papersMap = new Map<string, ResearchPaper>();

  // 1. Read local markdown files
  try {
    ensureDirectoryExists(RESEARCH_DIR);
    const files = fs.readdirSync(RESEARCH_DIR).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const filePath = path.join(RESEARCH_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const defaultSlug = file.replace(/\.md$/, "");

      papersMap.set(data.slug || defaultSlug, {
        title: data.title || "Untitled Paper",
        slug: data.slug || defaultSlug,
        authors: Array.isArray(data.authors) ? data.authors : ["Yahya"],
        venue: data.venue || "Technical Whitepaper",
        year: data.year ? String(data.year) : "2024",
        pdfUrl: data.pdfUrl || undefined,
        doi: data.doi || undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        abstract: data.abstract || "",
        featured: Boolean(data.featured),
        order: Number(data.order) || 99,
        content: content.trim() || undefined,
      });
    }
  } catch (error) {
    console.error("Error reading research papers:", error);
  }

  // 2. Read from Prisma DB with timeout guarantee
  try {
    const dbPapers = await withDbTimeout(
      prisma.researchPaper.findMany({
        orderBy: { order: "asc" },
      }),
      []
    );

    if (dbPapers && dbPapers.length > 0) {
      for (const p of dbPapers) {
        papersMap.set(p.slug, {
          title: p.title,
          slug: p.slug,
          authors: p.authors,
          venue: p.venue,
          year: p.year,
          pdfUrl: p.pdfUrl || undefined,
          doi: p.doi || undefined,
          tags: p.tags,
          abstract: p.abstract,
          featured: p.featured,
          order: p.order,
          content: p.content || undefined,
        });
      }
    }
  } catch (err) {
    console.warn("DB research retrieval notice:", err);
  }

  const result = Array.from(papersMap.values()).sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99)
  );

  setToMemoryCache("all_research", result);
  return result;
}

export async function getResearchBySlug(slug: string): Promise<ResearchPaper | null> {
  const cacheKey = `research_${slug}`;
  const cached = getFromMemoryCache<ResearchPaper>(cacheKey);
  if (cached) return cached;

  try {
    const p = await withDbTimeout(
      prisma.researchPaper.findUnique({
        where: { slug },
      }),
      null
    );

    if (p) {
      const result: ResearchPaper = {
        title: p.title,
        slug: p.slug,
        authors: p.authors,
        venue: p.venue,
        year: p.year,
        pdfUrl: p.pdfUrl || undefined,
        doi: p.doi || undefined,
        tags: p.tags,
        abstract: p.abstract,
        featured: p.featured,
        order: p.order,
        content: p.content || undefined,
      };
      setToMemoryCache(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn("DB single research retrieval notice:", err);
  }

  const all = await getAllResearchPapers();
  const matched = all.find((p) => p.slug === slug) || null;
  if (matched) {
    setToMemoryCache(cacheKey, matched);
  }
  return matched;
}

export async function getFeaturedResearch(): Promise<ResearchPaper[]> {
  const all = await getAllResearchPapers();
  return all.filter((p) => p.featured);
}

export async function saveResearchPaper(paper: ResearchPaper): Promise<boolean> {
  try {
    invalidateContentCache();
    // Save to DB
    await prisma.researchPaper.upsert({
      where: { slug: paper.slug },
      update: {
        title: paper.title,
        authors: paper.authors,
        venue: paper.venue,
        year: paper.year,
        abstract: paper.abstract,
        pdfUrl: paper.pdfUrl,
        doi: paper.doi,
        tags: paper.tags,
        featured: paper.featured ?? false,
        order: paper.order ?? 0,
        content: paper.content,
      },
      create: {
        slug: paper.slug,
        title: paper.title,
        authors: paper.authors,
        venue: paper.venue,
        year: paper.year,
        abstract: paper.abstract,
        pdfUrl: paper.pdfUrl,
        doi: paper.doi,
        tags: paper.tags,
        featured: paper.featured ?? false,
        order: paper.order ?? 0,
        content: paper.content,
      },
    }).catch((err) => console.warn("DB save research warning:", err));

    // Save to markdown
    ensureDirectoryExists(RESEARCH_DIR);
    const filePath = path.join(RESEARCH_DIR, `${paper.slug}.md`);

    const frontMatter = {
      title: paper.title,
      slug: paper.slug,
      authors: paper.authors,
      venue: paper.venue,
      year: paper.year,
      pdfUrl: paper.pdfUrl,
      doi: paper.doi,
      tags: paper.tags,
      abstract: paper.abstract,
      featured: paper.featured,
      order: paper.order ?? 99,
    };

    const fileContent = matter.stringify(paper.content || "", frontMatter);
    fs.writeFileSync(filePath, fileContent, "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving research paper:", err);
    return false;
  }
}

export async function deleteResearchPaper(slug: string): Promise<boolean> {
  try {
    invalidateContentCache();
    await prisma.researchPaper.delete({
      where: { slug },
    }).catch(() => null);

    const filePath = path.join(RESEARCH_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (err) {
    console.error("Error deleting research paper:", err);
  }
  return false;
}

// ----------------------------------------------------
// Profile Info (Homepage Headline, Bio, Experience, Skills, Social Links)
// ----------------------------------------------------

export const DEFAULT_PROFILE_INFO: ProfileInfoData = {
  headline: "Cloud DevOps Engineer.",
  bio: [],
  experiences: [],
  skills: [],
  certifications: [],
  socialLinks: [],
  sectionsVisibility: {
    summary: true,
    experience: true,
    elsewhere: true,
    certifications: true,
    skills: true,
    selectedWork: true,
    writing: true,
    research: true,
  },
};

export async function getProfileInfo(): Promise<ProfileInfoData> {
  const cached = getFromMemoryCache<ProfileInfoData>("homepage_profile");
  if (cached) return cached;

  try {
    const profile = await withDbTimeout(
      prisma.profileInfo.findUnique({
        where: { key: "homepage_profile" },
      }),
      null
    );

    if (profile) {
      const dbVisibility = profile.sectionsVisibility as unknown as SectionVisibility | undefined;
      const result: ProfileInfoData = {
        headline: profile.headline || "",
        bio: profile.bio || [],
        skills: profile.skills || [],
        experiences: Array.isArray(profile.experiences) ? (profile.experiences as unknown as ProfileInfoData["experiences"]) : [],
        certifications: Array.isArray(profile.certifications) ? (profile.certifications as unknown as ProfileInfoData["certifications"]) : [],
        socialLinks: Array.isArray(profile.socialLinks)
          ? (profile.socialLinks as unknown as ProfileInfoData["socialLinks"]).filter(
              (item) => item && typeof item.href === "string" && item.href.trim().length > 0
            )
          : [],
        sectionsVisibility: {
          summary: dbVisibility?.summary !== undefined ? Boolean(dbVisibility.summary) : true,
          experience: dbVisibility?.experience !== undefined ? Boolean(dbVisibility.experience) : true,
          elsewhere: dbVisibility?.elsewhere !== undefined ? Boolean(dbVisibility.elsewhere) : true,
          certifications: dbVisibility?.certifications !== undefined ? Boolean(dbVisibility.certifications) : true,
          skills: dbVisibility?.skills !== undefined ? Boolean(dbVisibility.skills) : true,
          selectedWork: dbVisibility?.selectedWork !== undefined ? Boolean(dbVisibility.selectedWork) : true,
          writing: dbVisibility?.writing !== undefined ? Boolean(dbVisibility.writing) : true,
          research: dbVisibility?.research !== undefined ? Boolean(dbVisibility.research) : true,
        },
      };
      setToMemoryCache("homepage_profile", result);
      return result;
    }
  } catch (err) {
    console.warn("DB profile info query notice:", err);
  }

  return DEFAULT_PROFILE_INFO;
}

export async function saveProfileInfo(data: ProfileInfoData): Promise<boolean> {
  try {
    invalidateContentCache();
    const visibilityToSave = {
      summary: data.sectionsVisibility?.summary !== undefined ? Boolean(data.sectionsVisibility.summary) : true,
      experience: data.sectionsVisibility?.experience !== undefined ? Boolean(data.sectionsVisibility.experience) : true,
      elsewhere: data.sectionsVisibility?.elsewhere !== undefined ? Boolean(data.sectionsVisibility.elsewhere) : true,
      certifications: data.sectionsVisibility?.certifications !== undefined ? Boolean(data.sectionsVisibility.certifications) : true,
      skills: data.sectionsVisibility?.skills !== undefined ? Boolean(data.sectionsVisibility.skills) : true,
      selectedWork: data.sectionsVisibility?.selectedWork !== undefined ? Boolean(data.sectionsVisibility.selectedWork) : true,
      writing: data.sectionsVisibility?.writing !== undefined ? Boolean(data.sectionsVisibility.writing) : true,
      research: data.sectionsVisibility?.research !== undefined ? Boolean(data.sectionsVisibility.research) : true,
    };

    const cleanSocialLinks = Array.isArray(data.socialLinks)
      ? data.socialLinks.filter(
          (item) => item && typeof item.href === "string" && item.href.trim().length > 0
        )
      : [];

    await prisma.profileInfo.upsert({
      where: { key: "homepage_profile" },
      update: {
        headline: data.headline,
        bio: data.bio,
        skills: data.skills,
        experiences: data.experiences as unknown as object,
        certifications: data.certifications as unknown as object,
        socialLinks: cleanSocialLinks as unknown as object,
        sectionsVisibility: visibilityToSave as unknown as object,
      },
      create: {
        key: "homepage_profile",
        headline: data.headline,
        bio: data.bio,
        skills: data.skills,
        experiences: data.experiences as unknown as object,
        certifications: data.certifications as unknown as object,
        socialLinks: data.socialLinks as unknown as object,
        sectionsVisibility: visibilityToSave as unknown as object,
      },
    });
    return true;
  } catch (err) {
    console.error("Error saving profile info:", err);
    return false;
  }
}

// ----------------------------------------------------
// Contact Messages
// ----------------------------------------------------

export async function createContactMessage(data: { name: string; email: string; message: string }) {
  try {
    return await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
      },
    });
  } catch (err) {
    console.warn("DB create contact message warning:", err);
    return null;
  }
}

export async function getContactMessages() {
  try {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("DB get contact messages warning:", err);
    return [];
  }
}
