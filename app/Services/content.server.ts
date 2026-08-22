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
  socialLinks: Array<{
    label: string;
    href: string;
    display: string;
    external: boolean;
  }>;
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
// Blog Posts (Prisma + Markdown Fallback/Sync)
// ----------------------------------------------------

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    // Try Prisma DB first
    const dbPosts = await prisma.post.findMany({
      where: { status: "published" },
      orderBy: { date: "desc" },
      include: { author: true, tags: true },
    }).catch(() => []);

    if (dbPosts && dbPosts.length > 0) {
      return dbPosts.map((p) => ({
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
      }));
    }
  } catch (err) {
    console.warn("DB posts retrieval notice:", err);
  }

  // Fallback to local markdown files
  try {
    ensureDirectoryExists(BLOG_DIR);
    const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
    const posts: BlogPost[] = [];

    for (const file of files) {
      const filePath = path.join(BLOG_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const defaultSlug = file.replace(/\.md$/, "");
      const rawDate = data.date ? String(data.date) : "2024-01-01";

      posts.push({
        title: data.title || "Untitled Article",
        slug: data.slug || defaultSlug,
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

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error reading blog posts:", error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const p = await prisma.post.findUnique({
      where: { slug },
      include: { author: true, tags: true },
    }).catch(() => null);

    if (p) {
      return {
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
    }
  } catch (err) {
    console.warn("DB single post retrieval notice:", err);
  }

  const all = await getAllBlogPosts();
  return all.find((p) => p.slug === slug) || null;
}

export async function saveBlogPost(post: BlogPost): Promise<boolean> {
  try {
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
  try {
    const dbProjects = await prisma.projectCaseStudy.findMany({
      orderBy: { order: "asc" },
    }).catch(() => []);

    if (dbProjects && dbProjects.length > 0) {
      return dbProjects.map((p) => ({
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
      }));
    }
  } catch (err) {
    console.warn("DB projects retrieval notice:", err);
  }

  try {
    ensureDirectoryExists(PROJECTS_DIR);
    const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".md"));
    const projects: ProjectCaseStudy[] = [];

    for (const file of files) {
      const filePath = path.join(PROJECTS_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const defaultSlug = file.replace(/\.md$/, "");

      projects.push({
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

    return projects.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  } catch (error) {
    console.error("Error reading projects:", error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<ProjectCaseStudy | null> {
  try {
    const p = await prisma.projectCaseStudy.findUnique({
      where: { slug },
    }).catch(() => null);

    if (p) {
      return {
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
    }
  } catch (err) {
    console.warn("DB single project retrieval notice:", err);
  }

  const all = await getAllProjects();
  return all.find((p) => p.slug === slug) || null;
}

export async function getFeaturedProjects(): Promise<ProjectCaseStudy[]> {
  const all = await getAllProjects();
  return all.filter((p) => p.featured);
}

export async function saveProject(project: ProjectCaseStudy): Promise<boolean> {
  try {
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
  try {
    const dbPapers = await prisma.researchPaper.findMany({
      orderBy: { order: "asc" },
    }).catch(() => []);

    if (dbPapers && dbPapers.length > 0) {
      return dbPapers.map((p) => ({
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
      }));
    }
  } catch (err) {
    console.warn("DB research retrieval notice:", err);
  }

  try {
    ensureDirectoryExists(RESEARCH_DIR);
    const files = fs.readdirSync(RESEARCH_DIR).filter((f) => f.endsWith(".md"));
    const papers: ResearchPaper[] = [];

    for (const file of files) {
      const filePath = path.join(RESEARCH_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const defaultSlug = file.replace(/\.md$/, "");

      papers.push({
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

    return papers.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  } catch (error) {
    console.error("Error reading research papers:", error);
    return [];
  }
}

export async function getResearchBySlug(slug: string): Promise<ResearchPaper | null> {
  try {
    const p = await prisma.researchPaper.findUnique({
      where: { slug },
    }).catch(() => null);

    if (p) {
      return {
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
    }
  } catch (err) {
    console.warn("DB single research retrieval notice:", err);
  }

  const all = await getAllResearchPapers();
  return all.find((p) => p.slug === slug) || null;
}

export async function getFeaturedResearch(): Promise<ResearchPaper[]> {
  const all = await getAllResearchPapers();
  return all.filter((p) => p.featured);
}

export async function saveResearchPaper(paper: ResearchPaper): Promise<boolean> {
  try {
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
