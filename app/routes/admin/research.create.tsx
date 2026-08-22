import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { ArrowLeft, Save } from "lucide-react";
import { requireAdmin } from "~/utils/admin-auth.server";
import { saveResearchPaper, type ResearchPaper } from "~/Services/content.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();

  const title = String(formData.get("title") || "").trim();
  let slug = String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  if (!slug) slug = title.toLowerCase().replace(/[^a-z0-9_-]/g, "-");

  const authorsStr = String(formData.get("authors") || "Yahya").trim();
  const authors = authorsStr.split(",").map((a) => a.trim()).filter(Boolean);
  const venue = String(formData.get("venue") || "Technical Whitepaper").trim();
  const year = String(formData.get("year") || new Date().getFullYear()).trim();
  const pdfUrl = String(formData.get("pdfUrl") || "").trim() || undefined;
  const doi = String(formData.get("doi") || "").trim() || undefined;
  const tagsStr = String(formData.get("tags") || "").trim();
  const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
  const abstract = String(formData.get("abstract") || "").trim();
  const featured = formData.get("featured") === "on";
  const order = Number(formData.get("order")) || 1;
  const content = String(formData.get("content") || "").trim();

  if (!title || !slug) {
    return json({ error: "Title and slug are required" }, { status: 400 });
  }

  const paper: ResearchPaper = {
    title,
    slug,
    authors,
    venue,
    year,
    pdfUrl,
    doi,
    tags,
    abstract,
    featured,
    order,
    content,
  };

  const success = await saveResearchPaper(paper);
  if (!success) {
    return json({ error: "Failed to save research paper" }, { status: 500 });
  }

  return redirect("/admin/research");
}

export default function AdminResearchCreate() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/admin/research"
          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Add Research Paper
        </h1>
      </div>

      {actionData?.error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-xs text-red-600 border border-red-200 dark:border-red-900">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Paper Title *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Zero-Trust Network Topologies in Hybrid Clouds"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Slug (URL Identifier)
            </label>
            <input
              type="text"
              name="slug"
              placeholder="zero-trust-network-topologies"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Authors (Comma-separated)
            </label>
            <input
              type="text"
              name="authors"
              defaultValue="Yahya"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Publication Venue / Journal
            </label>
            <input
              type="text"
              name="venue"
              defaultValue="Technical Whitepaper"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Year
            </label>
            <input
              type="text"
              name="year"
              defaultValue={new Date().getFullYear()}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Abstract / Executive Summary
          </label>
          <textarea
            name="abstract"
            rows={3}
            required
            placeholder="A concise summary of the empirical findings and architecture..."
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              placeholder="SDN, eBPF, Zero-Trust, Kubernetes"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              PDF Document URL (Supabase or External)
            </label>
            <input
              type="url"
              name="pdfUrl"
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 py-1">
          <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input type="checkbox" name="featured" className="rounded" />
            <span>Feature on Homepage</span>
          </label>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Order:</span>
            <input
              type="number"
              name="order"
              defaultValue={1}
              className="w-16 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-center"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Full Findings & Technical Paper Body (Markdown)
          </label>
          <textarea
            name="content"
            rows={12}
            placeholder="# 1. Introduction&#10;&#10;Explain methodology and technical architecture..."
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono leading-relaxed focus:outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/admin/research"
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSubmitting ? "Saving..." : "Publish Paper"}</span>
          </button>
        </div>
      </Form>
    </div>
  );
}
