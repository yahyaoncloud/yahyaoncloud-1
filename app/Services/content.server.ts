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
  summary?: boolean;        // Mandatory: Always true
  experience?: boolean;     // Mandatory: Always true
  elsewhere?: boolean;      // Mandatory: Always true
  certifications?: boolean; // Toggleable
  skills?: boolean;         // Toggleable
  selectedWork?: boolean;   // Toggleable
  writing?: boolean;        // Toggleable
  research?: boolean;       // Toggleable
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
// Blog Posts (Prisma + Markdown Fallback/Sync)
// ----------------------------------------------------

export async function getAllBlogPosts(): Promise<BlogPost[]> {
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

  // 2. Read from Prisma DB and overlay/add
  try {
    const dbPosts = await prisma.post.findMany({
      where: { status: "published" },
      orderBy: { date: "desc" },
      include: { author: true, tags: true },
    }).catch(() => []);

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

  return Array.from(postsMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
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

  // Fallback to local markdown file
  try {
    ensureDirectoryExists(BLOG_DIR);
    const filePath = path.join(BLOG_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);
      const rawDate = data.date ? String(data.date) : "2024-01-01";
      return {
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
    }
  } catch (err) {
    console.warn("Local post retrieval notice:", err);
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
// Profile Info (Homepage Headline, Bio, Experience, Skills, Social Links)
// ----------------------------------------------------

export const DEFAULT_PROFILE_INFO: ProfileInfoData = {
  headline: "Cloud DevOps & Infrastructure Engineer.",
  bio: [
    "Over the past 3 years, I've engineered network backbones and scaled cloud environments—transitioning from 2 years in enterprise network infrastructure to building declarative Kubernetes, Terraform, and GitOps architectures.",
    "I studied Engineering at Global Institute of Engineering & Technology (GIET), Moinabad. I focus on simple, observable, and resilient distributed systems.",
  ],
  experiences: [
    {
      year: "2024",
      present: true,
      company: "Gulf Intelligence & Media",
      role: "Architect / Full-stack Developer",
      description:
        "Architecting real-time geospatial intelligence, ML threat scoring pipelines, and cross-platform document synthesis engines using Go, Python, and React.",
      projects: [
        { name: "HormuzWatch", url: "/projects/hormuzwatch", internal: true },
        { name: "RaweeGo", url: "/projects/raweego", internal: true },
      ],
    },
    {
      year: "2023",
      present: false,
      company: "Enterprise Systems",
      role: "Full-stack & Infrastructure Engineer",
      description:
        "Engineered distributed point-of-sale tenant platforms, Kafka event-driven architectures, and encrypted certification authoring studios.",
      projects: [
        { name: "NoteTruck", url: "/projects/notetruck", internal: true },
        { name: "AburPOS Central", url: "/projects/aburpos-central", internal: true },
      ],
    },
  ],
  skills: [
    "AWS (EKS, VPC, Route53)",
    "Kubernetes & ArgoCD",
    "Terraform (IaC)",
    "Docker & Containers",
    "CI/CD (GitHub Actions)",
    "Linux & Networking (BGP/OSPF)",
    "Python & Bash Scripting",
    "Cloud Architecture & SRE",
    "Remix / TypeScript",
  ],
  certifications: [
    {
      name: "Cisco Certified Network Professional (CCNP)",
      issuer: "Cisco",
      credentialUrl: "https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/professional.html",
    },
    {
      name: "Cisco Certified Network Associate (CCNA)",
      issuer: "Cisco",
      credentialUrl: "https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html",
    },
    {
      name: "Microsoft Certified: Azure Administrator Associate",
      issuer: "Microsoft",
      credentialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/",
    },
    {
      name: "Microsoft Certified: Azure Solutions Architect Expert",
      issuer: "Microsoft",
      credentialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/",
    },
    {
      name: "Microsoft Certified: Azure Fundamentals",
      issuer: "Microsoft",
      credentialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
    },
    {
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      credentialUrl: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    },
  ],
  socialLinks: [
    { label: "Twitter", href: "https://x.com/yahyaoncloud", display: "https://twitter.com/yahyaoncloud", external: true },
    { label: "GitHub", href: "https://github.com/yahyaoncloud", display: "https://github.com/yahyaoncloud", external: true },
    { label: "LinkedIn", href: "https://linkedin.com/in/ykinwork1", display: "https://linkedin.com/in/ykinwork1", external: true },
    { label: "Email", href: "mailto:hello@yahyaoncloud.com", display: "hello@yahyaoncloud.com", external: false },
  ],
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
  try {
    const profile = await prisma.profileInfo.findUnique({
      where: { key: "homepage_profile" },
    }).catch(() => null);

    if (profile) {
      const dbVisibility = profile.sectionsVisibility as unknown as SectionVisibility | undefined;
      return {
        headline: profile.headline || DEFAULT_PROFILE_INFO.headline,
        bio: profile.bio && profile.bio.length > 0 ? profile.bio : DEFAULT_PROFILE_INFO.bio,
        skills: profile.skills && profile.skills.length > 0 ? profile.skills : DEFAULT_PROFILE_INFO.skills,
        experiences: (profile.experiences as unknown as ProfileInfoData["experiences"]) || DEFAULT_PROFILE_INFO.experiences,
        certifications: (profile.certifications as unknown as ProfileInfoData["certifications"]) || DEFAULT_PROFILE_INFO.certifications,
        socialLinks: (profile.socialLinks as unknown as ProfileInfoData["socialLinks"]) || DEFAULT_PROFILE_INFO.socialLinks,
        sectionsVisibility: {
          summary: true,
          experience: true,
          elsewhere: true,
          certifications: dbVisibility?.certifications !== undefined ? Boolean(dbVisibility.certifications) : true,
          skills: dbVisibility?.skills !== undefined ? Boolean(dbVisibility.skills) : true,
          selectedWork: dbVisibility?.selectedWork !== undefined ? Boolean(dbVisibility.selectedWork) : true,
          writing: dbVisibility?.writing !== undefined ? Boolean(dbVisibility.writing) : true,
          research: dbVisibility?.research !== undefined ? Boolean(dbVisibility.research) : true,
        },
      };
    }

    // Auto-seed into MongoDB if not present
    await prisma.profileInfo.create({
      data: {
        key: "homepage_profile",
        headline: DEFAULT_PROFILE_INFO.headline,
        bio: DEFAULT_PROFILE_INFO.bio,
        skills: DEFAULT_PROFILE_INFO.skills,
        experiences: DEFAULT_PROFILE_INFO.experiences as unknown as object,
        certifications: DEFAULT_PROFILE_INFO.certifications as unknown as object,
        socialLinks: DEFAULT_PROFILE_INFO.socialLinks as unknown as object,
        sectionsVisibility: DEFAULT_PROFILE_INFO.sectionsVisibility as unknown as object,
      },
    }).catch((err) => console.warn("DB seed profile info notice:", err));
  } catch (err) {
    console.warn("DB profile info query notice:", err);
  }

  return DEFAULT_PROFILE_INFO;
}

export async function saveProfileInfo(data: ProfileInfoData): Promise<boolean> {
  try {
    const visibilityToSave = {
      summary: true,
      experience: true,
      elsewhere: true,
      certifications: data.sectionsVisibility?.certifications !== undefined ? Boolean(data.sectionsVisibility.certifications) : true,
      skills: data.sectionsVisibility?.skills !== undefined ? Boolean(data.sectionsVisibility.skills) : true,
      selectedWork: data.sectionsVisibility?.selectedWork !== undefined ? Boolean(data.sectionsVisibility.selectedWork) : true,
      writing: data.sectionsVisibility?.writing !== undefined ? Boolean(data.sectionsVisibility.writing) : true,
      research: data.sectionsVisibility?.research !== undefined ? Boolean(data.sectionsVisibility.research) : true,
    };

    await prisma.profileInfo.upsert({
      where: { key: "homepage_profile" },
      update: {
        headline: data.headline,
        bio: data.bio,
        skills: data.skills,
        experiences: data.experiences as unknown as object,
        certifications: data.certifications as unknown as object,
        socialLinks: data.socialLinks as unknown as object,
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
