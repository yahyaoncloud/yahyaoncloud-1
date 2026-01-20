import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { requireAuthor } from '~/utils/author-auth.server';
import { getAuthorStats } from '~/Services/author-management.server';
import { prisma } from '~/utils/prisma.server';
import { FileText, PenTool, Eye, Archive, PlusCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';

export async function loader({ request }: LoaderFunctionArgs) {
  const author = await requireAuthor(request);
  
  // Get author's MongoDB ObjectId from the custom authorId
  const authorRecord = await prisma.author.findUnique({
    where: { authorId: author.authorId },
    select: { id: true }
  });
  
  if (!authorRecord) {
    throw new Response('Author not found', { status: 404 });
  }
  
  const mongoAuthorId = authorRecord.id;
  
  // Fetch stats for this author using MongoDB ObjectId
  const [totalPosts, publishedPosts, draftPosts] = await Promise.all([
    prisma.post.count({ where: { authorId: mongoAuthorId } }),
    prisma.post.count({ where: { authorId: mongoAuthorId, status: 'published' } }),
    prisma.post.count({ where: { authorId: mongoAuthorId, status: 'draft' } })
  ]);
  
  const stats = { totalPosts, publishedPosts, draftPosts };
  
  // Fetch recent posts for this author
  const recentPosts = await prisma.post.findMany({
    where: { authorId: mongoAuthorId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      views: true,
      updatedAt: true,
    }
  });
  
  return json({ author, stats, recentPosts });
}

export default function AuthorDashboard() {
  const { author, stats, recentPosts } = useLoaderData<typeof loader>();

  const statCards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'bg-blue-500' },
    { label: 'Published', value: stats.publishedPosts, icon: Eye, color: 'bg-green-500' },
    { label: 'Drafts', value: stats.draftPosts, icon: PenTool, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Welcome back, {author.username}!
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage your posts and assets from here.
          </p>
        </div>
        <Link to="/authors/post/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <PlusCircle size={16} className="mr-2" /> New Post
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Recent Posts</h2>
          <Link to="/authors/posts" className="text-sm text-indigo-600 hover:text-indigo-500">
            View All
          </Link>
        </div>
        
        {recentPosts.length > 0 ? (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {recentPosts.map((post: any) => (
              <Link
                key={post.id}
                to={`/authors/post/edit/${post.slug}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{post.title}</p>
                  <p className="text-xs text-zinc-500">
                    Updated {new Date(post.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : post.status === 'archived'
                        ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                  }`}>
                    {post.status}
                  </span>
                  <span className="text-sm text-zinc-500 flex items-center gap-1">
                    <Eye size={14} /> {post.views || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-zinc-500">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p>No posts yet. Start writing!</p>
            <Link to="/authors/post/create" className="text-indigo-600 hover:underline text-sm">
              Create your first post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
