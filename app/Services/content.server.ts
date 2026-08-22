import fs from "fs";
import path from "path";
import matter from "gray-matter";

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
  content: string;
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
// Blog Posts
// ----------------------------------------------------

export async function getAllBlogPosts(): Promise<BlogPost[]> {
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
    return false;
  } catch (err) {
    console.error("Error deleting blog post:", err);
    return false;
  }
}

// ----------------------------------------------------
// Projects
// ----------------------------------------------------

export async function getAllProjects(): Promise<ProjectCaseStudy[]> {
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
        period: data.period || "",
        role: data.role || "",
        category: data.category || "Cloud & DevOps",
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

export async function getFeaturedProjects(limit: number = 3): Promise<ProjectCaseStudy[]> {
  const all = await getAllProjects();
  const featured = all.filter((p) => p.featured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}

export async function getProjectBySlug(slug: string): Promise<ProjectCaseStudy | null> {
  const all = await getAllProjects();
  return all.find((p) => p.slug === slug) || null;
}

export async function saveProject(project: ProjectCaseStudy): Promise<boolean> {
  try {
    ensureDirectoryExists(PROJECTS_DIR);
    const filePath = path.join(PROJECTS_DIR, `${project.slug}.md`);

    const frontMatter = {
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      period: project.period,
      role: project.role,
      category: project.category || "Cloud & DevOps",
      techStack: project.techStack || [],
      demoUrl: project.demoUrl,
      githubUrl: project.githubUrl,
      coverImage: project.coverImage,
      featured: Boolean(project.featured),
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
    const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error deleting project:", err);
    return false;
  }
}

// ----------------------------------------------------
// Research Papers
// ----------------------------------------------------

export async function getAllResearchPapers(): Promise<ResearchPaper[]> {
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

export async function getFeaturedResearch(limit: number = 2): Promise<ResearchPaper[]> {
  const all = await getAllResearchPapers();
  const featured = all.filter((p) => p.featured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}

export async function getResearchBySlug(slug: string): Promise<ResearchPaper | null> {
  const all = await getAllResearchPapers();
  return all.find((p) => p.slug === slug) || null;
}

export async function saveResearchPaper(paper: ResearchPaper): Promise<boolean> {
  try {
    ensureDirectoryExists(RESEARCH_DIR);
    const filePath = path.join(RESEARCH_DIR, `${paper.slug}.md`);

    const frontMatter = {
      title: paper.title,
      slug: paper.slug,
      authors: paper.authors || ["Yahya"],
      venue: paper.venue || "Technical Whitepaper",
      year: paper.year,
      pdfUrl: paper.pdfUrl,
      doi: paper.doi,
      tags: paper.tags || [],
      abstract: paper.abstract || "",
      featured: Boolean(paper.featured),
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
    const filePath = path.join(RESEARCH_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error deleting research paper:", err);
    return false;
  }
}
