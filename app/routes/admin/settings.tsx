import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation, Form, useActionData, useFetcher } from "@remix-run/react";
import { requireAdmin } from "~/utils/admin-auth.server";
import { getAdminByUsername, updateAdmin } from "~/Services/admin.prisma.server";
import { getAnalyticsSummary, resetAnalyticsSummary, type AnalyticsSummary } from "~/Services/analytics.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
} from "react-icons/lu";
import { useUIStore } from "~/store/uiStore";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const adminPayload = await requireAdmin(request);
  const [admin, summary] = await Promise.all([
    getAdminByUsername(adminPayload.username),
    getAnalyticsSummary(),
  ]);

  if (!admin) {
    return json({
      admin: {
        id: adminPayload.id,
        username: adminPayload.username,
        email: adminPayload.email,
        role: adminPayload.role,
        isFirebaseOnly: true,
      },
      summary,
    });
  }

  return json({ admin: { ...admin, isFirebaseOnly: false }, summary });
}

export async function action({ request }: ActionFunctionArgs) {
  const adminPayload = await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "reset-analytics") {
    try {
      const { deletedCount } = await resetAnalyticsSummary();
      return json({
        success: true,
        message: `Homepage dashboard metrics successfully reset (cleared ${deletedCount} tracking entries).`,
        intent: "reset-analytics",
      });
    } catch (err) {
      console.error("Error resetting analytics:", err);
      return json({
        success: false,
        error: "Failed to reset dashboard metrics.",
        intent: "reset-analytics",
      }, { status: 500 });
    }
  }

  // Look up admin by username to get MongoDB ID for profile/security changes
  const admin = await getAdminByUsername(adminPayload.username);
  if (!admin) {
    return json({
      success: false,
      error: "Your account is managed by Firebase. Profile changes cannot be saved to the database.",
      intent: intent as string,
    });
  }

  if (intent === "profile") {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;

    if (!username) {
      return json({ success: false, error: "Username is required", intent: "profile" });
    }

    try {
      await updateAdmin(admin.id, { username, email });
      return json({ success: true, message: "Profile updated successfully", intent: "profile" });
    } catch (error) {
      console.error("Update error:", error);
      return json({ success: false, error: "Failed to update profile", intent: "profile" });
    }
  }

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
      console.error("Update error:", error);
      return json({ success: false, error: "Failed to update password", intent: "security" });
    }
  }

  return json({ success: false, error: "Invalid intent" });
}

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  intent?: string;
}

export default function AdminSettings() {
  const loaderData = useLoaderData<typeof loader>();
  const admin = loaderData?.admin || { id: "", username: "admin", email: "", role: "admin", isFirebaseOnly: false };
  const summary = loaderData?.summary || {
    totalViews: 0,
    uniqueVisitors: 0,
    topPages: [],
    recentVisits: [],
  };
  const actionData = useActionData<typeof action>() as ActionResponse | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { sidebarBehavior, setSidebarBehavior } = useUIStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Manage your account settings and preferences.</p>
      </div>

      {/* Admin Layout & Sidebar Preferences */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <Layout className="text-zinc-600 dark:text-zinc-400" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Admin Interface & Sidebar</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Configure how the admin navigation sidebar behaves across page visits.</p>
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
              className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all cursor-pointer ${
                sidebarBehavior === "always-open"
                  ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80 shadow-xs"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              <SidebarIcon className="mt-0.5 shrink-0 text-zinc-700 dark:text-zinc-300" size={18} />
              <div>
                <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Always Open (Default)</div>
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
              className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all cursor-pointer ${
                sidebarBehavior === "always-closed"
                  ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80 shadow-xs"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              <Layout className="mt-0.5 shrink-0 text-zinc-700 dark:text-zinc-300" size={18} />
              <div>
                <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Keep Closed / Compact</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Sidebar stays collapsed by default and only expands on demand when you toggle it.
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <User className="text-indigo-600 dark:text-indigo-400" size={20} />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Profile Information</h2>
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

          {actionData?.intent === "profile" && (
            <div className={`text-sm ${actionData.success ? "text-green-600" : "text-red-600"}`}>
              {actionData.success ? actionData.message : actionData.error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Profile
            </Button>
          </div>
        </Form>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <Shield className="text-emerald-600 dark:text-emerald-400" size={20} />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Security</h2>
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
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
          </div>

          {actionData?.intent === "security" && (
            <div className={`text-sm ${actionData.success ? "text-green-600" : "text-red-600"}`}>
              {actionData.success ? actionData.message : actionData.error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="outline" disabled={isSubmitting} className="gap-2 border-red-200 hover:bg-red-50 text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20 dark:text-red-400">
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
              Update Password
            </Button>
          </div>
        </Form>
      </div>

      {/* Analytics & Telemetry Metrics Management */}
      <div id="analytics" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Analytics & Dashboard Metrics</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Overview of collected homepage metrics, telemetry, and visitor traffic counters.
              </p>
            </div>
          </div>
        </div>

        {/* Current Metric Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
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

          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
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
        <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-red-600 dark:text-red-400 shrink-0" size={20} />
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Reset Dashboard Analytics</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Permanently deletes all recorded page visit logs, country breakdown, and resets lifetime view counters back to 0.
              </p>
            </div>
          </div>

          <Form method="post" onSubmit={(e) => {
            if (!confirm("Are you sure you want to reset all dashboard analytics and page view counters to 0? This cannot be undone.")) {
              e.preventDefault();
            }
          }}>
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

        {actionData?.intent === "reset-analytics" && (
          <div className={`text-sm ${actionData.success ? "text-green-600 dark:text-green-400" : "text-red-600"}`}>
            {actionData.success ? actionData.message : actionData.error}
          </div>
        )}
      </div>
    </div>
  );
}
