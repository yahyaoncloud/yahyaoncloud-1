import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { getAuthorById } from "~/Services/author.prisma.server";
import { getPosts } from "~/Services/post.prisma.server";
import { getAllCategories } from "~/Services/post.prisma.server"; 
import { Button } from "~/components/ui/button";
import { AdminDataTable, type Column } from "~/components/AdminDataTable";
import { ArrowLeft, Mail, Globe, Linkedin, Github, Twitter, Shield, User as UserIcon, Calendar, Eye, ThumbsUp, Pencil as PencilIcon } from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
  const authorId = params.id;
  if (!authorId) throw new Error("Author ID is required");

  const author = await getAuthorById(authorId);
  if (!author) throw new Response("Author not found", { status: 404 });
  
  // Cast author to any because Prisma types might be stale after schema update
  // effectively bypassing "Property does not exist" errors until regeneration
  const castedAuthor = author as any;

  // Fetch posts associated with this author
  let postsData = { posts: [], total: 0 };
  
  if (castedAuthor.userId) {
     postsData = await getPosts({ authorId: castedAuthor.userId, limit: 100 });
  }

  const categories = await getAllCategories();

  return json({ author: castedAuthor, posts: postsData.posts, categories });
}

export default function AuthorDetail() {
  const { author, posts, categories } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // Helper to get category names
  const getCategoryNames = (ids: string[]) => {
    return ids.map(id => categories.find((c: any) => c.id === id)?.name).filter(Boolean).join(", ");
  };

  const columns: Column<any>[] = [
    { 
        header: "Title", 
        accessorKey: "title", 
        className: "font-medium w-1/3",
        cell: (item) => (
             <div className="flex flex-col">
                <span className="font-semibold">{item.title}</span>
                <span className="text-xs text-zinc-500">{item.slug}</span>
             </div>
        )
    },
    {
        header: "Type",
        accessorKey: "type",
        cell: (item) => <span className="capitalize text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{item.type.toLowerCase()}</span>
    },
    { 
        header: "Status", 
        accessorKey: "status",
        cell: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                item.status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-zinc-100 text-zinc-700'
            }`}>
                {item.status}
            </span>
        )
    },
    { 
        header: "Stats", 
        cell: (item) => (
            <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><Eye size={12} /> {item.views}</span>
                <span className="flex items-center gap-1"><ThumbsUp size={12} /> {item.likes}</span>
            </div>
        )
    },
    {
        header: "Date",
        accessorKey: "date",
        cell: (item) => <span className="text-zinc-500 whitespace-nowrap">{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
    },
    {
        header: "Action",
        cell: (item) => (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/blog/post/${item.slug}`);
                }}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
                View Post
            </Button>
        )
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation */}
        <Link to="/admin/authors" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Authors
        </Link>
        
        {/* Author Profile Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar */}
                <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-zinc-800 shadow-md overflow-hidden bg-zinc-100 shrink-0">
                    {author.avatar ? (
                        <img src={author.avatar} alt={author.authorName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500">
                            <UserIcon size={48} />
                        </div>
                    )}
                    {author.isAdmin && (
                        <div className="absolute bottom-2 right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg" title="Administrator">
                            <Shield size={16} fill="currentColor" />
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                                {author.authorName}
                            </h1>
                            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">
                                {author.authorProfession || "Contributor"}
                            </p>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => navigate("/admin/authors")}>
                                <PencilIcon size={14} className="mr-2"/> Edit Profile
                             </Button>
                        </div>
                    </div>

                    {author.description && (
                        <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
                            {author.description}
                        </p>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                         {author.email && (
                             <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                 <Mail size={16} className="text-zinc-400" /> {author.email}
                             </div>
                         )}
                         {author.website && (
                             <a href={author.website.startsWith('http') ? author.website : `https://${author.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                                 <Globe size={16} className="text-zinc-400" /> Website
                             </a>
                         )}
                         {author.location && (
                             <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                 <Calendar size={16} className="text-zinc-400" /> Joined {new Date(author.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                             </div>
                         )}
                         <div className="flex gap-3">
                            {author.linkedin && <a href={author.linkedin} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-[#0077b5] transition-colors"><Linkedin size={20} /></a>}
                            {author.github && <a href={author.github} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"><Github size={20} /></a>}
                            {author.twitter && <a href={author.twitter} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-[#1DA1F2] transition-colors"><Twitter size={20} /></a>}
                         </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    Posts by {author.authorName} <span className="text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">{posts.length}</span>
                </h2>
             </div>
             
             <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
                <AdminDataTable 
                    columns={columns}
                    data={posts}
                    emptyMessage="No posts found for this author."
                />
             </div>
        </div>

      </div>
    </div>
  );
}
