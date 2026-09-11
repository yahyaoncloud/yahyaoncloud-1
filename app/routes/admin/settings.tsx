import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation, Form, useActionData, useSearchParams } from "@remix-run/react";
import { requireAdmin } from "~/utils/admin-auth.server";
import { getAdminByUsername, updateAdmin } from "~/Services/admin.prisma.server";
import { getAnalyticsSummary, resetAnalyticsSummary } from "~/Services/analytics.server";
import { getSiteSettings, updateSiteSettings } from "~/Services/site-settings.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  LuUser as User,
  LuShield as Shield,
  LuSave as Save,
  LuLoaderCircle as Loader2,
  LuLayoutDashboard as Layout,
  LuPanelLeft as SidebarIcon,
  LuTrendingUp as TrendingUp,
  LuEye as Eye,
  LuUsers as Users,
  LuRotateCcw as RotateCcw,
  LuTriangleAlert as AlertTriangle,
  LuGlobe as Globe,
  LuShare2 as Share2,
  LuKeyRound as KeyRound,
  LuCheck as Check,
  LuSettings as SettingsIcon,
} from "~/components/ui/icons";
import { useUIStore } from "~/store/uiStore";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const adminPayload = await requireAdmin(request);
  const [admin, summary, siteSettings] = await Promise.all([
    getAdminByUsername(adminPayload.username),
    getAnalyticsSummary(),
    getSiteSettings(),
  ]);

  return json({
    admin: admin
      ? { ...admin, isFirebaseOnly: false }
      : {
          id: adminPayload.id,
          username: adminPayload.username,
          email: adminPayload.email,
          role: adminPayload.role,
          isFirebaseOnly: true,
        },
    summary,
    siteSettings,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const adminPayload = await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  // 1. Reset Analytics
  if (intent === "reset-analytics") {
    try {
      const { deletedCount } = await resetAnalyticsSummary();
      return json({
        success: true,
        message: `Dashboard metrics reset successfully (cleared ${deletedCount} records).`,
        intent: "reset-analytics",
      });
    } catch (err) {
      console.error("Error resetting analytics:", err);
      return json(
        { success: false, error: "Failed to reset dashboard metrics.", intent: "reset-analytics" },
        { status: 500 }
      );
    }
  }

  // 2. Site & SEO Settings
  if (intent === "site-settings") {
    const siteName = (formData.get("siteName") as string)?.trim() || "YahyaOnCloud";
    const siteDescription = (formData.get("siteDescription") as string)?.trim() || "";
    const keywords = (formData.get("keywords") as string)?.trim() || "";
    const twitter = (formData.get("twitter") as string)?.trim() || "";
    const github = (formData.get("github") as string)?.trim() || "";
    const linkedin = (formData.get("linkedin") as string)?.trim() || "";
    const instagram = (formData.get("instagram") as string)?.trim() || "";
    const maintenanceMode = formData.get("maintenanceMode") === "on";

    try {
      await updateSiteSettings({
        title: siteName,
        description: siteDescription,
        keywords,
        maintenanceMode,
        socialLinks: {
          twitter,
          github,
          linkedin,
          instagram,
        },
      });
      return json({
        success: true,
        message: "Site & SEO settings saved successfully!",
        intent: "site-settings",
      });
    } catch (err) {
      return json(
        {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update site settings",
          intent: "site-settings",
        },
        { status: 500 }
      );
    }
  }

  // Look up admin by username for MongoDB account operations
  const admin = await getAdminByUsername(adminPayload.username);
  if (!admin) {
    return json({
      success: false,
      error: "Your account is managed by session token. Changes cannot be committed directly to MongoDB.",
      intent,
    });
  }

  // 3. Profile Info
  if (intent === "profile") {
    const username = (formData.get("username") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();

    if (!username) {
      return json({ success: false, error: "Username is required", intent: "profile" });
    }

    try {
      await updateAdmin(admin.id, { username, email });
      return json({ success: true, message: "Profile updated successfully", intent: "profile" });
    } catch (error) {
      console.error("Update profile error:", error);
      return json({ success: false, error: "Failed to update profile", intent: "profile" });
    }
  }

  // 4. Password / Security
  if (intent === "security") {
    const password = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || password.length < 6) {
      return json({ success: false, error: "Password must be at least 6 characters", intent: "security" });
    }

    if (password !== confirmPassword) {
      return json({ success: false, error: "Passwords do not match", intent: "security" });
    }

    try {
      await updateAdmin(admin.id, { password });
      return json({ success: true, message: "Password updated successfully", intent: "security" });
    } catch (error) {
      console.error("Update password error:", error);
      return json({ success: false, error: "Failed to update password", intent: "security" });
    }
  }

  return json({ success: false, error: "Invalid intent", intent });
}

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  intent?: string;
}

export default function AdminSettings() {
  const { admin, summary, siteSettings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as ActionResponse | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { sidebarBehavior, setSidebarBehavior } = useUIStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [maintenance, setMaintenance] = useState(Boolean(siteSettings.maintenanceMode));

  // Sync tab with URL search parameter
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    setSearchParams({ tab: value }, { replace: true });
  };

  // Toast feedback on action returns
  useEffect(() => {
    if (actionData?.success && actionData.message) {
      toast.success(actionData.message);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <SettingsIcon size={20} />
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings Hub</h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Centralized management for credentials, SEO metadata, interface behavior, and system analytics.
          </p>
        </div>
      </div>

      {/* Main Tabbed Interface */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl grid grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-xs text-xs sm:text-sm font-medium cursor-pointer"
          >
            <User size={16} />
            <span>Profile & Security</span>
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-xs text-xs sm:text-sm font-medium cursor-pointer"
          >
            <Globe size={16} />
            <span>Site & SEO</span>
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-xs text-xs sm:text-sm font-medium cursor-pointer"
          >
            <SidebarIcon size={16} />
            <span>Preferences</span>
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-xs text-xs sm:text-sm font-medium cursor-pointer"
          >
            <TrendingUp size={16} />
            <span>Telemetry</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Profile & Security Tab */}
        <TabsContent value="profile" className="space-y-6 focus:outline-hidden">
          {/* Account Details */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <User className="text-indigo-600 dark:text-indigo-400" size={20} />
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Admin Account Information</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Manage administrator username and contact email.</p>
              </div>
            </div>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="profile" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={admin.username || ""}
                    required
                    className="bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={admin.email || ""}
                    placeholder="admin@example.com"
                    className="bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Profile
                </Button>
              </div>
            </Form>
          </div>

          {/* Password Security */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <Shield className="text-emerald-600 dark:text-emerald-400" size={20} />
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Change Password</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Update your administrator password (minimum 6 characters).</p>
              </div>
            </div>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="security" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isSubmitting}
                  className="gap-2 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />}
                  Update Password
                </Button>
              </div>
            </Form>
          </div>
        </TabsContent>

        {/* 2. Site & SEO Defaults Tab */}
        <TabsContent value="seo" className="space-y-6 focus:outline-hidden">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <Globe className="text-blue-600 dark:text-blue-400" size={20} />
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Site Identity & Meta Defaults</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Configure global metadata, search engine snippets, and social handles.</p>
              </div>
            </div>

            <Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="site-settings" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Title</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    defaultValue={siteSettings.title || "YahyaOnCloud"}
                    required
                    className="bg-zinc-50 dark:bg-zinc-950"
                  />
                  <p className="text-xs text-zinc-400">Default title appended to browser tabs and Google SERP snippets.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    name="keywords"
                    defaultValue={siteSettings.keywords || ""}
                    placeholder="cloud, web, devops, engineering"
                    className="bg-zinc-50 dark:bg-zinc-950"
                  />
                  <p className="text-xs text-zinc-400">Meta keywords indexed by discovery crawlers.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Global Meta Description</Label>
                <Textarea
                  id="siteDescription"
                  name="siteDescription"
                  defaultValue={siteSettings.description || ""}
                  rows={3}
                  className="bg-zinc-50 dark:bg-zinc-950"
                  placeholder="Personal engineering blog, case studies, and portfolio of Yahya..."
                />
              </div>

              {/* Social Handles */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <Share2 size={16} className="text-zinc-500" />
                  Social Profile Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="github" className="text-xs text-zinc-500">GitHub Profile URL</Label>
                    <Input
                      id="github"
                      name="github"
                      defaultValue={siteSettings.socialLinks?.github || ""}
                      placeholder="https://github.com/username"
                      className="bg-zinc-50 dark:bg-zinc-950 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="linkedin" className="text-xs text-zinc-500">LinkedIn Profile URL</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      defaultValue={siteSettings.socialLinks?.linkedin || ""}
                      placeholder="https://linkedin.com/in/username"
                      className="bg-zinc-50 dark:bg-zinc-950 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="twitter" className="text-xs text-zinc-500">Twitter / X Profile URL</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      defaultValue={siteSettings.socialLinks?.twitter || ""}
                      placeholder="https://x.com/username"
                      className="bg-zinc-50 dark:bg-zinc-950 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="instagram" className="text-xs text-zinc-500">Instagram Profile URL</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      defaultValue={siteSettings.socialLinks?.instagram || ""}
                      placeholder="https://instagram.com/username"
                      className="bg-zinc-50 dark:bg-zinc-950 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Maintenance Mode</span>
                    {maintenance && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    When active, public visitors are shown a maintenance splash screen. Admins retain full access.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="hidden" name="maintenanceMode" value={maintenance ? "on" : "off"} />
                  <Switch
                    checked={maintenance}
                    onCheckedChange={setMaintenance}
                    aria-label="Toggle maintenance mode"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Site Settings
                </Button>
              </div>
            </Form>
          </div>
        </TabsContent>

        {/* 3. Interface Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6 focus:outline-hidden">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <SidebarIcon className="text-zinc-600 dark:text-zinc-400" size={20} />
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Admin Interface & Navigation</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Configure layout behavior for your administrative session.</p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium">Default Sidebar Mode on Page Visit</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSidebarBehavior("always-open");
                    toast.success("Sidebar set to always open by default on visit");
                  }}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    sidebarBehavior === "always-open"
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
                >
                  <SidebarIcon className="mt-0.5 shrink-0 text-zinc-700 dark:text-zinc-300" size={18} />
                  <div>
                    <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      Always Open (Default)
                      {sidebarBehavior === "always-open" && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Sidebar stays expanded when visiting pages for easy multi-section navigation.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSidebarBehavior("always-closed");
                    toast.success("Sidebar set to keep closed/collapsed by default");
                  }}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    sidebarBehavior === "always-closed"
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
                >
                  <Layout className="mt-0.5 shrink-0 text-zinc-700 dark:text-zinc-300" size={18} />
                  <div>
                    <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      Keep Closed / Compact
                      {sidebarBehavior === "always-closed" && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Sidebar stays collapsed by default and only expands when you toggle it.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 4. System & Telemetry Tab */}
        <TabsContent value="system" className="space-y-6 focus:outline-hidden">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={20} />
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Telemetry & Dashboard Metrics</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Overview of visitor telemetry counters and diagnostic controls.</p>
              </div>
            </div>

            {/* Current Metric Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Tracked Views</span>
                  <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {(summary?.totalViews ?? 0).toLocaleString()}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Eye size={20} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Unique Visitors</span>
                  <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {(summary?.uniqueVisitors ?? 0).toLocaleString()}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Users size={20} />
                </div>
              </div>
            </div>

            {/* Reset Metrics Section */}
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 text-red-600 dark:text-red-400 shrink-0" size={20} />
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Reset Dashboard Analytics</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Permanently clears all recorded page visit logs, country breakdown, and resets lifetime view counters back to 0.
                  </p>
                </div>
              </div>

              <Form
                method="post"
                onSubmit={(e) => {
                  if (!confirm("Are you sure you want to reset all dashboard analytics counters to 0? This cannot be undone.")) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="intent" value="reset-analytics" />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isSubmitting}
                  className="gap-2 shrink-0 border-red-300 dark:border-red-800 bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                  Reset Analytics
                </Button>
              </Form>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
