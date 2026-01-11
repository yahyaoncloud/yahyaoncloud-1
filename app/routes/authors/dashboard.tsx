import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireAuthor } from '~/utils/author-auth.server';
import { getAuthorStats } from '~/Services/author-management.server';
import { prisma } from '~/utils/prisma.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const author = await requireAuthor(request);
  
  // Get author's full details
  const authorDetails = await prisma.author.findUnique({
    where: { authorId: author.authorId }
  });
  
  if (!authorDetails?.userId) {
    return json({ author, stats: { totalPosts: 0, publishedPosts: 0, draftPosts: 0 }, recentPosts: [] });
  }
  
  // Get statistics
  const stats = await getAuthorStats(authorDetails.userId);
  
  // Get recent posts
  const recentPosts = await prisma.post.findMany({
    where: { authorId: authorDetails.userId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      views: true,
      likes: true,
      updatedAt: true
    }
  });
  
  return json({ author, stats, recentPosts });
}

export default function AuthorDashboard() {
  const { author, stats, recentPosts } = useLoaderData<typeof loader>();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {author.username}!</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">Here's an overview of your content</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Posts</div>
          <div className="text-3xl font-bold mt-2">{stats.totalPosts}</div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Published</div>
          <div className="text-3xl font-bold mt-2 text-green-600">{stats.publishedPosts}</div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Drafts</div>
          <div className="text-3xl font-bold mt-2 text-amber-600">{stats.draftPosts}</div>
        </div>
      </div>
      
      {/* Recent Posts */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
        
        {recentPosts.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No posts yet. Start creating!</p>
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-4 last:border-0">
                <div>
                  <h3 className="font-medium">{post.title}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className={post.status === 'published' ? 'text-green-600' : 'text-amber-600'}>
                      {post.status}
                    </span>
                    <span>{post.views} views</span>
                    <span>{post.likes} likes</span>
                  </div>
                </div>
                <div className="text-sm text-zinc-500">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
