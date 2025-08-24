import { useState, useEffect, useCallback } from "react";
import { json, redirect, type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  createPost,
  getAllCategories,
  getAllTags,
  getAllTypes,
  getAuthorByAuthorId,
  saveDraft,
  getDraftByAuthorId,
  deleteDraft,
  convertDraftToPost
} from "../Services/post.server";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Category, Tag, Type, SEO } from "../Types/types";
import { Author } from "../models";
import { Types } from "mongoose";
import { proseClasses } from "../styles/prose";

// Form state interface
interface FormState {
  title: string;
  summary: string;
  content: string;
  date: string;
  status: "draft" | "published";
  categories: string[];
  tags: string[];
  types: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  activeTab: string;
}

// Draft interface
interface DraftData {
  _id?: string;
  title: string;
  summary?: string;
  content?: string;
  categories?: string[];
  tags?: string[];
  types?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  authorId: string;
  updatedAt: Date;
}

// Initial form state
const initialFormState: FormState = {
  title: "",
  summary: "",
  content: "",
  date: new Date().toISOString().slice(0, 16),
  status: "draft",
  categories: [],
  tags: [],
  types: [],
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  activeTab: "general"
};

// Local storage key
const FORM_STATE_KEY = "admin-post-create-form-state";

// -------------------- Loader --------------------
export const loader: LoaderFunction = async () => {
  try {
    const [categories, tags, types, author] = await Promise.all([
      getAllCategories(),
      getAllTags(),
      getAllTypes(),
      getAuthorByAuthorId("auth-001")
    ]);

    // Load saved draft from MongoDB
    let savedDraft = null;
    if (author) {
      savedDraft = await getDraftByAuthorId(author._id);
    }

    return json({ categories, tags, types, author, savedDraft });
  } catch (error) {
    return json({ categories: [], tags: [], types: [], author: null, savedDraft: null, error: "Failed to load data" }, { status: 500 });
  }
};

// -------------------- Action --------------------
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType")?.toString();

  const author = await getAuthorByAuthorId("auth-001");
  if (!author) throw new Error("Author not found");

  // Handle draft saving
  if (actionType === "saveDraft") {
    const draftData = {
      title: formData.get("title")?.toString() || "Untitled Draft",
      summary: formData.get("summary")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      categories: formData.getAll("categories").filter(Boolean).map(String),
      tags: formData.getAll("tags").filter(Boolean).map(String),
      types: formData.getAll("types").filter(Boolean).map(String),
      seoTitle: formData.get("seoTitle")?.toString() || "",
      seoDescription: formData.get("seoDescription")?.toString() || "",
      seoKeywords: formData.get("seoKeywords")?.toString().split(',').map(k => k.trim()).filter(Boolean) || [],
      authorId: author._id,
    };

    await saveDraft(draftData);
    return json({ success: true, message: "Draft saved successfully", type: "draft" });
  }

  // Handle draft deletion
  if (actionType === "deleteDraft") {
    const draftId = formData.get("draftId")?.toString();
    if (draftId) {
      await deleteDraft(draftId);
    }
    return json({ success: true, message: "Draft deleted", type: "deleteDraft" });
  }

  // Handle post creation (existing logic)
  const title = formData.get("title")?.toString().trim() || "Untitled Post";
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const content = formData.get("content")?.toString() || "";
  const summary = formData.get("summary")?.toString() || "";
  const seoTitle = formData.get("seoTitle")?.toString() || title;
  const seoDescription = formData.get("seoDescription")?.toString() || summary;
  const seoKeywords = formData.get("seoKeywords")?.toString().split(',').map(k => k.trim()).filter(Boolean) || [];
  const status = formData.get("status")?.toString() as "draft" | "published" || "draft";

  // Date handling - use provided date or current date
  const dateInput = formData.get("date")?.toString();
  const postDate = dateInput ? new Date(dateInput) : new Date();

  const categories = formData.getAll("categories").filter(Boolean).map(id => ({ _id: String(id) }));
  const tags = formData.getAll("tags").filter(Boolean).map(String);
  const types = formData.getAll("types").filter(Boolean).map(String);

  const coverImage = formData.get("coverImage") as File | null;
  const gallery = formData.getAll("gallery").filter((f): f is File => f instanceof File);

  const seo: SEO = {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    canonicalUrl: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const post = await createPost(
    {
      title,
      slug,
      summary,
      content,
      categories,
      tags,
      types,
      date: postDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: author._id.toString(),
      author: new Types.ObjectId(author._id),
      status,
      seo,
    },
    { coverImage, gallery }
  );

  // Delete any existing draft after successful post creation
  const existingDraft = await getDraftByAuthorId(author._id);
  if (existingDraft) {
    await deleteDraft(existingDraft._id);
  }

  return redirect("/admin/posts");
};

// -------------------- Component --------------------
export default function AdminPostCreate() {
  const { categories, tags, types, author, savedDraft, error } = useLoaderData<{
    categories: Category[];
    tags: Tag[];
    types: Type[];
    author: any;
    savedDraft: DraftData | null;
    error?: string;
  }>();

  const fetcher = useFetcher();

  // Form state management
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [showDraftIndicator, setShowDraftIndicator] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Media state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Load saved form state and draft on component mount
  useEffect(() => {
    if (savedDraft) {
      const draftFormState: FormState = {
        title: savedDraft.title || "",
        summary: savedDraft.summary || "",
        content: savedDraft.content || "",
        date: new Date().toISOString().slice(0, 16),
        status: "draft",
        categories: savedDraft.categories || [],
        tags: savedDraft.tags || [],
        types: savedDraft.types || [],
        seoTitle: savedDraft.seoTitle || "",
        seoDescription: savedDraft.seoDescription || "",
        seoKeywords: savedDraft.seoKeywords?.join(', ') || "",
        activeTab: "general"
      };
      setFormState(draftFormState);
      setDraftId(savedDraft._id || null);
      setLastSaveTime(new Date(savedDraft.updatedAt));
    } else {
      // Fall back to localStorage if no server draft
      const savedState = localStorage.getItem(FORM_STATE_KEY);
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          setFormState({ ...initialFormState, ...parsedState });
        } catch (error) {
          console.warn("Failed to parse saved form state:", error);
        }
      }
    }
  }, [savedDraft]);

  // Auto-save draft to server
  const autoSaveDraft = useCallback(
    async (currentFormState: FormState) => {
      if (!author || !currentFormState.title.trim()) return;

      try {
        const formData = new FormData();
        formData.append("actionType", "saveDraft");
        formData.append("title", currentFormState.title);
        formData.append("summary", currentFormState.summary);
        formData.append("content", currentFormState.content);
        formData.append("seoTitle", currentFormState.seoTitle);
        formData.append("seoDescription", currentFormState.seoDescription);
        formData.append("seoKeywords", currentFormState.seoKeywords);

        currentFormState.categories.forEach(cat => formData.append("categories", cat));
        currentFormState.tags.forEach(tag => formData.append("tags", tag));
        currentFormState.types.forEach(type => formData.append("types", type));

        fetcher.submit(formData, { method: "post" });
        setLastSaveTime(new Date());
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
    },
    [author, fetcher]
  );

  // Debounced auto-save effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      autoSaveDraft(formState);
      setShowDraftIndicator(true);
      const hideTimeout = setTimeout(() => setShowDraftIndicator(false), 2000);
      return () => clearTimeout(hideTimeout);
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [formState, autoSaveDraft]);

  // Save to localStorage as backup
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(FORM_STATE_KEY, JSON.stringify(formState));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formState]);

  // Clear saved state when form is successfully submitted
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !error) {
      if (fetcher.data.type === "draft") {
        // Don't clear on draft save
        return;
      }
      localStorage.removeItem(FORM_STATE_KEY);
    }
  }, [fetcher.state, fetcher.data, error]);

  // Helper function to update form state
  const updateFormState = (updates: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  // Handle array field updates (categories, tags, types)
  const handleArrayFieldChange = (fieldName: keyof Pick<FormState, 'categories' | 'tags' | 'types'>, value: string) => {
    setFormState(prev => {
      const currentArray = prev[fieldName];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];

      return { ...prev, [fieldName]: newArray };
    });
  };

  // Delete draft
  const handleDeleteDraft = () => {
    if (draftId) {
      const formData = new FormData();
      formData.append("actionType", "deleteDraft");
      formData.append("draftId", draftId);
      fetcher.submit(formData, { method: "post" });
      setDraftId(null);
      setLastSaveTime(null);
    }
    setFormState(initialFormState);
    localStorage.removeItem(FORM_STATE_KEY);
  };

  const { getRootProps: getCoverProps, getInputProps: getCoverInput } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (files) => {
      const file = files[0];
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    },
  });

  const { getRootProps: getGalleryProps, getInputProps: getGalleryInput } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    onDrop: (files) => {
      setGalleryFiles((prev) => [...prev, ...files]);
      files.forEach(file => {
        const url = URL.createObjectURL(file);
        setGalleryPreviews(prev => [...prev, url]);
      });
    },
  });

  const { getRootProps: getMdProps, getInputProps: getMdInput } = useDropzone({
    accept: { "text/markdown": [".md"] },
    multiple: false,
    onDrop: async (files) => {
      const text = await files[0].text();
      updateFormState({ content: text });
    },
  });

  const removeCoverImage = () => {
    setCoverFile(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);

    if (galleryPreviews[index]) {
      URL.revokeObjectURL(galleryPreviews[index]);
    }

    setGalleryFiles(newFiles);
    setGalleryPreviews(newPreviews);
  };

  const clearFormState = () => {
    setFormState(initialFormState);
    setCoverFile(null);
    setGalleryFiles([]);
    setCoverPreview(null);
    setGalleryPreviews([]);
    localStorage.removeItem(FORM_STATE_KEY);
  };

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-zinc-900 dark:text-zinc-100 mb-2">Create Post</h1>
            <div className="w-12 h-0.5 bg-zinc-900 dark:bg-zinc-100"></div>
          </div>

          {/* Draft status and actions */}
          <div className="flex items-center space-x-3">
            {lastSaveTime && (
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Draft saved: {lastSaveTime.toLocaleTimeString()}
              </div>
            )}
            {showDraftIndicator && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <svg className="w-3 h-3 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saving draft...
              </span>
            )}
            {draftId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeleteDraft}
                className="text-xs bg-red-50 text-red-600 dark:text-red-400 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                Delete Draft
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearFormState}
              className="text-xs bg-zinc-50 text-zinc-900 dark:text-zinc-200 dark:bg-zinc-900 border"
            >
              Clear Form
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}

        {fetcher.data?.message && (
          <div className={`mb-6 p-4 border rounded-md text-sm ${fetcher.data.success
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
            }`}>
            {fetcher.data.message}
          </div>
        )}

        <fetcher.Form method="post" encType="multipart/form-data">
          <Tabs value={formState.activeTab} onValueChange={(value) => updateFormState({ activeTab: value })} className="space-y-6">
            <TabsList className="bg-zinc-100 dark:bg-zinc-800 w-full justify-start">
              <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-700 px-6 text-zinc-700 dark:text-zinc-300 data-[state=active]:text-zinc-900 data-[state=active]:dark:text-zinc-100">
                General
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-700 px-6 text-zinc-700 dark:text-zinc-300 data-[state=active]:text-zinc-900 data-[state=active]:dark:text-zinc-100">
                Content
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-700 px-6 text-zinc-700 dark:text-zinc-300 data-[state=active]:text-zinc-900 data-[state=active]:dark:text-zinc-100">
                Media
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: General Data */}
            <TabsContent value="general" className="space-y-8">
              {/* Basic Information */}
              <section>
                <h2 className="text-lg font-medium mb-4 text-zinc-700 dark:text-zinc-300">Basic Information</h2>
                <div className="space-y-4">
                  <Field
                    label="Title"
                    name="title"
                    required
                    placeholder="Enter post title"
                    value={formState.title}
                    onChange={(e) => updateFormState({ title: e.target.value })}
                  />
                  <Field
                    label="Summary"
                    name="summary"
                    type="textarea"
                    rows={3}
                    placeholder="Brief summary of the post"
                    value={formState.summary}
                    onChange={(e) => updateFormState({ summary: e.target.value })}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Publish Date"
                      name="date"
                      type="datetime-local"
                      value={formState.date}
                      onChange={(e) => updateFormState({ date: e.target.value })}
                    />
                    <div>
                      <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</Label>
                      <Select
                        name="status"
                        value={formState.status}
                        onValueChange={(value) => updateFormState({ status: value as "draft" | "published" })}
                      >
                        <SelectTrigger className="mt-1 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-zinc-900 dark:focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                          <SelectItem value="draft" className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">Draft</SelectItem>
                          <SelectItem value="published" className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Classification */}
              <section>
                <h2 className="text-lg font-medium mb-4 text-zinc-700 dark:text-zinc-300">Classification</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MultiSelect
                    label="Categories"
                    name="categories"
                    options={categories.map(c => ({ value: c._id!, label: c.name }))}
                    selectedValues={formState.categories}
                    onSelectionChange={(value) => handleArrayFieldChange('categories', value)}
                  />
                  <MultiSelect
                    label="Tags"
                    name="tags"
                    options={tags.map(t => ({ value: t._id, label: t.name }))}
                    selectedValues={formState.tags}
                    onSelectionChange={(value) => handleArrayFieldChange('tags', value)}
                  />
                  <MultiSelect
                    label="Types"
                    name="types"
                    options={types.map(t => ({ value: t._id, label: t.type }))}
                    selectedValues={formState.types}
                    onSelectionChange={(value) => handleArrayFieldChange('types', value)}
                  />
                </div>
              </section>

              {/* SEO */}
              <section>
                <h2 className="text-lg font-medium mb-4 text-zinc-700 dark:text-zinc-300">SEO</h2>
                <div className="space-y-4">
                  <Field
                    label="SEO Title"
                    name="seoTitle"
                    placeholder="SEO-friendly title"
                    value={formState.seoTitle}
                    onChange={(e) => updateFormState({ seoTitle: e.target.value })}
                  />
                  <Field
                    label="SEO Description"
                    name="seoDescription"
                    type="textarea"
                    rows={2}
                    placeholder="SEO-friendly description"
                    value={formState.seoDescription}
                    onChange={(e) => updateFormState({ seoDescription: e.target.value })}
                  />
                  <Field
                    label="Keywords"
                    name="seoKeywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={formState.seoKeywords}
                    onChange={(e) => updateFormState({ seoKeywords: e.target.value })}
                  />
                </div>
              </section>
            </TabsContent>

            {/* Tab 2: Content */}
            <TabsContent value="content" className="space-y-6">
              <section>
                <h2 className="text-lg font-medium mb-4 text-zinc-700 dark:text-zinc-300">Content</h2>
                <div className="space-y-4">
                  {/* Markdown File Upload */}
                  <div>
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Upload Markdown File (Optional)</Label>
                    <div
                      {...getMdProps()}
                      className="p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-md cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors bg-white dark:bg-zinc-800"
                    >
                      <input {...getMdInput()} />
                      <p className="text-zinc-500 dark:text-zinc-400 text-center text-sm">
                        Drop a .md file here or click to browse
                      </p>
                    </div>
                  </div>

                  {/* Content Textarea */}
                  <div>
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Content (Markdown)</Label>
                    <Textarea
                      name="content"
                      rows={20}
                      value={formState.content}
                      onChange={(e) => updateFormState({ content: e.target.value })}
                      placeholder="Write your post content in Markdown..."
                      className="font-mono bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-zinc-900 dark:focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
                    />
                  </div>

                  {/* Content Preview */}
                  {formState.content && (
                    <div>
                      <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Preview</Label>
                      <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-800 max-h-96 overflow-y-auto">
                        <div className={proseClasses}>
                          <ReactMarkdown>
                            {formState.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </TabsContent>

            {/* Tab 3: Media */}
            <TabsContent value="media" className="space-y-6">
              <section>
                <h2 className="text-lg font-medium mb-4 text-zinc-700 dark:text-zinc-300">Media</h2>

                {/* Cover Image */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Cover Image</Label>
                    <div
                      {...getCoverProps()}
                      className="p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-md cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors bg-white dark:bg-zinc-800"
                    >
                      <input {...getCoverInput()} />
                      <p className="text-zinc-500 dark:text-zinc-400 text-center text-sm">
                        Drop a cover image here or click to browse
                      </p>
                    </div>

                    {coverPreview && (
                      <div className="mt-4 relative">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="max-w-md h-48 object-cover rounded-md border border-zinc-200 dark:border-zinc-700"
                        />
                        <button
                          type="button"
                          onClick={removeCoverImage}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors"
                        >
                          ×
                        </button>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{coverFile?.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Gallery Images</Label>
                    <div
                      {...getGalleryProps()}
                      className="p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-md cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors bg-white dark:bg-zinc-800"
                    >
                      <input {...getGalleryInput()} />
                      <p className="text-zinc-500 dark:text-zinc-400 text-center text-sm">
                        Drop gallery images here or click to browse
                      </p>
                    </div>

                    {galleryPreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryPreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Gallery preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-md border border-zinc-200 dark:border-zinc-700"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
                            >
                              ×
                            </button>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 truncate">{galleryFiles[index]?.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </TabsContent>
          </Tabs>

          {/* Hidden inputs to include form state in submission */}
          {formState.categories.map((categoryId) => (
            <input key={`category-${categoryId}`} type="hidden" name="categories" value={categoryId} />
          ))}
          {formState.tags.map((tagId) => (
            <input key={`tag-${tagId}`} type="hidden" name="tags" value={tagId} />
          ))}
          {formState.types.map((typeId) => (
            <input key={`type-${typeId}`} type="hidden" name="types" value={typeId} />
          ))}

          {/* Actions */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {/* Manual save draft button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const formData = new FormData();
                    formData.append("actionType", "saveDraft");
                    formData.append("title", formState.title);
                    formData.append("summary", formState.summary);
                    formData.append("content", formState.content);
                    formData.append("seoTitle", formState.seoTitle);
                    formData.append("seoDescription", formState.seoDescription);
                    formData.append("seoKeywords", formState.seoKeywords);

                    formState.categories.forEach(cat => formData.append("categories", cat));
                    formState.tags.forEach(tag => formData.append("tags", tag));
                    formState.types.forEach(type => formData.append("types", type));

                    fetcher.submit(formData, { method: "post" });
                  }}
                  className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900"
                  disabled={!formState.title.trim() || fetcher.state !== "idle"}
                >
                  {fetcher.state === "submitting" && fetcher.formData?.get("actionType") === "saveDraft"
                    ? "Saving Draft..."
                    : "Save Draft"
                  }
                </Button>

                {/* Draft info */}
                {draftId && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Draft available
                  </span>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
                  disabled={fetcher.state !== "idle"}
                >
                  {fetcher.state === "submitting" && fetcher.formData?.get("actionType") !== "saveDraft"
                    ? "Creating..."
                    : "Create Post"
                  }
                </Button>
              </div>
            </div>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}

// -------------------- UI Components --------------------
function Field({
  label,
  type = "text",
  className = "",
  value,
  onChange,
  ...props
}: {
  label?: string;
  type?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  [key: string]: any;
}) {
  const Component = type === "textarea" ? Textarea : Input;

  return (
    <div>
      {label && <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">{label}</Label>}
      <Component
        type={type !== "textarea" ? type : undefined}
        className={`bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-zinc-900 dark:focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 ${className}`}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}

function MultiSelect({
  label,
  name,
  options,
  selectedValues,
  onSelectionChange
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelectionChange: (value: string) => void;
}) {
  return (
    <div>
      <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">{label}</Label>
      <div className="space-y-2 max-h-32 overflow-y-auto border border-zinc-300 dark:border-zinc-600 rounded-md p-2 bg-white dark:bg-zinc-800">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={selectedValues.includes(opt.value)}
              onChange={() => onSelectionChange(opt.value)}
              className="rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
            />
            <span className="text-zinc-900 dark:text-zinc-100">{opt.label}</span>
          </label>
        ))}
      </div>
      {selectedValues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedValues.map((value) => {
            const option = options.find(opt => opt.value === value);
            return option ? (
              <span
                key={value}
                className="inline-flex items-center px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded"
              >
                {option.label}
                <button
                  type="button"
                  onClick={() => onSelectionChange(value)}
                  className="ml-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  ×
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}