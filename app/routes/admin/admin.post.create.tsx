import { useState, useEffect, useRef, useMemo } from "react";
import {
  Form,
  useLoaderData,
  useActionData,
  useNavigation,
  json,
  redirect,
  MetaFunction,
} from "@remix-run/react";
import ReactMarkdown from "react-markdown";
import {
  FileText,
  Save,
  X,
  Image,
  List,
  File,
  Upload,
  Eye,
  RotateCcw,
} from "lucide-react";
import { environment } from "../../environments/environment";
import { Category, Tag, Type } from "../../Types/types";

// Meta function to set the page title
export const meta: MetaFunction = () => {
  return [
    { title: "Create New Post - My Blog" },
    {
      name: "description",
      content:
        "Create a new blog post with Markdown support, categories, tags, and media uploads.",
    },
  ];
};

// Loader function to fetch categories, tags, and types
export async function loader() {
  try {
    const [categoriesRes, tagsRes, typesRes] = await Promise.all([
      fetch(`${environment.GO_BACKEND_URL}/categories`),
      fetch(`${environment.GO_BACKEND_URL}/tags`),
      fetch(`${environment.GO_BACKEND_URL}/types`),
    ]);

    if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
    if (!tagsRes.ok) throw new Error("Failed to fetch tags");
    if (!typesRes.ok) throw new Error("Failed to fetch types");

    const categories = (await categoriesRes.json()).categories;
    // console.log(categories);
    const tags = (await tagsRes.json()).tags;
    const types = (await typesRes.json()).types;

    return json({ categories, tags, types });
  } catch (error) {
    console.error("Loader error:", error);
    return json(
      { categories: [], tags: [], types: [], error: error.message },
      { status: 500 }
    );
  }
}

// Action function to handle form submission
export async function action({ request }) {
  try {
    const formData = await request.formData();
    const postData = {
      title: formData.get("title"),
      content: formData.get("content"),
      summary: formData.get("summary"),
      catids: formData.getAll("catids"),
      tagids: formData.getAll("tagids"),
      typeids: formData.getAll("typeids"),
      authorId: "user1", // Replace with actual user ID from auth
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Handle file uploads
    const coverImage = formData.get("coverImage");
    const gallery = formData.getAll("gallery");
    if (coverImage && coverImage.size) {
      postData.coverImage = coverImage;
    }
    if (gallery && gallery[0]?.size) {
      postData.gallery = gallery;
    }

    const response = await fetch(`${environment.GO_BACKEND_URL}/posts`, {
      method: "POST",
      body: formData, // Send as multipart form data
    });

    if (!response.ok) throw new Error("Failed to create post");
    return redirect("/posts"); // Redirect to posts list or dashboard
  } catch (error) {
    console.error("Action error:", error);
    return json(
      { success: false, message: "Failed to create post: " + error.message },
      { status: 500 }
    );
  }
}

export default function CreatePost() {
  const { categories, tags, types, error: loaderError } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    title: "",
    content: `# Welcome to Your Blog Post\n\nStart writing your **amazing** content here! You can use:\n\n## Markdown Features\n- **Bold text** with double asterisks\n- *Italic text* with single asterisks\n- \`inline code\` with backticks\n- [Links](https://example.com) with brackets and parentheses\n\n### Code Examples\n\`\`\`javascript\nfunction hello() {\n  console.log("Hello, World!");\n}\n\`\`\`\n\n> This is a blockquote.\n\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n\n---\n\nWrite your content and see the live preview on the right!`,
    summary: "",
    catids: [],
    tagids: [],
    typeids: [],
    coverImage: null,
    gallery: [],
    newTag: "",
  });
  const [previewCoverImage, setPreviewCoverImage] = useState(null);
  const [previewGallery, setPreviewGallery] = useState([]);
  const [googlePickerToken, setGooglePickerToken] = useState(null);
  const fileInputRef = useRef(null);
  const googlePickerRef = useRef(null);

  const parsedContent = useMemo(() => formData.content, [formData.content]);

  // Initialize Google Picker
  useEffect(() => {
    const loadGooglePicker = () => {
      window.gapi.load("picker", () => {
        setGooglePickerToken("loaded"); // Placeholder; replace with actual OAuth token
      });
    };
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.onload = loadGooglePicker;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e, field) => {
    const options = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, [field]: options }));
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" && formData.newTag.trim()) {
      e.preventDefault();
      // Simulate adding a new tag with a mock ID
      const newTag = { id: `tag${Date.now()}`, name: formData.newTag.trim() };
      setFormData((prev) => ({
        ...prev,
        tagids: [...prev.tagids, newTag.id],
        newTag: "",
      }));
      // In a real app, create the tag via API and update tags list
    }
  };

  const removeTag = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tagids: prev.tagids.filter((id) => id !== tagId),
    }));
  };

  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, coverImage: file }));
      setPreviewCoverImage(URL.createObjectURL(file));
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setFormData((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...files],
      }));
      setPreviewGallery((prev) => [
        ...prev,
        ...files.map((file) => URL.createObjectURL(file)),
      ]);
    }
  };

  const removeGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
    setPreviewGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMarkdownFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, content: event.target.result }));
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, content: event.target.result }));
      };
      reader.readAsText(file);
    } else if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setFormData((prev) => ({
          ...prev,
          content: `${prev.content}\n\n![Uploaded Image](data:${
            file.type
          };base64,${base64.split(",")[1]})`,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openGooglePicker = () => {
    if (!googlePickerToken) return;

    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setMimeTypes("text/markdown")
      .setOAuthToken(googlePickerToken) // Requires OAuth setup
      .setDeveloperKey("YOUR_GOOGLE_API_KEY") // Replace with your Google API key
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const fileId = data.docs[0].id;
          fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            {
              headers: {
                Authorization: `Bearer ${googlePickerToken}`,
              },
            }
          )
            .then((res) => res.text())
            .then((content) => {
              setFormData((prev) => ({ ...prev, content }));
            });
        }
      })
      .build();
    picker.setVisible(true);
    googlePickerRef.current = picker;
  };

  const handleClear = () => {
    setFormData({
      title: "",
      content: "",
      summary: "",
      catids: [],
      tagids: [],
      typeids: [],
      coverImage: null,
      gallery: [],
      newTag: "",
    });
    setPreviewCoverImage(null);
    setPreviewGallery([]);
  };

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Create New Post
          </h2>
          <a
            href="/posts"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </a>
        </div>

        {/* Error Messages */}
        {(loaderError || actionData?.message) && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            {loaderError || actionData?.message}
          </div>
        )}

        {/* Form */}
        <Form
          method="post"
          encType="multipart/form-data"
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter post title"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Summary
                </label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  placeholder="Enter a brief summary of the post"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Content (Markdown)
                </label>
                <div className="space-y-4">
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your post content in Markdown..."
                    rows={12}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                    required
                  />
                  <div className="flex gap-4">
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="flex-1"
                    >
                      <label className="flex flex-col items-center w-full p-4 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Drag and drop .md or image file here
                        </p>
                        <input
                          type="file"
                          accept=".md,image/*"
                          className="hidden"
                          onChange={handleMarkdownFileUpload}
                          ref={fileInputRef}
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={openGooglePicker}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                      disabled={!googlePickerToken}
                    >
                      <File className="w-4 h-4" />
                      Import from Google Drive
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tagids.map((tagId, index) => {
                    const tag = tags.find(
                      (t) => t.id === tagId || t.tagID === tagId
                    ) || { name: `Tag ${tagId}` };
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm"
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => removeTag(tagId)}
                          className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <input type="hidden" name="tagids" value={tagId} />
                      </div>
                    );
                  })}
                </div>
                <input
                  type="text"
                  name="newTag"
                  value={formData.newTag}
                  onChange={handleInputChange}
                  onKeyDown={handleTagInput}
                  placeholder="Add tags (press Enter to add)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Categories
                </label>
                <select
                  multiple
                  name="catids"
                  value={formData.catids}
                  onChange={(e) => handleMultiSelect(e, "catids")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                >
                  {categories.map((cat) => (
                    <option
                      key={cat.id || cat.catID}
                      value={cat.id || cat.catID}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Types */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Types
                </label>
                <select
                  multiple
                  name="typeids"
                  value={formData.typeids}
                  onChange={(e) => handleMultiSelect(e, "typeids")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                >
                  {types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cover Image */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Cover Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                    {previewCoverImage ? (
                      <img
                        src={previewCoverImage}
                        alt="Cover Preview"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Image className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Upload cover image
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      name="coverImage"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverImageUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Gallery */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Gallery Images
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Image className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Upload gallery images
                      </p>
                    </div>
                    <input
                      type="file"
                      name="gallery"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGalleryUpload}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {previewGallery.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Gallery ${index}`}
                        className="h-20 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Saving..." : "Save Post"}
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Live Preview
                </h2>
              </div>
              <div className="prose prose-invert max-w-none">
                {(formData.title ||
                  formData.summary ||
                  formData.catids.length ||
                  formData.tagids.length ||
                  formData.typeids.length) && (
                  <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {formData.title && (
                      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                        {formData.title}
                      </h1>
                    )}
                    {previewCoverImage && (
                      <img
                        src={previewCoverImage}
                        alt="Cover Preview"
                        className="w-full h-auto rounded-lg mb-4"
                      />
                    )}
                    {formData.summary && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {formData.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {formData.typeids.length > 0 && (
                        <span>
                          {types.find((t) => t.value === formData.typeids[0])
                            ?.label || "Type"}
                        </span>
                      )}
                      {formData.catids.length > 0 && (
                        <span>
                          {categories.find(
                            (c) =>
                              c.id === formData.catids[0] ||
                              c.catID === formData.catids[0]
                          )?.name || "Category"}
                        </span>
                      )}
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    {formData.tagids.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tagids.map((tagId) => {
                          const tag = tags.find(
                            (t) => t.id === tagId || t.tagID === tagId
                          );
                          return tag ? (
                            <span
                              key={tagId}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full"
                            >
                              {tag.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                )}
                {previewGallery.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {previewGallery.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Gallery ${index}`}
                        className="w-full h-auto rounded-lg"
                      />
                    ))}
                  </div>
                )}
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6 first:mt-0 pb-2 border-b border-gray-200 dark:border-gray-700">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-5 first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 mt-4 first:mt-0">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600 dark:text-gray-400">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-600 dark:text-gray-400">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900 dark:text-gray-100">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-900 dark:text-gray-100">
                        {children}
                      </em>
                    ),
                    code: ({ node, className, children, ...props }) => {
                      const isBlock = className?.includes("language-");
                      return (
                        <code
                          className={`${
                            isBlock
                              ? "block my-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                              : "inline px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                          } text-blue-600 dark:text-blue-400`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-600 dark:border-blue-400 pl-4 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 py-2 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900/50 text-left font-medium text-gray-900 dark:text-gray-100">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-600 dark:text-gray-400">
                        {children}
                      </td>
                    ),
                    hr: () => (
                      <hr className="my-8 border-t border-gray-200 dark:border-gray-700" />
                    ),
                    img: ({ src, alt }) => (
                      <img
                        src={src}
                        alt={alt}
                        className="w-full h-auto rounded-lg my-4"
                      />
                    ),
                  }}
                >
                  {parsedContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
