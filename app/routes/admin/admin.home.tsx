// import { useState } from "react";
// import {
//   BarChart3,
//   Users,
//   FileText,
//   Eye,
//   TrendingUp,
//   Plus,
//   Edit3,
//   Trash2,
//   Search,
//   Filter,
//   Calendar,
//   Clock,
//   Star,
//   MessageCircle,
//   Share2,
//   MoreHorizontal,
//   Settings,
//   Bell,
//   User,
//   Globe,
//   Heart,
//   ExternalLink,
//   Tag,
//   Bookmark,
//   Activity,
//   PieChart,
//   ArrowUp,
//   ArrowDown,
//   HandHeart,
// } from "lucide-react";

// const Dashboard = () => {
//   const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedFilter, setSelectedFilter] = useState("all");
//   const [activeTab, setActiveTab] = useState("overview");

//   // Mock data - replace with real data from your API
//   const stats = {
//     totalPosts: 47,
//     totalViews: 12543,
//     totalUsers: 289,
//     engagement: 8.2,
//     postsChange: 12,
//     viewsChange: 23,
//     usersChange: -5,
//     engagementChange: 15,
//   };

//   const recentPosts = [
//     {
//       id: 1,
//       title: "Getting Started with Kubernetes in Production",
//       category: "DevOps",
//       views: 1234,
//       status: "published",
//       publishedAt: "2025-01-15",
//       author: "Yahya",
//       comments: 12,
//       likes: 45,
//     },
//     {
//       id: 2,
//       title: "Advanced React Patterns for Modern Applications",
//       category: "Frontend",
//       views: 892,
//       status: "draft",
//       publishedAt: "2025-01-14",
//       author: "Yahya",
//       comments: 8,
//       likes: 32,
//     },
//     {
//       id: 3,
//       title: "Cloud Architecture Best Practices",
//       category: "Cloud",
//       views: 756,
//       status: "published",
//       publishedAt: "2025-01-13",
//       author: "Yahya",
//       comments: 15,
//       likes: 67,
//     },
//     {
//       id: 4,
//       title: "Microservices Communication Patterns",
//       category: "Architecture",
//       views: 643,
//       status: "scheduled",
//       publishedAt: "2025-01-20",
//       author: "Yahya",
//       comments: 0,
//       likes: 0,
//     },
//     {
//       id: 5,
//       title: "Docker Best Practices and Security",
//       category: "DevOps",
//       views: 523,
//       status: "published",
//       publishedAt: "2025-01-12",
//       author: "Yahya",
//       comments: 7,
//       likes: 28,
//     },
//     {
//       id: 6,
//       title: "GraphQL vs REST: When to Use What",
//       category: "Backend",
//       views: 445,
//       status: "draft",
//       publishedAt: "2025-01-11",
//       author: "Yahya",
//       comments: 3,
//       likes: 19,
//     },
//   ];

//   const categories = [
//     { name: "DevOps", count: 12, color: "bg-blue-500" },
//     { name: "Frontend", count: 8, color: "bg-green-500" },
//     { name: "Cloud", count: 15, color: "bg-purple-500" },
//     { name: "Architecture", count: 9, color: "bg-orange-500" },
//     { name: "Backend", count: 6, color: "bg-red-500" },
//   ];

//   const analytics = [
//     { day: "Mon", views: 120, engagement: 8.2 },
//     { day: "Tue", views: 150, engagement: 9.1 },
//     { day: "Wed", views: 190, engagement: 7.8 },
//     { day: "Thu", views: 240, engagement: 10.3 },
//     { day: "Fri", views: 200, engagement: 8.9 },
//     { day: "Sat", views: 160, engagement: 6.5 },
//     { day: "Sun", views: 180, engagement: 7.2 },
//   ];

//   const StatCard = ({ title, value, change, icon: Icon, trend }) => (
//     <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
//             <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//           </div>
//           <h3 className="font-medium text-gray-700 dark:text-gray-300">
//             {title}
//           </h3>
//         </div>
//         <div
//           className={`flex items-center gap-1 text-sm font-medium ${
//             trend === "up"
//               ? "text-green-600 dark:text-green-400"
//               : "text-red-600 dark:text-red-400"
//           }`}
//         >
//           {trend === "up" ? (
//             <ArrowUp className="w-4 h-4" />
//           ) : (
//             <ArrowDown className="w-4 h-4" />
//           )}
//           {change}%
//         </div>
//       </div>
//       <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//         {typeof value === "number" && value > 999
//           ? `${(value / 1000).toFixed(1)}k`
//           : value}
//       </div>
//     </div>
//   );

//   const PostRow = ({ post }) => (
//     <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group">
//       <div className="flex items-center justify-between">
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-3 mb-2">
//             <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate">
//               {post.title}
//             </h3>
//             <span
//               className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
//                 post.status === "published"
//                   ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
//                   : post.status === "draft"
//                   ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
//                   : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
//               }`}
//             >
//               {post.status}
//             </span>
//           </div>
//           <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
//             <span className="flex items-center gap-1">
//               <Tag className="w-4 h-4" />
//               {post.category}
//             </span>
//             <span className="flex items-center gap-1">
//               <Eye className="w-4 h-4" />
//               {post.views.toLocaleString()}
//             </span>
//             <span className="flex items-center gap-1">
//               <MessageCircle className="w-4 h-4" />
//               {post.comments}
//             </span>
//             <span className="flex items-center gap-1">
//               <Heart className="w-4 h-4" />
//               {post.likes}
//             </span>
//             <span className="flex items-center gap-1">
//               <Calendar className="w-4 h-4" />
//               {new Date(post.publishedAt).toLocaleDateString()}
//             </span>
//           </div>
//         </div>
//         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//           <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
//             <Edit3 className="w-4 h-4" />
//           </button>
//           <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
//             <Trash2 className="w-4 h-4" />
//           </button>
//           <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
//             <MoreHorizontal className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   const TabButton = ({ id, label, active, onClick }) => (
//     <button
//       onClick={() => onClick(id)}
//       className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
//         active
//           ? "bg-blue-600 text-white shadow-sm"
//           : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
//       }`}
//     >
//       {label}
//     </button>
//   );

//   const filteredPosts = recentPosts.filter((post) => {
//     const matchesSearch =
//       post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       post.category.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesFilter =
//       selectedFilter === "all" || post.status === selectedFilter;
//     return matchesSearch && matchesFilter;
//   });

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Navigation Tabs */}
//         <div className="flex gap-2 mb-8 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
//           <TabButton
//             id="overview"
//             label="Overview"
//             active={activeTab === "overview"}
//             onClick={setActiveTab}
//           />
//           <TabButton
//             id="posts"
//             label="Posts"
//             active={activeTab === "posts"}
//             onClick={setActiveTab}
//           />
//           <TabButton
//             id="analytics"
//             label="Analytics"
//             active={activeTab === "analytics"}
//             onClick={setActiveTab}
//           />
//           <TabButton
//             id="categories"
//             label="Categories"
//             active={activeTab === "categories"}
//             onClick={setActiveTab}
//           />
//         </div>

//         {/* Overview Tab */}
//         {activeTab === "overview" && (
//           <div className="space-y-8">
//             {/* Stats Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <StatCard
//                 title="Total Posts"
//                 value={stats.totalPosts}
//                 change={stats.postsChange}
//                 icon={FileText}
//                 trend="up"
//               />
//               <StatCard
//                 title="Total Views"
//                 value={stats.totalViews}
//                 change={stats.viewsChange}
//                 icon={Eye}
//                 trend="up"
//               />
//               <StatCard
//                 title="Subscribers"
//                 value={stats.totalUsers}
//                 change={Math.abs(stats.usersChange)}
//                 icon={Users}
//                 trend="down"
//               />
//               <StatCard
//                 title="Engagement"
//                 value={`${stats.engagement}%`}
//                 change={stats.engagementChange}
//                 icon={TrendingUp}
//                 trend="up"
//               />
//             </div>

//             {/* Quick Actions & Recent Activity */}
//             <div className="grid lg:grid-cols-3 gap-8">
//               {/* Recent Posts */}
//               <div className="lg:col-span-2">
//                 <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
//                   <div className="flex items-center justify-between mb-6">
//                     <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
//                       <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                       Recent Posts
//                     </h2>
//                     <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
//                       View all
//                     </button>
//                   </div>
//                   <div className="space-y-4">
//                     {recentPosts.slice(0, 4).map((post) => (
//                       <PostRow key={post.id} post={post} />
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Sidebar */}
//               <div className="space-y-6">
//                 {/* Top Categories */}
//                 <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
//                   <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
//                     <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//                     Top Categories
//                   </h3>
//                   <div className="space-y-3">
//                     {categories.slice(0, 5).map((category) => (
//                       <div
//                         key={category.name}
//                         className="flex items-center justify-between"
//                       >
//                         <div className="flex items-center gap-3">
//                           <div
//                             className={`w-3 h-3 rounded-full ${category.color}`}
//                           />
//                           <span className="text-gray-700 dark:text-gray-300 font-medium">
//                             {category.name}
//                           </span>
//                         </div>
//                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                           {category.count}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Quick Actions */}
//                 <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
//                   <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
//                     <Star className="w-5 h-5 text-yellow-500" />
//                     Quick Actions
//                   </h3>
//                   <div className="space-y-3">
//                     <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                       <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                       <span className="text-gray-700 dark:text-gray-300">
//                         Create New Post
//                       </span>
//                     </button>
//                     <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                       <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
//                       <span className="text-gray-700 dark:text-gray-300">
//                         Manage Categories
//                       </span>
//                     </button>
//                     <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                       <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//                       <span className="text-gray-700 dark:text-gray-300">
//                         View Analytics
//                       </span>
//                     </button>
//                   </div>
//                 </div>

//                 {/* Palestine Support Section */}
//                 <div className="bg-gradient-to-br from-red-50 to-green-50 dark:from-red-900/10 dark:to-green-900/10 rounded-xl p-6 border border-red-200/50 dark:border-red-800/20">
//                   <div className="flex items-center gap-2 mb-3">
//                     <HandHeart className="w-5 h-5 text-red-500" />
//                     <h3 className="font-semibold text-gray-900 dark:text-gray-100">
//                       Support Palestine
//                     </h3>
//                   </div>
//                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//                     Your platform continues to raise awareness and support for
//                     Palestine through technology and education.
//                   </p>
//                   <div className="flex gap-2">
//                     <button className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
//                       <Heart className="w-3 h-3" />
//                       Donate
//                     </button>
//                     <button className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
//                       <Globe className="w-3 h-3" />
//                       Learn
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Posts Tab */}
//         {activeTab === "posts" && (
//           <div className="space-y-6">
//             {/* Post Management Header */}
//             <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
//                   <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//                   All Posts
//                 </h2>
//                 <p className="text-gray-600 dark:text-gray-400 mt-1">
//                   Manage and organize your blog content ({recentPosts.length}{" "}
//                   total)
//                 </p>
//               </div>
//               <div className="flex gap-3 w-full sm:w-auto">
//                 <div className="relative flex-1 sm:w-64">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                   <input
//                     type="text"
//                     placeholder="Search posts..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   />
//                 </div>
//                 <select
//                   value={selectedFilter}
//                   onChange={(e) => setSelectedFilter(e.target.value)}
//                   className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="published">Published</option>
//                   <option value="draft">Draft</option>
//                   <option value="scheduled">Scheduled</option>
//                 </select>
//               </div>
//             </div>

//             {/* Posts List */}
//             <div className="space-y-4">
//               {filteredPosts.length > 0 ? (
//                 filteredPosts.map((post) => (
//                   <PostRow key={post.id} post={post} />
//                 ))
//               ) : (
//                 <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
//                   <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
//                     No posts found
//                   </h3>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     Try adjusting your search or filter criteria
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Analytics Tab */}
//         {activeTab === "analytics" && (
//           <div className="space-y-8">
//             <div className="flex items-center justify-between">
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
//                 <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
//                 Analytics Dashboard
//               </h2>
//               <select
//                 value={selectedTimeframe}
//                 onChange={(e) => setSelectedTimeframe(e.target.value)}
//                 className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="7d">Last 7 days</option>
//                 <option value="30d">Last 30 days</option>
//                 <option value="90d">Last 90 days</option>
//               </select>
//             </div>

//             {/* Analytics Overview */}
//             <div className="grid lg:grid-cols-2 gap-8">
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
//                   <TrendingUp className="w-5 h-5 text-blue-600" />
//                   Views Over Time
//                 </h3>
//                 <div className="h-64 flex items-end justify-between bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 gap-2">
//                   {analytics.map((day, index) => (
//                     <div
//                       key={day.day}
//                       className="flex flex-col items-center flex-1"
//                     >
//                       <div
//                         className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-700 hover:to-blue-500"
//                         style={{ height: `${(day.views / 240) * 200}px` }}
//                       />
//                       <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
//                         {day.day}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
//                   Peak: 240 views on Thursday
//                 </div>
//               </div>

//               <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
//                   <Activity className="w-5 h-5 text-green-600" />
//                   Engagement Rate
//                 </h3>
//                 <div className="h-64 flex items-center justify-center">
//                   <div className="relative w-48 h-48">
//                     <div className="w-full h-full rounded-full border-8 border-gray-200 dark:border-gray-700"></div>
//                     <div
//                       className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-green-500 transform -rotate-90"
//                       style={{
//                         clipPath:
//                           "polygon(50% 50%, 50% 0%, 100% 0%, 100% 35%, 50% 50%)",
//                       }}
//                     ></div>
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <div className="text-center">
//                         <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
//                           {stats.engagement}%
//                         </div>
//                         <div className="text-sm text-gray-600 dark:text-gray-400">
//                           Avg. Engagement
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Top Performing Posts */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
//                 <Star className="w-5 h-5 text-yellow-500" />
//                 Top Performing Posts
//               </h3>
//               <div className="space-y-3">
//                 {recentPosts
//                   .sort((a, b) => b.views - a.views)
//                   .slice(0, 5)
//                   .map((post, index) => (
//                     <div
//                       key={post.id}
//                       className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                     >
//                       <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
//                         {index + 1}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
//                           {post.title}
//                         </h4>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           {post.category} • {post.views.toLocaleString()} views
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
//                           {post.likes} likes
//                         </div>
//                         <div className="text-xs text-gray-600 dark:text-gray-400">
//                           {post.comments} comments
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Categories Tab */}
//         {activeTab === "categories" && (
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
//                 <Tag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
//                 Categories
//               </h2>
//               <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm">
//                 <Plus className="w-4 h-4" />
//                 Add Category
//               </button>
//             </div>

//             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {categories.map((category) => (
//                 <div
//                   key={category.name}
//                   className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group"
//                 >
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-4 h-4 rounded-full ${category.color} shadow-sm`}
//                       />
//                       <h3 className="font-semibold text-gray-900 dark:text-gray-100">
//                         {category.name}
//                       </h3>
//                     </div>
//                     <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100">
//                       <MoreHorizontal className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
//                     {category.count}
//                   </div>
//                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//                     {category.count === 1 ? "post" : "posts"} published
//                   </p>
//                   <div className="flex gap-2">
//                     <button className="flex-1 text-sm px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
//                       Edit
//                     </button>
//                     <button className="px-3 py-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
