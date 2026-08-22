import fs from "fs";
import path from "path";
import matter from "gray-matter";

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
  content: string;
}

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");
const RESEARCH_DIR = path.join(process.cwd(), "content", "research");

/**
 * Get all project case studies, sorted by order or title.
 */
export async function getAllProjects(): Promise<ProjectCaseStudy[]> {
  try {
    if (!fs.existsSync(PROJECTS_DIR)) {
      return [];
    }

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
        period: data.period || "",
        role: data.role || "",
        category: data.category || "Cloud & Infrastructure",
        techStack: Array.isArray(data.techStack) ? data.techStack : [],
        demoUrl: data.demoUrl,
        githubUrl: data.githubUrl,
        coverImage: data.coverImage,
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

/**
 * Get featured projects for homepage display.
 */
export async function getFeaturedProjects(limit: number = 3): Promise<ProjectCaseStudy[]> {
  const all = await getAllProjects();
  const featured = all.filter((p) => p.featured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}

/**
 * Get a specific project case study by slug.
 */
export async function getProjectBySlug(slug: string): Promise<ProjectCaseStudy | null> {
  const all = await getAllProjects();
  return all.find((p) => p.slug === slug) || null;
}

/**
 * Get all research papers, sorted by order or year.
 */
export async function getAllResearchPapers(): Promise<ResearchPaper[]> {
  try {
    if (!fs.existsSync(RESEARCH_DIR)) {
      return [];
    }

    const files = fs.readdirSync(RESEARCH_DIR).filter((f) => f.endsWith(".md"));
    const papers: ResearchPaper[] = [];

    for (const file of files) {
      const filePath = path.join(RESEARCH_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const defaultSlug = file.replace(/\.md$/, "");

      papers.push({
        title: data.title || "Untitled Research Paper",
        slug: data.slug || defaultSlug,
        authors: Array.isArray(data.authors) ? data.authors : ["Yahya"],
        venue: data.venue || "Technical Whitepaper",
        year: String(data.year || new Date().getFullYear()),
        pdfUrl: data.pdfUrl,
        doi: data.doi,
        tags: Array.isArray(data.tags) ? data.tags : [],
        abstract: data.abstract || "",
        featured: Boolean(data.featured),
        order: Number(data.order) || 99,
        content: content.trim(),
      });
    }

    return papers.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  } catch (error) {
    console.error("Error reading research papers:", error);
    return [];
  }
}

/**
 * Get featured research papers for homepage.
 */
export async function getFeaturedResearch(limit: number = 2): Promise<ResearchPaper[]> {
  const all = await getAllResearchPapers();
  const featured = all.filter((p) => p.featured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}
