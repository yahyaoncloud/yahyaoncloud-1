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
import { TrendingUp, Users, Activity, Target, Clock, Globe } from "lucide-react";

// Mock data - replace with actual data from your API
const analyticsStats = {
    totalSessions: 32540,
    bounceRate: 42,
    conversionRate: 3.8,
    avgSessionDuration: 245,
};

const dailySessions = [
    { day: 'Mon', sessions: 4500 },
    { day: 'Tue', sessions: 5200 },
    { day: 'Wed', sessions: 4800 },
    { day: 'Thu', sessions: 5500 },
    { day: 'Fri', sessions: 6000 },
    { day: 'Sat', sessions: 4200 },
    { day: 'Sun', sessions: 3800 },
];

const pagePerformance = [
    { page: 'Homepage', views: 15234, avgTime: 180 },
    { page: 'Product', views: 9876, avgTime: 220 },
    { page: 'Pricing', views: 7654, avgTime: 150 },
    { page: 'Blog', views: 5432, avgTime: 300 },
    { page: 'Contact', views: 3210, avgTime: 120 },
];

const userDemographics = [
    { name: '18-24', value: 25 },
    { name: '25-34', value: 35 },
    { name: '35-44', value: 20 },
    { name: '45-54', value: 15 },
    { name: '55+', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const loader: LoaderFunction = async ({ request }) => {
    await requireAdminUser(request);

    // In a real app, you would fetch actual data here
    return json({
        analyticsStats,
        dailySessions,
        pagePerformance,
        userDemographics,
    });
};

export default function AdminAnalytics() {
    const { analyticsStats, dailySessions, pagePerformance, userDemographics } = useLoaderData<typeof loader>();

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
                <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
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
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Website performance overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Sessions"
                    value={analyticsStats.totalSessions}
                    icon={Activity}
                    trend="+15% from last week"
                />
                <StatCard
                    title="Bounce Rate"
                    value={`${analyticsStats.bounceRate}%`}
                    icon={Users}
                    trend="-5% from last week"
                />
                <StatCard
                    title="Conversion Rate"
                    value={`${analyticsStats.conversionRate}%`}
                    icon={Target}
                    trend="+2.1% from last week"
                />
                <StatCard
                    title="Avg. Session Duration"
                    value={`${analyticsStats.avgSessionDuration}s`}
                    icon={Clock}
                    description="Average time per session"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Daily Sessions Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Daily Sessions</CardTitle>
                        <CardDescription>Session trends for the past week</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2 text-zinc-900">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailySessions}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="sessions"
                                    stroke="#0088FE"
                                    strokeWidth={2}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* User Demographics */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>User Demographics</CardTitle>
                        <CardDescription>Distribution by age group</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userDemographics}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label
                                >
                                    {userDemographics.map((entry, index) => (
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

            {/* Page Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Page Performance</CardTitle>
                    <CardDescription>Most visited pages in the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pagePerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="page" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="views" fill="#0088FE" name="Page Views" />
                            <Bar dataKey="avgTime" fill="#00C49F" name="Avg. Time (s)" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Recent Activity and Traffic Sources */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest user actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { action: 'New user signup', time: '1 hour ago', user: 'System' },
                                { action: 'Purchase completed', time: '3 hours ago', user: 'Guest' },
                                { action: 'Form submission', time: '5 hours ago', user: 'User123' },
                                { action: 'Page view spike', time: '12 hours ago', user: 'System' },
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
                        <CardTitle>Traffic Sources</CardTitle>
                        <CardDescription>Sources of website traffic</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { source: 'Direct', percentage: '40%', status: 'Stable' },
                                { source: 'Search', percentage: '30%', status: 'Growing' },
                                { source: 'Social', percentage: '20%', status: 'Stable' },
                                { source: 'Referral', percentage: '10%', status: 'Declining' },
                            ].map((item, index) => (
                                <div key={index} className="flex items-center space-x-4">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.source}</p>
                                        <p className="text-sm text-muted-foreground">{item.percentage}</p>
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full ${item.status === 'Stable' ? 'bg-blue-100 text-blue-800' :
                                        item.status === 'Growing' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
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