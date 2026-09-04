import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useFetcher, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import {
  Briefcase,
  FileText,
  Settings,
  Users,
  Eye,
  LayoutGrid,
  Sparkles,
  Layers,
  Globe,
  ExternalLink,
  Code,
  Award,
  BookOpen,
  Share2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { getAnalyticsSummary } from "~/Services/analytics.server";
import {
  getProfileInfo,
  saveProfileInfo,
  getAllProjects,
  getAllBlogPosts,
  getAllResearchPapers,
  type SectionVisibility,
} from "~/Services/content.server";
import { requireAdmin } from "~/utils/admin-auth.server";
import {
  AdminPageHeader,
  AdminStatCard,
  AdminSectionToggleCard,
  AdminActivityFeed,
  AdminQuickActions,
  type QuickActionItem,
} from "~/components/admin";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  const [summary, profileInfo, allProjects, allPosts, allPapers] = await Promise.all([
    getAnalyticsSummary(),
    getProfileInfo(),
    getAllProjects(),
    getAllBlogPosts(),
    getAllResearchPapers(),
  ]);

  return json({
    summary,
    profileInfo,
    counts: {
      projects: allProjects.length,
      posts: allPosts.length,
      papers: allPapers.length,
      experiences: profileInfo.experiences?.length || 0,
      skills: profileInfo.skills?.length || 0,
      certifications: profileInfo.certifications?.length || 0,
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "toggle-section") {
    const sectionKey = formData.get("sectionKey") as keyof SectionVisibility;
    const visible = formData.get("visible") === "true";

    if (!sectionKey) {
      return json({ success: false, error: "Section key is required" }, { status: 400 });
    }

    try {
      const profile = await getProfileInfo();
      const nextVisibility: SectionVisibility = {
        ...profile.sectionsVisibility,
        [sectionKey]: visible,
      };

      await saveProfileInfo({
        ...profile,
        sectionsVisibility: nextVisibility,
      });

      const sectionLabels: Record<string, string> = {
        selectedWork: "Selected Work (Featured Projects)",
        writing: "Writing (Recent Articles)",
        research: "Technical Research Papers",
        experience: "Career Experience",
        summary: "Profile & Introduction",
        elsewhere: "Elsewhere & Socials",
        skills: "Technical Skills",
        certifications: "Certifications",
      };

      const label = sectionLabels[sectionKey] || sectionKey;

      return json({
        success: true,
        sectionKey,
        visible,
        message: `${label} is now ${visible ? "visible on" : "hidden from"} your homepage.`,
      });
    } catch (err) {
      console.error("Error toggling section visibility:", err);
      return json(
        {
          success: false,
          error: err instanceof Error ? err.message : "Failed to toggle section visibility",
        },
        { status: 500 }
      );
    }
  }

  return json({ success: false, error: "Invalid action intent" }, { status: 400 });
};

export default function AdminDashboard() {
  const { summary, profileInfo, counts } = useLoaderData<typeof loader>();
  const toggleFetcher = useFetcher<{
    success?: boolean;
    sectionKey?: string;
    visible?: boolean;
    message?: string;
    error?: string;
  }>();

  // Local optimistic state for instant feedback
  const [visibility, setVisibility] = useState<SectionVisibility>({
    summary: profileInfo.sectionsVisibility?.summary !== false,
    experience: profileInfo.sectionsVisibility?.experience !== false,
    elsewhere: profileInfo.sectionsVisibility?.elsewhere !== false,
    certifications: profileInfo.sectionsVisibility?.certifications !== false,
    skills: profileInfo.sectionsVisibility?.skills !== false,
    selectedWork: profileInfo.sectionsVisibility?.selectedWork !== false,
    writing: profileInfo.sectionsVisibility?.writing !== false,
    research: profileInfo.sectionsVisibility?.research !== false,
  });

  // Sync state if server updates
  useEffect(() => {
    if (profileInfo.sectionsVisibility) {
      setVisibility((prev) => ({
        ...prev,
        ...profileInfo.sectionsVisibility,
      }));
    }
  }, [profileInfo]);

  // Handle toast notifications from fetcher
  useEffect(() => {
    if (toggleFetcher.data?.success && toggleFetcher.data.message) {
      toast.success(toggleFetcher.data.message);
    } else if (toggleFetcher.data?.error) {
      toast.error(toggleFetcher.data.error);
    }
  }, [toggleFetcher.data]);

  const handleToggleSection = (sectionKey: string, nextVal: boolean) => {
    // 1. Optimistic update
    setVisibility((prev) => ({
      ...prev,
      [sectionKey]: nextVal,
    }));

    // 2. Submit to server action
    toggleFetcher.submit(
      {
        intent: "toggle-section",
        sectionKey,
        visible: String(nextVal),
      },
      { method: "post" }
    );
  };

  const totalActiveSections = Object.values(visibility).filter(Boolean).length;
  const totalContentCount = counts.projects + counts.posts + counts.papers;

  const quickActions: QuickActionItem[] = [
    {
      title: "Write New Post",
      description: "Draft, format markdown, and publish blog articles.",
      href: "/admin/post/create",
      icon: FileText,
      badge: "Markdown",
    },
    {
      title: "Add Project Case Study",
      description: "Showcase architecture, tech stacks, and live URLs.",
      href: "/admin/projects/create",
      icon: Briefcase,
    },
    {
      title: "Spotlight Featured Items",
      description: "Pick which articles and projects get hero spots.",
      href: "/admin/featured-articles",
      icon: Sparkles,
    },
    {
      title: "Global Site Settings",
      description: "SEO meta tags, maintenance mode, and social links.",
      href: "/admin/site-settings",
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <AdminPageHeader
        title="Dashboard Overview"
        description="Monitor site analytics, toggle homepage features, and manage published engineering showcases."
        actions={
          <>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
              <span>View Public Site</span>
            </a>
            <Link
              to="/admin/about?tab=sections"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Configure Sections</span>
            </Link>
          </>
        }
      />

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Total Page Views"
          value={summary.totalViews.toLocaleString()}
          icon={Eye}
          description="Lifetime site views"
          trend={{ value: "+Realtime", isPositive: true }}
          iconClassName="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
        />
        <AdminStatCard
          title="Unique Visitors"
          value={summary.uniqueVisitors.toLocaleString()}
          icon={Users}
          description="Tracked via hashed sessions"
          iconClassName="bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400"
        />
        <AdminStatCard
          title="Homepage Sections"
          value={`${totalActiveSections} of 8`}
          icon={LayoutGrid}
          description="Active sections displayed"
          href="/admin/about?tab=sections"
          iconClassName="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
        />
        <AdminStatCard
          title="Published Content"
          value={totalContentCount}
          icon={Layers}
          description={`${counts.posts} posts • ${counts.projects} projects • ${counts.papers} papers`}
          href="/admin/posts"
          iconClassName="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Interactive Homepage Section Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Homepage Sections & Feature Visibility</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Click any toggle to instantly show or hide sections on your public landing page.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{totalActiveSections} of 8 sections currently visible</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Selected Work (Featured Projects) */}
          <AdminSectionToggleCard
            title="Selected Work (Featured Projects)"
            sectionKey="selectedWork"
            isVisible={visibility.selectedWork !== false}
            itemCount={counts.projects}
            itemLabel="case studies"
            manageHref="/admin/projects"
            icon={Briefcase}
            description="Showcases your featured cloud & engineering projects, live demos, and GitHub repositories."
            onToggle={handleToggleSection}
          />

          {/* Writing (Recent Articles) */}
          <AdminSectionToggleCard
            title="Writing (Recent Articles)"
            sectionKey="writing"
            isVisible={visibility.writing !== false}
            itemCount={counts.posts}
            itemLabel="published posts"
            manageHref="/admin/posts"
            icon={FileText}
            description="Displays your latest technical blog posts, publication dates, and reading times."
            onToggle={handleToggleSection}
          />

          {/* Technical Research Papers */}
          <AdminSectionToggleCard
            title="Technical Research Papers"
            sectionKey="research"
            isVisible={visibility.research !== false}
            itemCount={counts.papers}
            itemLabel="papers"
            manageHref="/admin/research"
            icon={BookOpen}
            description="Displays academic publications, arXiv abstracts, conference venues, and DOI links."
            onToggle={handleToggleSection}
          />

          {/* Career Experience */}
          <AdminSectionToggleCard
            title="Career Experience"
            sectionKey="experience"
            isVisible={visibility.experience !== false}
            itemCount={counts.experiences}
            itemLabel="career roles"
            manageHref="/admin/about?tab=experience"
            icon={TrendingUp}
            description="Interactive career timeline detailing companies, senior roles, years, and project milestones."
            onToggle={handleToggleSection}
          />

          {/* Profile & Introduction */}
          <AdminSectionToggleCard
            title="Profile & Introduction"
            sectionKey="summary"
            isVisible={visibility.summary !== false}
            manageHref="/admin/about?tab=basic"
            icon={Users}
            description="Hero profile block with custom avatar, professional headline, and introductory bio paragraphs."
            onToggle={handleToggleSection}
          />

          {/* Technical Skills */}
          <AdminSectionToggleCard
            title="Technical Skills"
            sectionKey="skills"
            isVisible={visibility.skills !== false}
            itemCount={counts.skills}
            itemLabel="skills listed"
            manageHref="/admin/about?tab=skills"
            icon={Code}
            description="Categorized badges highlighting Cloud, Kubernetes, DevOps, and programming proficiencies."
            onToggle={handleToggleSection}
          />

          {/* Certifications */}
          <AdminSectionToggleCard
            title="Certifications & Badges"
            sectionKey="certifications"
            isVisible={visibility.certifications !== false}
            itemCount={counts.certifications}
            itemLabel="credentials"
            manageHref="/admin/about?tab=certs"
            icon={Award}
            description="Verified certifications (AWS, GCP, CKA) with issuer details and public verification links."
            onToggle={handleToggleSection}
          />

          {/* Elsewhere & Socials */}
          <AdminSectionToggleCard
            title="Elsewhere & Socials"
            sectionKey="elsewhere"
            isVisible={visibility.elsewhere !== false}
            manageHref="/admin/about?tab=socials"
            icon={Share2}
            description="External profile links including GitHub, LinkedIn, Twitter/X, and direct email contacts."
            onToggle={handleToggleSection}
          />
        </div>
      </div>

      {/* Mid Section: Top Pages & Quick Shortcuts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Top Pages */}
        <Card className="col-span-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Top Visited Pages
            </CardTitle>
            <CardDescription className="text-xs">
              Most visited routes across your portfolio and blog.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {summary.topPages.map((page, idx) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between py-1.5 border-b last:border-0 border-zinc-100 dark:border-zinc-800/60"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="font-mono text-xs text-zinc-400 w-4">{idx + 1}.</span>
                    <span className="text-sm font-mono text-zinc-800 dark:text-zinc-200 truncate">
                      {page.path}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded shrink-0">
                    <span>{page.count}</span>
                    <span className="text-[10px] text-zinc-400 font-normal">views</span>
                  </div>
                </div>
              ))}
              {summary.topPages.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-6">
                  No traffic visits recorded yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shortcuts */}
        <div className="col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Quick Shortcuts
            </h3>
            <span className="text-xs text-zinc-500">Common actions</span>
          </div>
          <AdminQuickActions items={quickActions} className="sm:grid-cols-1" />
        </div>
      </div>

      {/* Bottom Section: Recent Activity Timeline */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Live Activity Stream
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time audit of recent incoming visitor sessions.
            </CardDescription>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {summary.recentVisits.length} events logged
          </span>
        </CardHeader>
        <CardContent className="pt-2">
          <AdminActivityFeed
            visits={summary.recentVisits}
            emptyMessage="No recent activity logged. Visitor hits will show here in real time."
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let message = "An error occurred while loading the dashboard metrics.";
  if (isRouteErrorResponse(error)) {
    message =
      typeof error.data === "string"
        ? error.data
        : error.data?.message || `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-6 text-center space-y-3">
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">
          Dashboard Temporarily Unavailable
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
