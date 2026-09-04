import { motion } from "framer-motion";
import { useTheme } from "~/Contexts/ThemeContext";
import { Link, useLoaderData, Form, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { LuPencil as Edit, LuTrash2 as Trash2, LuEye as Eye, LuClock as Clock, LuCalendar as Calendar, LuSave as Save, LuArrowLeft as ArrowLeft, LuImage as ImageIcon, LuPlus as Plus, LuCopy as Copy, LuFileJson as FileJson, LuTriangleAlert as AlertTriangle } from "react-icons/lu";
import { marked } from "marked";
import { useEffect, useState, useRef } from "react";
import { requireAdmin } from "~/utils/admin-auth.server";
import { prisma } from "~/utils/prisma.server";
import { saveBlogPostToSupabase, getBlogPostFromSupabase } from "~/Services/supabase-storage.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { proseClasses } from "~/styles/prose";
import CloudinaryImageUpload from "~/components/CloudinaryImageUpload";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const { slug } = params; 
  
  if (!slug) return json({ error: "Post Slug/ID is required", post: null, categories: [], tags: [] }, { status: 400 });

  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    
    let post = null;
    if (isObjectId) {
      post = await prisma.post.findUnique({ where: { id: slug } }).catch(() => null);
    }
    
    if (!post) {
      post = await prisma.post.findUnique({ where: { slug } }).catch(() => null);
    }

    // Try Supabase Storage if post content is missing
    if (!post) {
      const supabasePost = await getBlogPostFromSupabase(slug);
      if (supabasePost) {
        post = {
          id: supabasePost.slug,
          title: supabasePost.title,
          slug: supabasePost.slug,
          summary: supabasePost.summary || "",
          content: supabasePost.content,
          coverImage: supabasePost.coverImage || "",
          status: supabasePost.status || "published",
          featured: supabasePost.featured || false,
          date: new Date(supabasePost.date),
          categoryIds: [],
          tagIds: [],
          createdAt: new Date(supabasePost.date),
        };
      }
    }

    if (!post) {
      const { getBlogPostBySlug } = await import("~/Services/content.server");
      const mdPost = await getBlogPostBySlug(slug);
      if (mdPost) {
        post = {
          id: mdPost.slug,
          title: mdPost.title,
          slug: mdPost.slug,
          summary: mdPost.summary || "",
          content: mdPost.content,
          coverImage: "",
          status: "published",
          featured: false,
          date: new Date(mdPost.date),
          categoryIds: [],
          tagIds: [],
          createdAt: new Date(mdPost.date),
        };
      }
    }

    if (!post) {
      return json({ error: "Post not found", post: null, categories: [], tags: [] }, { status: 404 });
    }

    const [categories, tags] = await Promise.all([
      prisma.category.findMany().catch(() => []),
      prisma.tag.findMany().catch(() => []),
    ]);
    
    return json({ post, categories, tags, error: null });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ error: "Failed to load post", post: null, categories: [], tags: [] }, { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();
  const postId = formData.get("id") as string;
  
  if (!postId) {
    return json({ error: "Post ID required" }, { status: 400 });
  }

  try {
    if (intent === "update") {
      const title = (formData.get("title") as string)?.trim();
      const slug = (formData.get("slug") as string)?.trim() || params.slug || postId;
      const summary = (formData.get("summary") as string)?.trim() || "";
      const content = (formData.get("content") as string) || "";
      const coverImage = (formData.get("coverImage") as string)?.trim() || "";
      const status = (formData.get("status") as string) || "published";
      const featured = formData.get("featured") === "true";
      const dateRaw = formData.get("date") as string;
      const selectedCategoryIds = formData.getAll("categoryIds") as string[];
      const selectedTagIds = formData.getAll("tagIds") as string[];

      const minuteRead = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

      // 1. Sync to Supabase Object Storage
      await saveBlogPostToSupabase(slug, {
        slug,
        title,
        summary,
        content,
        coverImage,
        date: dateRaw || new Date().toISOString(),
        featured,
        status: status === "published" ? "published" : "draft",
        minuteRead,
      });

      // 2. Persist to MongoDB
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(postId);
      const updateData = {
        title,
        slug,
        summary,
        content,
        coverImage,
        status,
        featured,
        minuteRead,
        categoryIds: selectedCategoryIds,
        tagIds: selectedTagIds,
        date: dateRaw ? new Date(dateRaw) : undefined,
      };

      if (isObjectId) {
        await prisma.post.update({
          where: { id: postId },
          data: updateData,
        });
      } else {
        await prisma.post.upsert({
          where: { slug: postId },
          update: updateData,
          create: {
            ...updateData,
            authorId: "yahya-owner",
          },
        });
      }

      // Also sync to local markdown if available
      try {
        const { saveBlogPost } = await import("~/Services/content.server");
        await saveBlogPost({
          title,
          slug,
          date: dateRaw || new Date().toISOString().split("T")[0],
          displayDate: new Date(dateRaw || Date.now()).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          summary,
          content,
          featured,
        });
      } catch (fsErr) {
        console.warn("Local markdown sync notice:", fsErr);
      }

      return json({ success: true, message: "Post saved to Supabase & Database successfully", error: undefined });
    }

    return json({ success: false, error: "Invalid intent", message: undefined }, { status: 400 });
  } catch (error) {
    console.error("Action error:", error);
    return json({ success: false, error: error instanceof Error ? error.message : "Action failed", message: undefined }, { status: 500 });
  }
}

export default function AdminPostEdit() {
  const { theme } = useTheme();
  const { post, categories, tags, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [currentContent, setCurrentContent] = useState(post?.content || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [featured, setFeatured] = useState(Boolean(post?.featured));
  const [selectedCategories, setSelectedCategories] = useState<string[]>((post?.categoryIds as string[]) || []);
  const [selectedTags, setSelectedTags] = useState<string[]>((post?.tagIds as string[]) || []);

  useEffect(() => {
    if ((actionData as any)?.success && (actionData as any).message) toast.success((actionData as any).message);
    if ((actionData as any)?.error) toast.error((actionData as any).error);
  }, [actionData]);

  useEffect(() => {
    try {
      const htmlContent = marked.parse(currentContent);
      setMarkdownContent(htmlContent as string);
    } catch (err) {
      console.error("Markdown parsing error:", err);
    }
  }, [currentContent]);

  useEffect(() => {
    if (post) {
      setCurrentContent(post.content || "");
      setCoverImage(post.coverImage || "");
      setFeatured(Boolean(post.featured));
      setSelectedCategories((post.categoryIds as string[]) || []);
      setSelectedTags((post.tagIds as string[]) || []);
    }
  }, [post?.id]);

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-zinc-500 gap-4">
        <p className="text-red-500 font-medium">{error || "Post not found"}</p>
        <Link to="/admin/posts">
          <Button variant="outline">Back to Posts</Button>
        </Link>
      </div>
    );
  }

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-zinc-950" : "bg-zinc-50"}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link to="/admin/posts">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Edit Article</h1>
                    <p className="text-zinc-500 text-xs">Synchronized with Supabase Object Storage & MongoDB</p>
                </div>
            </div>
            <div className="flex gap-2">
                <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <Eye size={14} /> View Live
                    </Button>
                </a>
            </div>
        </div>

        <Form method="post" className="space-y-8">
            <input type="hidden" name="intent" value="update" />
            <input type="hidden" name="id" value={post.id} />
            <input type="hidden" name="featured" value={String(featured)} />

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="content">Content & Markdown</TabsTrigger>
                    <TabsTrigger value="assets">Cover & Media</TabsTrigger>
                </TabsList>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Editor Area */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <TabsContent value="general" className="space-y-6">
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Article Title</Label>
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
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background dark:bg-zinc-950 dark:border-zinc-800"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                      type="checkbox"
                                      id="featured-check-edit"
                                      checked={featured}
                                      onChange={(e) => setFeatured(e.target.checked)}
                                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <Label htmlFor="featured-check-edit" className="cursor-pointer text-xs">
                                      Spotlight as Featured Story on Homepage
                                    </Label>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date">Published Date</Label>
                                    <Input 
                                        type="datetime-local" 
                                        id="date" 
                                        name="date" 
                                        defaultValue={post.date ? new Date(post.date).toISOString().slice(0, 16) : new Date(post.createdAt).toISOString().slice(0, 16)} 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="summary">Summary / Meta Description</Label>
                                    <Textarea 
                                        id="summary" 
                                        name="summary" 
                                        defaultValue={post.summary || ""} 
                                        className="h-24 text-sm"
                                        placeholder="Brief description for SEO and cards"
                                    />
                                </div>

                                {/* Categories */}
                                {categories && categories.length > 0 && (
                                  <div className="space-y-2 pt-2">
                                    <Label className="text-xs font-semibold">Categories</Label>
                                    <div className="flex flex-wrap gap-2">
                                      {categories.map((cat: any) => (
                                        <label
                                          key={cat.id}
                                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
                                            selectedCategories.includes(cat.id)
                                              ? "bg-indigo-600 text-white border-indigo-600"
                                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            name="categoryIds"
                                            value={cat.id}
                                            checked={selectedCategories.includes(cat.id)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setSelectedCategories([...selectedCategories, cat.id]);
                                              } else {
                                                setSelectedCategories(selectedCategories.filter((id) => id !== cat.id));
                                              }
                                            }}
                                            className="sr-only"
                                          />
                                          {cat.name}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="content" className="space-y-6">
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="content" className="block text-sm font-semibold">Content (Markdown / MDX)</Label>
                                  <span className="text-xs text-zinc-400 font-mono">
                                    {currentContent.split(/\s+/).filter(Boolean).length} words • {Math.max(1, Math.ceil(currentContent.split(/\s+/).filter(Boolean).length / 200))} min read
                                  </span>
                                </div>
                                <Textarea 
                                    ref={textareaRef}
                                    id="content" 
                                    name="content" 
                                    value={currentContent}
                                    onChange={(e) => setCurrentContent(e.target.value)}
                                    className="min-h-[500px] font-mono text-sm leading-relaxed"
                                    placeholder="# Write your post here..."
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="assets" className="space-y-6">
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Cover Image</Label>
                                    <p className="text-xs text-zinc-500 mb-3">Primary header image for the article.</p>
                                    <Input 
                                      type="text" 
                                      name="coverImage" 
                                      value={coverImage} 
                                      onChange={(e) => setCoverImage(e.target.value)}
                                      placeholder="https://... or upload below"
                                      className="mb-2 text-xs font-mono"
                                    />
                                    <CloudinaryImageUpload 
                                        slug={post.slug} 
                                        type="cover" 
                                        onUploadComplete={setCoverImage} 
                                        currentImageUrl={coverImage}
                                        label="Upload Cover Image"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                        
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]">
                                <Save size={16} className="mr-2" />
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>

                    {/* Preview Column */}
                    <div className="space-y-6 hidden lg:block">
                         <div className="sticky top-6">
                            <h2 className="text-sm font-semibold mb-3 dark:text-zinc-300 flex items-center gap-1.5">
                              <Eye size={16} /> Live Preview
                            </h2>
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-auto max-h-[calc(100vh-8rem)]">
                                 {coverImage && (
                                   <img src={coverImage} alt="Cover" className="w-full h-40 object-cover rounded-lg mb-4" />
                                 )}
                                 <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{post.title}</h1>
                                 {markdownContent ? (
                                     <div className={proseClasses} dangerouslySetInnerHTML={{ __html: markdownContent }} />
                                 ) : (
                                     <p className="text-zinc-400 text-xs italic">Start typing to see preview...</p>
                                 )}
                            </div>
                         </div>
                    </div>
                </div>
            </Tabs>
        </Form>
      </div>
    </div>
  );
}
