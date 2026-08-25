import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react";
import { requireAdmin } from "~/utils/admin-auth.server";
import { prisma } from "~/utils/prisma.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Sparkles, FileText, Briefcase, BookOpen, Star, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface FeaturedPost {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  featured: boolean;
  date: string | Date;
  status: string;
}

interface FeaturedProject {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  featured: boolean;
  order: number;
}

interface FeaturedPaper {
  id: string;
  slug: string;
  title: string;
  abstract: string;
  venue: string;
  year: string;
  featured: boolean;
  order: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);

  const [posts, projects, papers] = await Promise.all([
    prisma.post.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        coverImage: true,
        featured: true,
        date: true,
        status: true,
      },
      orderBy: { date: "desc" },
    }).catch(() => []),
    prisma.projectCaseStudy.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        category: true,
        featured: true,
        order: true,
      },
      orderBy: { order: "asc" },
    }).catch(() => []),
    prisma.researchPaper.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        abstract: true,
        venue: true,
        year: true,
        featured: true,
        order: true,
      },
      orderBy: { order: "asc" },
    }).catch(() => []),
  ]);

  return json({ 
    posts: posts as FeaturedPost[], 
    projects: projects as FeaturedProject[], 
    papers: papers as FeaturedPaper[] 
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const type = formData.get("type") as "post" | "project" | "paper";
  const id = formData.get("id") as string;
  const currentFeatured = formData.get("currentFeatured") === "true";

  try {
    if (intent === "toggle-featured" && id) {
      const nextFeatured = !currentFeatured;
      if (type === "post") {
        await prisma.post.update({
          where: { id },
          data: { featured: nextFeatured },
        });
      } else if (type === "project") {
        await prisma.projectCaseStudy.update({
          where: { id },
          data: { featured: nextFeatured },
        });
      } else if (type === "paper") {
        await prisma.researchPaper.update({
          where: { id },
          data: { featured: nextFeatured },
        });
      }

      return json({
        success: true,
        message: `${type.toUpperCase()} featured status updated to ${nextFeatured ? "Featured" : "Standard"}`,
      });
    }

    return json({ success: false, error: "Invalid action intent" }, { status: 400 });
  } catch (err) {
    return json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to update featured status",
    }, { status: 500 });
  }
}

export default function AdminFeaturedArticles() {
  const { posts, projects, papers } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as { success?: boolean; message?: string; error?: string } | undefined;
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"all" | "posts" | "projects" | "papers">("all");

  useEffect(() => {
    if (actionData?.success && actionData.message) {
      toast.success(actionData.message);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const featuredPosts = posts.filter((p) => p.featured);
  const featuredProjects = projects.filter((p) => p.featured);
  const featuredPapers = papers.filter((p) => p.featured);

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="text-amber-500" size={24} /> Featured Content & Spotlight Showcase
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Curate what stories, engineering case studies, and research publications appear in hero spotlights across YahyaOnCloud.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/" target="_blank">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Eye size={14} /> Preview Public Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center justify-between">
              <span>Featured Articles</span>
              <FileText size={16} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{featuredPosts.length}</div>
            <p className="text-xs text-zinc-500 mt-1">of {posts.length} total posts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
              <span>Featured Projects</span>
              <Briefcase size={16} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{featuredProjects.length}</div>
            <p className="text-xs text-zinc-500 mt-1">of {projects.length} case studies</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>Featured Research</span>
              <BookOpen size={16} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{featuredPapers.length}</div>
            <p className="text-xs text-zinc-500 mt-1">of {papers.length} publications</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "all"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          All Items ({posts.length + projects.length + papers.length})
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "posts"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Blog Articles ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "projects"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("papers")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "papers"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Research ({papers.length})
        </button>
      </div>

      {/* Content Grid */}
      <div className="space-y-6">
        {/* Posts Section */}
        {(activeTab === "all" || activeTab === "posts") && posts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText size={16} className="text-amber-500" /> Blog Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    post.featured
                      ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {post.title}
                      </h3>
                      {post.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full shrink-0">
                          <Star size={10} className="fill-amber-500 text-amber-500" /> Spotlight
                        </span>
                      )}
                    </div>
                    {post.summary && (
                      <p className="text-xs text-zinc-500 line-clamp-2">{post.summary}</p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400">/{post.slug}</span>
                    <Form method="post" className="inline">
                      <input type="hidden" name="intent" value="toggle-featured" />
                      <input type="hidden" name="type" value="post" />
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="currentFeatured" value={String(post.featured)} />
                      <Button
                        type="submit"
                        size="sm"
                        variant={post.featured ? "outline" : "secondary"}
                        disabled={isSubmitting}
                        className="text-xs h-7 gap-1"
                      >
                        <Star size={12} className={post.featured ? "fill-amber-500 text-amber-500" : ""} />
                        {post.featured ? "Remove Spotlight" : "Set Featured"}
                      </Button>
                    </Form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {(activeTab === "all" || activeTab === "projects") && projects.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Briefcase size={16} className="text-indigo-500" /> Case Studies & Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    proj.featured
                      ? "border-indigo-500/40 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {proj.title}
                      </h3>
                      {proj.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full shrink-0">
                          <Star size={10} className="fill-indigo-500 text-indigo-500" /> Featured
                        </span>
                      )}
                    </div>
                    {proj.summary && (
                      <p className="text-xs text-zinc-500 line-clamp-2">{proj.summary}</p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400">/{proj.slug}</span>
                    <Form method="post" className="inline">
                      <input type="hidden" name="intent" value="toggle-featured" />
                      <input type="hidden" name="type" value="project" />
                      <input type="hidden" name="id" value={proj.id} />
                      <input type="hidden" name="currentFeatured" value={String(proj.featured)} />
                      <Button
                        type="submit"
                        size="sm"
                        variant={proj.featured ? "outline" : "secondary"}
                        disabled={isSubmitting}
                        className="text-xs h-7 gap-1"
                      >
                        <Star size={12} className={proj.featured ? "fill-indigo-500 text-indigo-500" : ""} />
                        {proj.featured ? "Remove Featured" : "Set Featured"}
                      </Button>
                    </Form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research Papers Section */}
        {(activeTab === "all" || activeTab === "papers") && papers.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-500" /> Research Publications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    paper.featured
                      ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {paper.title}
                      </h3>
                      {paper.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full shrink-0">
                          <Star size={10} className="fill-emerald-500 text-emerald-500" /> Spotlight
                        </span>
                      )}
                    </div>
                    {paper.abstract && (
                      <p className="text-xs text-zinc-500 line-clamp-2">{paper.abstract}</p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400">{paper.venue || "Research"} ({paper.year})</span>
                    <Form method="post" className="inline">
                      <input type="hidden" name="intent" value="toggle-featured" />
                      <input type="hidden" name="type" value="paper" />
                      <input type="hidden" name="id" value={paper.id} />
                      <input type="hidden" name="currentFeatured" value={String(paper.featured)} />
                      <Button
                        type="submit"
                        size="sm"
                        variant={paper.featured ? "outline" : "secondary"}
                        disabled={isSubmitting}
                        className="text-xs h-7 gap-1"
                      >
                        <Star size={12} className={paper.featured ? "fill-emerald-500 text-emerald-500" : ""} />
                        {paper.featured ? "Remove Featured" : "Set Featured"}
                      </Button>
                    </Form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
