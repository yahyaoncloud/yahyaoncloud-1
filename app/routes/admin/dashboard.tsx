import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Briefcase, FileText, Globe, Settings, Users, Activity, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { getAnalyticsSummary } from "~/Services/analytics.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const summary = await getAnalyticsSummary();
  return json({ summary });
};

export default function AdminDashboard() {
  const { summary } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Welcome back to your administration panel.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalViews}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Lifetime views
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.uniqueVisitors}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Based on IP Hash
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Top Pages */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.topPages.map((page) => (
                <div key={page.path} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{page.path}</p>
                  </div>
                  <div className="ml-auto font-medium">{page.count} views</div>
                </div>
              ))}
              {summary.topPages.length === 0 && (
                <p className="text-sm text-zinc-500">No data available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shortcuts */}
        <div className="col-span-3 space-y-4">
             <Link to="/admin/posts" className="block">
                <Card className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Manage Posts</CardTitle>
                        <FileText className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-zinc-500">Create, edit, or delete blog posts.</p>
                    </CardContent>
                </Card>
            </Link>
             <Link to="/admin/settings" className="block">
                <Card className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Site Settings</CardTitle>
                        <Settings className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                         <p className="text-xs text-zinc-500">Global configuration.</p>
                    </CardContent>
                </Card>
            </Link>
        </div>
      </div>
      
      {/* Recent Activity */}
       <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest visits to your site.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {summary.recentVisits.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0 border-zinc-100 dark:border-zinc-800">
                        <div>
                             <p className="text-sm font-medium">{visit.path}</p>
                             <p className="text-xs text-zinc-500">
                                {visit.device || 'Unknown Device'} • {visit.country || 'Unknown Location'}
                             </p>
                        </div>
                        <div className="text-xs text-zinc-500">
                            {new Date(visit.createdAt).toLocaleString()}
                        </div>
                    </div>
                ))}
                 {summary.recentVisits.length === 0 && (
                     <p className="text-sm text-zinc-500">No recent activity recorded.</p>
                 )}
             </div>
          </CardContent>
       </Card>
      
    </div>
  );
}
