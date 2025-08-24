// routes/admin.dashboard.tsx
import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";
import { requireAdminUser } from "../utils/session.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { TrendingUp, Users, FileText, Eye, Clock, Calendar } from "lucide-react";

// Mock data - replace with actual data from your API
const blogStats = {
  totalPosts: 156,
  totalViews: 24567,
  totalUsers: 892,
  engagementRate: 78,
};

const monthlyViews = [
  { month: 'Jan', views: 1890 },
  { month: 'Feb', views: 2398 },
  { month: 'Mar', views: 3456 },
  { month: 'Apr', views: 4123 },
  { month: 'May', views: 5234 },
  { month: 'Jun', views: 6123 },
  { month: 'Jul', views: 7234 },
];

const postPerformance = [
  { title: 'React Best Practices', views: 3456, engagement: 89 },
  { title: 'CSS Grid Tutorial', views: 2890, engagement: 78 },
  { title: 'TypeScript Tips', views: 4123, engagement: 92 },
  { title: 'Remix Framework', views: 3123, engagement: 85 },
  { title: 'Firebase Auth', views: 2345, engagement: 76 },
];

const categoryDistribution = [
  { name: 'Tutorials', value: 35 },
  { name: 'News', value: 25 },
  { name: 'Reviews', value: 20 },
  { name: 'Opinions', value: 15 },
  { name: 'Others', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUser(request);

  // In a real app, you would fetch actual data here
  return json({
    blogStats,
    monthlyViews,
    postPerformance,
    categoryDistribution,
  });
};

export default function AdminDashboard() {
  const { blogStats, monthlyViews, postPerformance, categoryDistribution } = useLoaderData<typeof loader>();

  const StatCard = ({ title, value, icon: Icon, trend, description }: {
    title: string;
    value: number | string;
    icon: React.ComponentType<any>;
    trend?: string;
    description?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center">
            <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
            {trend}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground"> Blog's performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Posts"
          value={blogStats.totalPosts}
          icon={FileText}
          trend="+12% from last month"
        />
        <StatCard
          title="Total Views"
          value={blogStats.totalViews}
          icon={Eye}
          trend="+23% from last month"
        />
        <StatCard
          title="Total Users"
          value={blogStats.totalUsers}
          icon={Users}
          trend="+8% from last month"
        />
        <StatCard
          title="Engagement Rate"
          value={`${blogStats.engagementRate}%`}
          icon={Clock}
          description="Average time on page"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Monthly Views Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monthly Views</CardTitle>
            <CardDescription>Traffic overview for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 text-zinc-900 ">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#0088FE"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Posts by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
          <CardDescription>Most viewed content in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={postPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#0088FE" name="Views" />
              <Bar dataKey="engagement" fill="#00C49F" name="Engagement (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on your blog</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New post published', time: '2 hours ago', user: 'You' },
                { action: 'Comment approved', time: '4 hours ago', user: 'Moderator' },
                { action: 'User registered', time: '6 hours ago', user: 'System' },
                { action: 'Post updated', time: '1 day ago', user: 'You' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.user}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>Scheduled posts and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Weekly Newsletter', date: 'Tomorrow, 9:00 AM', status: 'Scheduled' },
                { title: 'Product Launch', date: 'Dec 25, 2024', status: 'Draft' },
                { title: 'Holiday Post', date: 'Dec 20, 2024', status: 'Ready' },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${item.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}