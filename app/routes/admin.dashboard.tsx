import { useState, useMemo } from "react";
import {
  BarChart3,
  Users,
  FileText,
  Eye,
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  Search,
  Calendar,
  MessageCircle,
  Heart,
  MoreHorizontal,
  PieChart,
  ArrowUp,
  ArrowDown,
  HandHeart,
} from "lucide-react";
import { json, useLoaderData } from "@remix-run/react";

// -------------------- Loader --------------------
export const loader = async () => {
  return json({
    stats: {
      totalPosts: 47,
      totalViews: 12543,
      totalUsers: 289,
      engagement: 8.2,
      postsChange: 12,
      viewsChange: 23,
      usersChange: -5,
      engagementChange: 15,
    },
    recentPosts: [
      {
        id: 1,
        title: "Getting Started with Kubernetes in Production",
        category: "DevOps",
        views: 1234,
        status: "published",
        publishedAt: "2025-01-15",
        author: "Yahya",
        comments: 12,
        likes: 45,
      },
    ],
    categories: [
      { name: "DevOps", count: 12, color: "bg-indigo-600" },
      { name: "Frontend", count: 8, color: "bg-emerald-600" },
      { name: "Cloud", count: 15, color: "bg-purple-600" },
      { name: "Architecture", count: 9, color: "bg-orange-600" },
      { name: "Backend", count: 6, color: "bg-rose-600" },
    ],
  });
};

// -------------------- Dashboard --------------------
export default function Dashboard() {
  const { stats, recentPosts, categories } = useLoaderData();
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "analytics" | "categories">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredPosts = useMemo(
    () =>
      recentPosts.filter((post) => {
        const matchesSearch =
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === "all" || post.status === selectedFilter;
        return matchesSearch && matchesFilter;
      }),
    [recentPosts, searchQuery, selectedFilter]
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-zinc-800 rounded-lg p-1 w-fit">
          {["overview", "posts", "analytics", "categories"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Posts" value={stats.totalPosts} change={stats.postsChange} icon={FileText} trend="up" />
              <StatCard title="Total Views" value={stats.totalViews} change={stats.viewsChange} icon={Eye} trend="up" />
              <StatCard title="Subscribers" value={stats.totalUsers} change={Math.abs(stats.usersChange)} icon={Users} trend="down" />
              <StatCard title="Engagement" value={`${stats.engagement}%`} change={stats.engagementChange} icon={TrendingUp} trend="up" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card title="Recent Posts">
                  {recentPosts.map((post) => (
                    <PostRow key={post.id} post={post} />
                  ))}
                </Card>
              </div>
              <div className="space-y-6">
                <Card title="Top Categories">
                  {categories.map((category) => (
                    <div key={category.name} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${category.color}`} />
                        <span className="text-zinc-300">{category.name}</span>
                      </div>
                      <span className="text-zinc-400 text-sm">{category.count}</span>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" /> All Posts
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Manage and organize your blog content ({recentPosts.length} total)
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            <Card>
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => <PostRow key={post.id} post={post} />)
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-100 mb-2">No posts found</h3>
                  <p className="text-zinc-400">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------- Components --------------------
function StatCard({ title, value, change, icon: Icon, trend }: any) {
  return (
    <div className="p-4 bg-zinc-800 rounded-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-900/20 rounded-md">
            <Icon className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-medium text-zinc-300">{title}</h3>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
          {trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {change}%
        </div>
      </div>
      <div className="text-xl font-bold text-zinc-100">
        {typeof value === "number" && value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
      </div>
    </div>
  );
}

function PostRow({ post }: any) {
  return (
    <div className="p-4 group bg-zinc-800 rounded-md flex justify-between items-center gap-4 hover:bg-zinc-700 transition">
      <div className="flex-1 min-w-0">
        <h4 className="text-zinc-100 font-medium truncate">{post.title}</h4>
        <p className="text-sm text-zinc-400">{post.category}</p>
      </div>
      <div className="flex items-center gap-2 text-zinc-400 text-sm">
        <Eye className="w-4 h-4" /> {post.views}
        <MessageCircle className="w-4 h-4" /> {post.comments}
        <Heart className="w-4 h-4" /> {post.likes}
      </div>
      <div className="flex gap-2">
        <button className="p-1 text-zinc-400 hover:text-indigo-400 rounded-md hover:bg-indigo-900/20">
          <Edit3 className="w-4 h-4" />
        </button>
        <button className="p-1 text-zinc-400 hover:text-red-400 rounded-md hover:bg-red-900/20">
          <Trash2 className="w-4 h-4" />
        </button>
        <button className="p-1 text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-700">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-zinc-800 rounded-md p-4 space-y-3">
      {title && (
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="w-4 h-4 text-indigo-400" />}
          <h3 className="font-medium text-zinc-100">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}
