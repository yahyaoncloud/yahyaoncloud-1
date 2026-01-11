import { motion } from "framer-motion";
import { useTheme } from "~/Contexts/ThemeContext";
import { Link, useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Edit, Trash2, Eye, Clock, Calendar, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { marked } from "marked";
import { useEffect, useState } from "react";
import dummyImage from "~/assets/yahya_glass.png";
import { getPostById, updatePost, getPostBySlug } from "~/Services/post.prisma.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea"; // Assuming you have this
import toast from "react-hot-toast";

// Configure marked for safe markdown rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Loader for fetching post details using Prisma
export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params; 
  if (!slug) return json({ error: "Post Slug/ID is required" }, { status: 400 });

  try {
    // Try finding by ID first, then slug
    let post = await getPostById(slug).catch(() => null);
    if (!post) {
        post = await getPostBySlug(slug);
    }

    if (!post) {
      return json({ error: "Post not found" }, { status: 404 });
    }
    return json({ post });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ error: "Failed to load post" }, { status: 500 });
  }
}

// Action for post operations
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();
  const postId = formData.get("id") as string;
  
  if (!postId) {
    return json({ error: "Post ID required" }, { status: 400 });
  }

  try {
    if (intent === "update") {
        const title = formData.get("title") as string;
        const slug = formData.get("slug") as string;
        const summary = formData.get("summary") as string;
        const content = formData.get("content") as string;
        const coverImage = formData.get("coverImage") as string;
        const status = formData.get("status") as string;
        
        await updatePost({
            id: postId,
            title,
            slug,
            summary,
            content,
            coverImage,
            status
        });
        return json({ success: true, message: "Post updated successfully", error: undefined });
    }

    return json({ success: false, error: "Invalid intent", message: undefined }, { status: 400 });
  } catch (error) {
    console.error("Action error:", error);
    return json({ success: false, error: error instanceof Error ? error.message : "Action failed", message: undefined }, { status: 500 });
  }
}

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default function AdminPostEdit() {
  const { theme } = useTheme();
  // Cast loader data to handle the union/optional fields safely
  const data = useLoaderData<typeof loader>() as { post?: any; error?: string };
  const { post, error } = data;
  
  const actionData = useActionData<typeof action>() as ActionResponse | undefined;
  const navigation = useNavigation();
  
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [currentContent, setCurrentContent] = useState(post?.content || "");

  useEffect(() => {
    if (actionData?.success && actionData.message) toast.success(actionData.message);
    if (actionData?.error) toast.error(actionData.error);
  }, [actionData]);

  // Convert markdown content to HTML with encoding handling
  useEffect(() => {
      try {
        const htmlContent = marked.parse(currentContent);
        setMarkdownContent(htmlContent as string);
      } catch (err) {
        console.error("Markdown parsing error:", err);
      }
  }, [currentContent]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-zinc-950" : "bg-zinc-50"}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link to="/admin/posts">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Edit Post</h1>
                    <p className="text-zinc-500 text-sm">Update your blog post content</p>
                </div>
            </div>
            {post && (
                <a href={`/blog/post/${post.slug}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="gap-2">
                        <Eye size={16} /> View Live
                    </Button>
                </a>
            )}
        </div>

        {post ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Column */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                        <Form method="post" className="space-y-4">
                            <input type="hidden" name="intent" value="update" />
                            <input type="hidden" name="id" value={post.id} />
                            
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" defaultValue={post.title} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input id="slug" name="slug" defaultValue={post.slug} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select 
                                        name="status" 
                                        id="status" 
                                        defaultValue={post.status}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950 dark:border-zinc-800"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="coverImage">Cover Image URL</Label>
                                <div className="flex gap-2">
                                    <Input id="coverImage" name="coverImage" defaultValue={post.coverImage} placeholder="https://..." />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="summary">Summary</Label>
                                <Textarea 
                                    id="summary" 
                                    name="summary" 
                                    defaultValue={post.summary} 
                                    className="h-20"
                                    placeholder="Brief description for SEO and cards"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Content (Markdown)</Label>
                                <Textarea 
                                    id="content" 
                                    name="content" 
                                    value={currentContent}
                                    onChange={(e) => setCurrentContent(e.target.value)}
                                    className="min-h-[400px] font-mono text-sm"
                                    placeholder="# Write your post here..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]">
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="space-y-6 hidden lg:block">
                     <div className="sticky top-6">
                        <h2 className="text-lg font-semibold mb-4 dark:text-zinc-200">Live Preview</h2>
                        <div className={`prose dark:prose-invert max-w-none bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-auto max-h-[calc(100vh-8rem)]`}>
                             <h1>{post.title}</h1>
                             {markdownContent ? (
                                 <div dangerouslySetInnerHTML={{ __html: markdownContent }} />
                             ) : (
                                 <p className="text-zinc-400 italic">Start typing to see preview...</p>
                             )}
                        </div>
                     </div>
                </div>
            </div>
        ) : (
            <div className="text-center py-20">
                <p>Post not found.</p>
            </div>
        )}
      </div>
    </div>
  );
}
