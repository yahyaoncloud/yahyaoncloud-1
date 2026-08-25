import { motion } from "framer-motion";
import { useTheme } from "~/Contexts/ThemeContext";
import { Link, useActionData, useNavigation, Form, useFetcher, useSubmit, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { ArrowLeft, Plus, Image as ImageIcon, Save, Eye, Loader2, Copy, Check, Upload, Tag } from "lucide-react";
import { marked } from "marked";
import { useState, useEffect, useCallback, useRef } from "react";
import { requireAdmin } from "~/utils/admin-auth.server";
import { prisma } from "~/utils/prisma.server";
import { saveBlogPostToSupabase } from "~/Services/supabase-storage.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { proseClasses } from "~/styles/prose";
import CloudinaryImageUpload from "~/components/CloudinaryImageUpload";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// Configure marked for safe markdown rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const [categories, tags] = await Promise.all([
    prisma.category.findMany().catch(() => []),
    prisma.tag.findMany().catch(() => []),
  ]);
  return json({ categories, tags });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  
  const title = (formData.get("title") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim();
  const content = formData.get("content") as string || "";
  const summary = (formData.get("summary") as string)?.trim() || "";
  const coverImage = (formData.get("coverImage") as string)?.trim() || "";
  const status = (formData.get("status") as string) || "draft";
  const featured = formData.get("featured") === "true";
  const selectedCategoryIds = formData.getAll("categoryIds") as string[];
  const selectedTagIds = formData.getAll("tagIds") as string[];

  if (!title) {
    return json({ error: "Title is required" }, { status: 400 });
  }

  if (!slug) {
    slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }

  const minuteRead = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

  try {
    // 1. Sync structured Markdown to Supabase Storage
    await saveBlogPostToSupabase(slug, {
      slug,
      title,
      summary,
      content,
      coverImage,
      date: new Date().toISOString(),
      featured,
      status: status === "published" ? "published" : "draft",
      minuteRead,
    });

    // 2. Persist to MongoDB (Prisma)
    // Find or create default Yahya author record
    let author = await prisma.author.findFirst({ where: { username: "yahya" } });
    if (!author) {
      author = await prisma.author.create({
        data: {
          authorId: "yahya-owner",
          username: "yahya",
          authorName: "Yahya",
          role: "superadmin",
        },
      });
    }

    const postData = {
      title,
      slug,
      content,
      summary,
      coverImage,
      status: status === "published" ? "published" : "draft",
      featured,
      minuteRead,
      authorId: author.id,
      categoryIds: selectedCategoryIds,
      tagIds: selectedTagIds,
      date: new Date(),
    };

    await prisma.post.upsert({
      where: { slug },
      update: postData,
      create: postData,
    });

    // Also sync to local markdown file if content service is available
    try {
      const { saveBlogPost } = await import("~/Services/content.server");
      await saveBlogPost({
        title,
        slug,
        date: new Date().toISOString().split("T")[0],
        displayDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        summary,
        content,
        featured,
      });
    } catch (fsErr) {
      console.warn("Local FS save notice:", fsErr);
    }

    if (intent === "draft") {
      return json({ success: true, message: "Draft saved to Supabase & Database" });
    }

    return redirect("/admin/posts");
  } catch (error) {
    console.error("Create post error:", error);
    return json({ error: error instanceof Error ? error.message : "Failed to create post" }, { status: 500 });
  }
}

export default function AdminPostCreate() {
  const { categories, tags } = useLoaderData<typeof loader>();
  const { theme } = useTheme();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const fetcher = useFetcher();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("draft");
  const [featured, setFeatured] = useState(false);
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  
  // Auto-save State
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounce values for auto-save
  const [debouncedTitle] = useDebounce(title, 2500);
  const [debouncedContent] = useDebounce(content, 2500);
  const [debouncedSummary] = useDebounce(summary, 2500);

  const [markdownContent, setMarkdownContent] = useState<string>("");

  useEffect(() => {
    if ((actionData as any)?.error) toast.error((actionData as any).error);
  }, [actionData]);

  // Handle Markdown Preview
  useEffect(() => {
    try {
      const htmlContent = marked.parse(content);
      setMarkdownContent(htmlContent as string);
    } catch (err) {
      console.error("Markdown parsing error:", err);
    }
  }, [content]);

  // Auto-Generate Slug
  useEffect(() => {
     if (title && !slug) {
         setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
     }
  }, [title]);

  // Auto-Save Effect
  useEffect(() => {
    if (debouncedTitle && debouncedContent) {
        handleAutoSave();
    }
  }, [debouncedTitle, debouncedContent, debouncedSummary]);

  const handleAutoSave = useCallback(() => {
    if (!title) return;

    const formData = new FormData();
    formData.append("intent", "draft");
    formData.append("title", title);
    if (slug) formData.append("slug", slug);
    if (content) formData.append("content", content);
    if (summary) formData.append("summary", summary);
    if (coverImage) formData.append("coverImage", coverImage);
    formData.append("featured", String(featured));
    selectedCategories.forEach((id) => formData.append("categoryIds", id));
    selectedTags.forEach((id) => formData.append("tagIds", id));
    
    setIsAutoSaving(true);
    fetcher.submit(formData, { method: "post" });
  }, [title, slug, content, summary, coverImage, featured, selectedCategories, selectedTags]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && (fetcher.data as any).success) {
        setIsAutoSaving(false);
        setLastSaved(new Date());
    }
  }, [fetcher.state, fetcher.data]);

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousContent = content;
    
    const newContent = previousContent.substring(0, start) + textToInsert + previousContent.substring(end);
    setContent(newContent);

    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const isSubmitting = navigation.state === "submitting" && navigation.formData?.get("intent") !== "draft";

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
                    <h1 className="text-2xl font-bold dark:text-white">Create New Article</h1>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>Synced with Supabase Object Storage & MongoDB</span>
                        {lastSaved && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                Last saved: {lastSaved.toLocaleTimeString()}
                            </span>
                        )}
                        {isAutoSaving && (
                            <span className="flex items-center gap-1 text-xs text-indigo-500">
                                <Loader2 size={10} className="animate-spin" /> Saving draft...
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleAutoSave} disabled={isAutoSaving}>
                    <Save size={16} className="mr-2" /> Save Draft
                </Button>
            </div>
        </div>

        <Form method="post" className="space-y-8">
            <input type="hidden" name="intent" value="create" />
            <input type="hidden" name="featured" value={String(featured)} />
            
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="content">Content & Markdown</TabsTrigger>
                    <TabsTrigger value="assets">Cover & Assets</TabsTrigger>
                </TabsList>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <TabsContent value="general" className="space-y-6">
                             <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Article Title</Label>
                                    <Input 
                                        id="title" 
                                        name="title" 
                                        placeholder="e.g. Scaling Real-Time Systems on the Edge" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug (Auto-generated)</Label>
                                        <Input 
                                            id="slug" 
                                            name="slug" 
                                            placeholder="auto-generated-from-title" 
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <select 
                                            name="status" 
                                            id="status" 
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background dark:bg-zinc-950 dark:border-zinc-800"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                      type="checkbox"
                                      id="featured-check"
                                      checked={featured}
                                      onChange={(e) => setFeatured(e.target.checked)}
                                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <Label htmlFor="featured-check" className="cursor-pointer text-xs">
                                      Spotlight as Featured Story on Homepage
                                    </Label>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="summary">Summary / Meta Description</Label>
                                    <Textarea 
                                        id="summary" 
                                        name="summary" 
                                        className="h-24 text-sm"
                                        placeholder="Brief 1-2 sentence overview for cards and social sharing..."
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                    />
                                </div>

                                {/* Categories & Tags */}
                                {categories.length > 0 && (
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
                                    {content.split(/\s+/).filter(Boolean).length} words • {Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200))} min read
                                  </span>
                                </div>
                                <Textarea 
                                    ref={textareaRef}
                                    id="content" 
                                    name="content" 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[500px] font-mono text-sm leading-relaxed"
                                    placeholder="# Introduction&#10;&#10;Write your article here using Markdown..."
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
                                        slug={slug} 
                                        type="cover" 
                                        onUploadComplete={setCoverImage} 
                                        currentImageUrl={coverImage}
                                        label="Upload Cover Image"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Submit Action */}
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]">
                                <Plus size={16} className="mr-2" />
                                {isSubmitting ? "Saving..." : "Publish Article"}
                            </Button>
                        </div>
                    </div>

                    {/* Live Preview Pane */}
                    <div className="space-y-6 hidden lg:block">
                        <div className="sticky top-6">
                            <h2 className="text-sm font-semibold mb-3 dark:text-zinc-300 flex items-center gap-1.5">
                              <Eye size={16} /> Live Preview
                            </h2>
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-auto max-h-[calc(100vh-8rem)]">
                                {coverImage && (
                                  <img src={coverImage} alt="Cover" className="w-full h-40 object-cover rounded-lg mb-4" />
                                )}
                                {title && <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{title}</h1>}
                                {content ? (
                                    <div className={proseClasses} dangerouslySetInnerHTML={{ __html: markdownContent }} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-zinc-400">
                                        <Eye size={36} className="mb-2 opacity-20" />
                                        <p className="text-xs">Start writing to see live rendered preview...</p>
                                    </div>
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
