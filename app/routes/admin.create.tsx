import { motion } from "framer-motion";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { useTheme } from "~/contexts/ThemeContext";
import type { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Post, Category, Tag, MediaAsset } from "~/Types/types";
import { environment } from "~/environments/environment";

// Utility to generate a random ID (replacement for UUID/ObjectId)
function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Loader function to fetch categories and tags
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const [catRes, tagRes] = await Promise.all([
      fetch(`${environment.GO_BACKEND_URL}/categories`),
      fetch(`${environment.GO_BACKEND_URL}/tags`),
    ]);
    const categories: Category[] = await catRes.json();
    const availableTags: Tag[] = await tagRes.json();
    return json({ categories, availableTags });
  } catch (error) {
    console.error("Error fetching categories or tags:", error);
    return json(
      {
        categories: [],
        availableTags: [],
        error: "Failed to load categories and tags",
      },
      { status: 500 }
    );
  }
};

// Action function to handle form submission
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get("title");
  const content = formData.get("content");
  const type = formData.get("type");
  const categoryId = formData.get("categoryId");
  const newCategoryName = formData.get("newCategoryName");
  const addNewCategory = formData.get("addNewCategory") === "on";
  const tagIds = formData.get("tagIds");
  const coverImageUrl = formData.get("coverImageUrl");
  const seoTitle = formData.get("seoTitle");
  const seoDescription = formData.get("seoDescription");
  const seoKeywords = formData.get("seoKeywords");

  // Validation
  if (
    typeof title !== "string" ||
    typeof content !== "string" ||
    typeof type !== "string" ||
    typeof tagIds !== "string" ||
    typeof seoTitle !== "string" ||
    typeof seoDescription !== "string" ||
    typeof seoKeywords !== "string" ||
    (addNewCategory && typeof newCategoryName !== "string") ||
    (!addNewCategory && typeof categoryId !== "string")
  ) {
    return json(
      { error: "All required fields must be provided" },
      { status: 400 }
    );
  }

  if (title.length < 3) {
    return json(
      { error: "Title must be at least 3 characters long" },
      { status: 400 }
    );
  }

  if (content.length < 10) {
    return json(
      { error: "Content must be at least 10 characters long" },
      { status: 400 }
    );
  }

  if (!["article", "news", "tutorial"].includes(type)) {
    return json({ error: "Invalid post type" }, { status: 400 });
  }

  // Fetch categories and tags to validate
  const [catRes, tagRes] = await Promise.all([
    fetch(`${environment.GO_BACKEND_URL}/categories`),
    fetch(`${environment.GO_BACKEND_URL}/tags`),
  ]);
  const categories: Category[] = await catRes.json();
  const availableTags: Tag[] = await tagRes.json();

  // Handle category selection or creation
  let finalCategoryId: string;
  if (addNewCategory) {
    if (!newCategoryName || newCategoryName.trim().length < 3) {
      return json(
        { error: "New category name must be at least 3 characters long" },
        { status: 400 }
      );
    }
    try {
      const response = await fetch(`${environment.GO_BACKEND_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, "-"),
          catID: generateId(),
          id: generateId(),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create new category");
      }
      const newCategory: Category = await response.json();
      finalCategoryId = newCategory.id;
    } catch (error) {
      console.error("Error creating new category:", error);
      return json({ error: "Failed to create new category" }, { status: 500 });
    }
  } else {
    if (!categoryId || !categories.some((cat) => cat.id === categoryId)) {
      return json(
        { error: "A valid category must be selected" },
        { status: 400 }
      );
    }
    finalCategoryId = categoryId;
  }

  const selectedTagIds = tagIds
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  const tags = selectedTagIds
    .map((tagId) => {
      const foundTag = availableTags.find((t) => t.id === tagId);
      return foundTag
        ? { id: foundTag.id, name: foundTag.name, tagID: foundTag.tagID }
        : null;
    })
    .filter((tag): tag is Tag => tag !== null);

  if (seoTitle.length < 3) {
    return json(
      { error: "SEO title must be at least 3 characters long" },
      { status: 400 }
    );
  }

  if (seoDescription.length < 10) {
    return json(
      { error: "SEO description must be at least 10 characters long" },
      { status: 400 }
    );
  }

  const keywords = seoKeywords
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
  if (keywords.length === 0) {
    return json(
      { error: "At least one SEO keyword is required" },
      { status: 400 }
    );
  }

  // Prepare cover image
  const coverImage = coverImageUrl
    ? {
        id: generateId(),
        url: coverImageUrl as string,
        altText: `Cover image for ${title}`,
        uploadedBy: "admin",
        type: "image" as const,
        createdAt: new Date().toISOString(),
      }
    : undefined;

  // Prepare post data
  const post: Post = {
    id: generateId(),
    title,
    content,
    summary: content.slice(0, 150),
    type: type as "article" | "news" | "tutorial",
    date: new Date().toISOString().slice(0, 10),
    authorId: "admin",
    categoryId: finalCategoryId,
    tags,
    coverImage,
    gallery: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Send post to Go backend
  try {
    const response = await fetch(`${environment.GO_BACKEND_URL}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      throw new Error(`Failed to save post: ${response.statusText}`);
    }

    return redirect("/admin/blog");
  } catch (error) {
    console.error("Error saving post:", error);
    return json({ error: "Failed to save post" }, { status: 500 });
  }
}

// Frontend component
export default function BlogPostCreatePage() {
  const { theme } = useTheme();
  const actionData = useActionData<typeof action>();
  const {
    categories,
    availableTags,
    error: loaderError,
  } = useLoaderData<{
    categories: Category[];
    availableTags: Tag[];
    error?: string;
  }>();
  const [showContent, setShowContent] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"article" | "news" | "tutorial">("article");
  const [categoryId, setCategoryId] = useState("");
  const [addNewCategory, setAddNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [tagIds, setTagIds] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <h1
          className={`text-3xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Create New Blog Post
        </h1>
      </header>

      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={`rounded-lg shadow-xl p-8 transition-all duration-300 ${
            theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-900"
          }`}
        >
          <Form method="post" className="space-y-6">
            {/* Title */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label
                htmlFor="title"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Enter your blog post title"
              />
            </motion.div>

            {/* Type */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label
                htmlFor="type"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Post Type
              </label>
              <select
                name="type"
                id="type"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "article" | "news" | "tutorial")
                }
                required
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="article">Article</option>
                <option value="news">News</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </motion.div>

            {/* Category Selection */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label
                htmlFor="categoryId"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Category
              </label>
              <select
                name="categoryId"
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={addNewCategory}
                required={!addNewCategory}
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${addNewCategory ? "opacity-50" : ""}`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  checked={addNewCategory}
                  onChange={(e) => {
                    setAddNewCategory(e.target.checked);
                    if (!e.target.checked) setNewCategoryName("");
                  }}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Add New Category
                </span>
              </label>
              {addNewCategory && (
                <input
                  type="text"
                  name="newCategoryName"
                  id="newCategoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required={addNewCategory}
                  className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="Enter new category name"
                />
              )}
            </motion.div>

            {/* Tag IDs */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <label
                htmlFor="tagIds"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Tag IDs (comma-separated)
              </label>
              <input
                type="text"
                name="tagIds"
                id="tagIds"
                value={tagIds}
                onChange={(e) => setTagIds(e.target.value)}
                required
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="e.g., tag1,tag2"
              />
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Available tags:{" "}
                {availableTags
                  .map((tag) => `${tag.name} (${tag.id})`)
                  .join(", ")}
              </p>
            </motion.div>

            {/* Cover Image */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <label
                htmlFor="coverImageUrl"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Cover Image URL
              </label>
              <input
                type="url"
                name="coverImageUrl"
                id="coverImageUrl"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Enter image URL (optional)"
              />
            </motion.div>

            {/* Content */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <div className="flex justify-between items-center">
                <label
                  htmlFor="content"
                  className={`block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Content
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showContent}
                    onChange={() => setShowContent((v) => !v)}
                    className="rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Expand Editor
                  </span>
                </label>
              </div>
              <textarea
                name="content"
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={showContent ? 15 : 8}
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Write your blog post content..."
              />
            </motion.div>

            {/* SEO Fields */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <label
                htmlFor="seoTitle"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                SEO Title
              </label>
              <input
                type="text"
                name="seoTitle"
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                required
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Enter SEO title"
              />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <label
                htmlFor="seoDescription"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                SEO Description
              </label>
              <textarea
                name="seoDescription"
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                required
                rows={3}
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Enter SEO description"
              />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              <label
                htmlFor="seoKeywords"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                SEO Keywords (comma-separated)
              </label>
              <input
                type="text"
                name="seoKeywords"
                id="seoKeywords"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                required
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="e.g., cloud, aws, devops"
              />
            </motion.div>

            {/* Error/Success Feedback */}
            {(actionData?.error || loaderError) && (
              <motion.div
                className={`text-sm p-3 rounded-md ${
                  theme === "dark"
                    ? "bg-red-900/30 text-red-400"
                    : "bg-red-100 text-red-500"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {actionData?.error || loaderError}
              </motion.div>
            )}

            {/* Form Actions */}
            <motion.div
              className="flex justify-end space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            >
              <motion.button
                type="button"
                onClick={() => {
                  setTitle("");
                  setContent("");
                  setType("article");
                  setCategoryId("");
                  setAddNewCategory(false);
                  setNewCategoryName("");
                  setTagIds("");
                  setCoverImageUrl("");
                  setSeoTitle("");
                  setSeoDescription("");
                  setSeoKeywords("");
                }}
                className={`px-4 py-2 rounded-md transition-colors ${
                  theme === "dark"
                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear
              </motion.button>
              <motion.button
                type="submit"
                className={`px-4 py-2 rounded-md transition-colors ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Post
              </motion.button>
            </motion.div>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
