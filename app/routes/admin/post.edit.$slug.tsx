import { motion } from "framer-motion";
import { useTheme } from "~/Contexts/ThemeContext";
import { Link, useLoaderData, Form, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Edit, Trash2, Eye, Clock, Calendar, Save, ArrowLeft, Image as ImageIcon, Plus, Copy, FileJson, AlertTriangle } from "lucide-react";
import { marked } from "marked";
import { useEffect, useState, useRef } from "react";
import { getPostById, updatePost, findPostBySlug } from "~/Services/post.prisma.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { proseClasses } from "~/styles/prose";
import CloudinaryImageUpload from "~/components/CloudinaryImageUpload";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

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
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    
    let post = null;
    if (isObjectId) {
        post = await getPostById(slug).catch((err) => {
            console.error(`[AdminEditLoader] getPostById error:`, err);
            return null;
        });
    }
    
    if (!post) {
        post = await findPostBySlug(slug);
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
        const dateRaw = formData.get("date") as string;
        console.log(`[AdminPostEdit] Action received dateRaw: "${dateRaw}"`);
        const gallery = JSON.parse(formData.get("gallery") as string || "[]");
        
        await updatePost({
            id: postId,
            title,
            slug,
            summary,
            content,
            coverImage,
            status,
            gallery,
            date: dateRaw ? new Date(dateRaw) : undefined
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
  const data = useLoaderData<typeof loader>() as { post?: any; error?: string };
  const { post, error } = data;
  
  const actionData = useActionData<typeof action>() as ActionResponse | undefined;
  const navigation = useNavigation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [currentContent, setCurrentContent] = useState(post?.content || "");
  const [gallery, setGallery] = useState<string[]>(post?.gallery || []);
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");

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

  // Update local state only when switching posts (prevent overwriting local state on revalidation)
  useEffect(() => {
      if(post) {
          setCurrentContent(post.content || "");
          setGallery(post.gallery || []);
          setCoverImage(post.coverImage || "");
      }
  }, [post.id]);

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousContent = currentContent;
    
    // Insert text
    const newContent = previousContent.substring(0, start) + textToInsert + previousContent.substring(end);
    setCurrentContent(newContent);

    // Restore cursor / focus
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

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
      <div className="max-w-6xl mx-auto space-y-6">
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
            <Form method="post" className="space-y-8">
                <input type="hidden" name="intent" value="update" />
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />

                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="assets">Assets</TabsTrigger>
                    </TabsList>

                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Editor Area */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            <TabsContent value="general" className="space-y-6" forceMount={true}>
                                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
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

                                    <div className="space-y-3">
                                        <Label htmlFor="date">Published Date</Label>
                                        <Input 
                                            type="datetime-local" 
                                            id="date" 
                                            name="date" 
                                            defaultValue={post.date ? new Date(post.date).toISOString().slice(0, 16) : new Date(post.createdAt).toISOString().slice(0, 16)} 
                                        />
                                        <div className="flex items-start gap-2 text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-md border border-yellow-200 dark:border-yellow-900/30 text-sm">
                                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                            <p>Warning: Changing this date will overwrite the original published date and affect post ordering.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="summary">Summary</Label>
                                        <Textarea 
                                            id="summary" 
                                            name="summary" 
                                            defaultValue={post.summary} 
                                            className="h-24"
                                            placeholder="Brief description for SEO and cards"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="content" className="space-y-6" forceMount={true}>
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                                        <Label htmlFor="content" className="mb-2 block">Content (Markdown)</Label>
                                        <Textarea 
                                            ref={textareaRef}
                                            id="content" 
                                            name="content" 
                                            value={currentContent}
                                            onChange={(e) => setCurrentContent(e.target.value)}
                                            className="min-h-[500px] font-mono text-sm"
                                            placeholder="# Write your post here..."
                                        />
                                    </div>

                                    {/* Asset Helper */}
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

                            <TabsContent value="assets" className="space-y-6" forceMount={true}>
                                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-lg font-medium">Cover Image</Label>
                                        <p className="text-sm text-zinc-500 mb-4">This will be the main image of your post.</p>
                                        <Input type="hidden" name="coverImage" value={coverImage} />
                                        <CloudinaryImageUpload 
                                            slug={post.slug} 
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
                                            {gallery.map((url, i) => {
                                                // Extract filename from URL (Cloudinary specific structure)
                                                // Pattern: .../posts/slug/gallery/filename.ext or just filename from end
                                                const filename = url.split('/').pop()?.split('.')[0] || `Image ${i+1}`;
                                                const shortName = filename.length > 20 ? filename.substring(0, 17) + "..." : filename;

                                                return (
                                                    <div key={i} className="relative group rounded-md overflow-hidden aspect-square border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                                                        <img src={url} alt={filename} className="w-full h-full object-cover" />
                                                        
                                                        {/* Filename Label */}
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate text-center backdrop-blur-sm">
                                                            {shortName}
                                                        </div>

                                                        {/* Actions Overlay */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[2px]">
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigator.clipboard.writeText(url);
                                                                    toast.success("URL Copied!");
                                                                }}
                                                                className="bg-white/90 text-zinc-700 p-1.5 rounded-full hover:bg-white hover:text-indigo-600 transition-colors shadow-sm"
                                                                title="Copy URL"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigator.clipboard.writeText(`![${filename}](${url})`);
                                                                    toast.success("Markdown Copied!");
                                                                }}
                                                                className="bg-white/90 text-zinc-700 p-1.5 rounded-full hover:bg-white hover:text-pink-600 transition-colors shadow-sm"
                                                                title="Copy Markdown"
                                                            >
                                                                <FileJson size={14} />
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                                                                className="bg-red-500/90 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                                                title="Remove"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <CloudinaryImageUpload 
                                                slug={post.slug} 
                                                type="gallery" 
                                                onUploadComplete={(url) => {
                                                    console.log("Adding to gallery:", url);
                                                    setGallery(prev => [...prev, url]);
                                                }}
                                                label="Add Image"
                                                className="h-full"
                                            />
                                        </div>
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
                        <div className="space-y-6 hidden md:block">
                             <div className="sticky top-6">
                                <h2 className="text-lg font-semibold mb-4 dark:text-zinc-200">Live Preview</h2>
                                <div className={`max-w-none bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-auto max-h-[calc(60vh-8rem)]`}>
                                     <h1 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">{post.title}</h1>
                                     {markdownContent ? (
                                         <div className={proseClasses} dangerouslySetInnerHTML={{ __html: markdownContent }} />
                                     ) : (
                                         <p className="text-zinc-400 italic">Start typing to see preview...</p>
                                     )}
                                </div>
                             </div>
                        </div>
                    </div>
                </Tabs>
            </Form>
        ) : (
            <div className="text-center py-20">
                <p>Post not found.</p>
            </div>
        )}
      </div>
    </div>
  );
}
