// Admin Posts - Manage blog posts
import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useSearchParams, useNavigation } from "@remix-run/react";
import { 
  getPosts, 
  deletePost, 
  publishPost, 
  unpublishPost 
} from "~/Services/post.prisma.server";
import { Button } from "~/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "~/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "~/components/ui/dropdown-menu";
import { 
  Plus, 
  Trash2, 
  Edit, 
  MoreVertical, 
  Eye, 
  EyeOff, 
  Search,
  FileText,
  Filter
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const search = url.searchParams.get("q") || undefined;
  const status = url.searchParams.get("status") || undefined;
  
  const { posts, total, totalPages } = await getPosts({
    page,
    limit: 10,
    search,
    status
  });
  
  return json({ posts, total, page, totalPages });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const id = formData.get("id") as string;

  try {
    if (intent === "delete") {
      await deletePost(id);
      return json({ success: true, message: "Post deleted" });
    }
    
    if (intent === "publish") {
      await publishPost(id);
      return json({ success: true, message: "Post published" });
    }
    
    if (intent === "unpublish") {
      await unpublishPost(id);
      return json({ success: true, message: "Post unpublished" });
    }

    return json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Post action error:", error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "An error occurred" 
    }, { status: 500 });
  }
}

export default function AdminPosts() {
  const { posts, total, page, totalPages } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
    }
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleFilterStatus = (status: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Posts</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your blog content ({total} total)</p>
        </div>
        <Link to="/admin/post/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto">
            <Plus size={16} className="mr-2" /> New Post
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search posts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleFilterStatus(null)}
            className={!searchParams.get("status") ? "bg-zinc-100 dark:bg-zinc-800" : ""}
          >
            All
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleFilterStatus("published")}
            className={searchParams.get("status") === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : ""}
          >
            Published
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleFilterStatus("draft")}
            className={searchParams.get("status") === "draft" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" : ""}
          >
            Drafts
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Views</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length > 0 ? (
              posts.map((post: any) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-md">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-16 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                        {post.coverImage && (
                          <img 
                            src={post.coverImage} 
                            alt="" 
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        )}
                      </div>
                      <div>
                        <Link 
                          to={`/admin/post/edit/${post.slug}`}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                        >
                          {post.title}
                        </Link>
                        <div className="text-xs text-zinc-500 mt-1 line-clamp-1">
                          /{post.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.author ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{post.author.name || "Unknown"}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 italic">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : post.status === 'draft'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                          : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {post.status}
                    </span>
                    {post.featured && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300">
                        Featured
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {new Date(post.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.views?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Link to={`/admin/post/edit/${post.slug}`}>
                          <DropdownMenuItem>
                            <Edit size={14} className="mr-2" /> Edit
                          </DropdownMenuItem>
                        </Link>
                        <a href={`/blog/post/${post.slug}`} target="_blank" rel="noreferrer">
                          <DropdownMenuItem>
                            <FileText size={14} className="mr-2" /> View Public
                          </DropdownMenuItem>
                        </a>
                        <DropdownMenuSeparator />
                        <Form method="post">
                          <input type="hidden" name="id" value={post.id} />
                          {post.status === 'published' ? (
                            <button type="submit" name="intent" value="unpublish" className="w-full">
                              <DropdownMenuItem className="cursor-pointer">
                                <EyeOff size={14} className="mr-2" /> Unpublish
                              </DropdownMenuItem>
                            </button>
                          ) : (
                            <button type="submit" name="intent" value="publish" className="w-full">
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye size={14} className="mr-2" /> Publish
                              </DropdownMenuItem>
                            </button>
                          )}
                        </Form>
                        <DropdownMenuSeparator />
                        <Form 
                          method="post" 
                          onSubmit={(e) => !confirm("Delete this post?") && e.preventDefault()}
                        >
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="id" value={post.id} />
                          <button type="submit" className="w-full">
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                              <Trash2 size={14} className="mr-2" /> Delete
                            </DropdownMenuItem>
                          </button>
                        </Form>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-zinc-500">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">No posts found</p>
                    <p className="text-sm">
                      {searchTerm ? `No results for "${searchTerm}"` : "Get started by creating your first blog post."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button 
            variant="outline" 
            disabled={page <= 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("page", (page - 1).toString());
              setSearchParams(params);
            }}
          >
            Previous
          </Button>
          <div className="flex items-center px-4 text-sm font-medium">
            Page {page} of {totalPages}
          </div>
          <Button 
            variant="outline" 
            disabled={page >= totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("page", (page + 1).toString());
              setSearchParams(params);
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
