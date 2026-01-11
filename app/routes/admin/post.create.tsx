import { motion } from "framer-motion";
import { useTheme } from "~/Contexts/ThemeContext";
import { Link, useActionData, useNavigation, Form, useFetcher, useSubmit } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { ArrowLeft, Plus, Image as ImageIcon, Save, Eye, Loader2, Copy, Check } from "lucide-react";
import { marked } from "marked";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPost, saveDraft } from "~/Services/post.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import { proseClasses } from "~/styles/prose";
import CloudinaryImageUpload from "~/components/CloudinaryImageUpload";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// Configure marked for safe markdown rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const summary = formData.get("summary") as string;
  const coverImage = formData.get("coverImage") as string;
  const status = formData.get("status") as string || "draft";
  const gallery = JSON.parse(formData.get("gallery") as string || "[]");
  const authorId = "admin"; // TODO: Get from session properly in real app

  try {
    if (intent === "draft") {
        if (!title) return json({ success: false, error: "Title required for draft" });
        
        await saveDraft({
            title,
            slug,
            content,
            summary,
            seoTitle: title,
            seoDescription: summary,
            authorId,
            // TODO: Ensure schema supports gallery if needed explicitly, 
            // though currently we might just store urls in markdown. 
            // If gallery is a separate field in Draft/Post schema, pass it here.
        });
        return json({ success: true, message: "Draft saved" });
    }

    if (intent === "publish" || intent === "create") {
        if (!title || !content) {
            return json({ error: "Title and Content are required to publish" }, { status: 400 });
        }

        await createPost({
            title,
            slug,
            content,
            summary,
            coverImage,
            status: status === "published" ? "published" : "draft",
            authorId, 
            // gallery: gallery // Add to createPost interface if schema supports it
        });
        
        return redirect("/admin/posts");
    }

    return json({ error: "Invalid intent" }, { status: 400 });

  } catch (error) {
    console.error("Create post error:", error);
    return json({ error: error instanceof Error ? error.message : "Failed to create post" }, { status: 500 });
  }
}

export default function AdminPostCreate() {
  const { theme } = useTheme();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const fetcher = useFetcher();
  const submit = useSubmit();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("draft");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  
  // Auto-save State
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounce values for auto-save
  const [debouncedTitle] = useDebounce(title, 2000);
  const [debouncedContent] = useDebounce(content, 2000);
  const [debouncedSummary] = useDebounce(summary, 2000);

  const [markdownContent, setMarkdownContent] = useState<string>("");

  useEffect(() => {
    if (actionData?.error) toast.error(actionData.error);
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
    if (debouncedTitle || debouncedContent || debouncedSummary) {
        handleAutoSave();
    }
  }, [debouncedTitle, debouncedContent, debouncedSummary]);

  const handleAutoSave = useCallback(() => {
    if (!title) return; // Don't save empty drafts without at least a title

    const formData = new FormData();
    formData.append("intent", "draft");
    formData.append("title", title);
    if (slug) formData.append("slug", slug);
    if (content) formData.append("content", content);
    if (summary) formData.append("summary", summary);
    if (coverImage) formData.append("coverImage", coverImage);
    formData.append("gallery", JSON.stringify(gallery));
    
    setIsAutoSaving(true);
    fetcher.submit(formData, { method: "post" });
  }, [title, slug, content, summary, coverImage, gallery]);

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
    
    // Insert text
    const newContent = previousContent.substring(0, start) + textToInsert + previousContent.substring(end);
    setContent(newContent);

    // Restore cursor / focus
    // Need timeout because React dispatch is async
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
                    <h1 className="text-2xl font-bold dark:text-white">Create New Post</h1>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>Write a new article</span>
                        {lastSaved && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full fade-in">
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
            <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
            
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="assets">Assets</TabsTrigger>
                </TabsList>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area spanning 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        <TabsContent value="general" className="space-y-6">
                             <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input 
                                        id="title" 
                                        name="title" 
                                        placeholder="e.g. The Future of AI" 
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
                                            placeholder="auto-generated-if-empty" 
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
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950 dark:border-zinc-800"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="summary">Summary</Label>
                                    <Textarea 
                                        id="summary" 
                                        name="summary" 
                                        className="h-32"
                                        placeholder="Brief description for SEO and cards"
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                    />
                                </div>
                             </div>
                        </TabsContent>

                        <TabsContent value="content" className="space-y-6">
                             <div className="grid grid-cols-1 gap-6">
                                {/* Editor */}
                                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                                    <Label htmlFor="content" className="mb-2 block">Content (Markdown)</Label>
                                    <Textarea 
                                        ref={textareaRef}
                                        id="content" 
                                        name="content" 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="min-h-[500px] font-mono text-sm"
                                        placeholder="# Write your post here..."
                                    />
                                </div>

                                {/* Asset Library Helper */}
                                <Card className="border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-900/10">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                                            <ImageIcon size={16} />
                                            Available Assets
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {/* Cover Image */}
                                            {coverImage && (
                                                <button 
                                                    type="button"
                                                    onClick={() => insertAtCursor(`![Cover Image](${coverImage})`)}
                                                    className="relative group w-20 h-20 rounded border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
                                                    title="Click to insert"
                                                >
                                                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Plus className="text-white" size={16} />
                                                    </div>
                                                </button>
                                            )}
                                            {/* Gallery Images */}
                                            {gallery.map((url, idx) => (
                                                <button 
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => insertAtCursor(`![Gallery ${idx + 1}](${url})`)}
                                                    className="relative group w-20 h-20 rounded border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
                                                    title="Click to insert"
                                                >
                                                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Plus className="text-white" size={16} />
                                                    </div>
                                                </button>
                                            ))}
                                            {(!coverImage && gallery.length === 0) && (
                                                <p className="text-sm text-zinc-500 italic">No assets uploaded yet. Go to 'Assets' tab.</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="assets" className="space-y-6">
                            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
                                
                                <div className="space-y-2">
                                    <Label className="text-lg font-medium">Cover Image</Label>
                                    <p className="text-sm text-zinc-500 mb-4">This will be the main image of your post.</p>
                                    <Input type="hidden" name="coverImage" value={coverImage} />
                                    <CloudinaryImageUpload 
                                        slug={slug} 
                                        type="cover" 
                                        onUploadComplete={setCoverImage} 
                                        currentImageUrl={coverImage}
                                        label="Upload Cover Image"
                                    />
                                    {coverImage && (
                                        <div className="mt-2 text-xs text-zinc-400 break-all">{coverImage}</div>
                                    )}
                                </div>
                                
                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-6" />

                                <div className="space-y-2">
                                    <Label className="text-lg font-medium">Gallery Assets</Label>
                                    <p className="text-sm text-zinc-500 mb-4">Upload additional images here to use in your content.</p>
                                    
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        {gallery.map((url, i) => (
                                            <div key={i} className="relative group rounded-md overflow-hidden aspect-square border border-zinc-200 dark:border-zinc-700">
                                                <img src={url} alt="gallery" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button"
                                                    onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <ArrowLeft size={12} className="rotate-45" /> {/* Use X icon ideally, repurposing Arrow for now or import X */}
                                                </button>
                                            </div>
                                        ))}
                                        <CloudinaryImageUpload 
                                            slug={slug} 
                                            type="gallery" 
                                            onUploadComplete={(url) => setGallery([...gallery, url])}
                                            label="Add Image"
                                            className="h-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Global Actions */}
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]">
                                <Plus size={16} className="mr-2" />
                                {isSubmitting ? "Creating..." : "Create Post"}
                            </Button>
                        </div>
                    </div>

                    {/* Preview Sidebar */}
                    <div className="space-y-6 hidden lg:block">
                        <div className="sticky top-6">
                            <h2 className="text-lg font-semibold mb-4 dark:text-zinc-200">Live Preview</h2>
                            <div className={`max-w-none bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-auto max-h-[calc(100vh-8rem)]`}>
                                {title && <h1 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">{title}</h1>}
                                {content ? (
                                    <div className={proseClasses} dangerouslySetInnerHTML={{ __html: markdownContent }} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                                        <Eye size={48} className="mb-4 opacity-20" />
                                        <p>Start typing to see preview...</p>
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
