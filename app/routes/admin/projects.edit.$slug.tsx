import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { LuArrowLeft as ArrowLeft, LuSave as Save } from "react-icons/lu";
import { requireAdmin } from "~/utils/admin-auth.server";
import { saveProject, getProjectBySlug, type ProjectCaseStudy } from "~/Services/content.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const { slug } = params;
  if (!slug) throw new Response("Slug required", { status: 400 });

  const project = await getProjectBySlug(slug);
  if (!project) throw new Response("Project not found", { status: 404 });

  return json({ project });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();

  const title = String(formData.get("title") || "").trim();
  const slug = String(params.slug || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const period = String(formData.get("period") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const category = String(formData.get("category") || "Cloud & DevOps").trim();
  const techStackStr = String(formData.get("techStack") || "").trim();
  const techStack = techStackStr.split(",").map((t) => t.trim()).filter(Boolean);
  const demoUrl = String(formData.get("demoUrl") || "").trim() || undefined;
  const githubUrl = String(formData.get("githubUrl") || "").trim() || undefined;
  const featured = formData.get("featured") === "on";
  const order = Number(formData.get("order")) || 1;
  const content = String(formData.get("content") || "").trim();

  if (!title || !slug) {
    return json({ error: "Title and slug are required" }, { status: 400 });
  }

  const project: ProjectCaseStudy = {
    title,
    slug,
    summary,
    period,
    role,
    category,
    techStack,
    demoUrl,
    githubUrl,
    featured,
    order,
    content,
  };

  const success = await saveProject(project);
  if (!success) {
    return json({ error: "Failed to update project" }, { status: 500 });
  }

  return redirect("/admin/projects");
}

export default function AdminProjectEdit() {
  const { project } = useLoaderData<{ project: ProjectCaseStudy }>();
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/admin/projects"
          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Edit Project: {project.title}
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
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={project.title}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Slug (Read-Only)
            </label>
            <input
              type="text"
              name="slug"
              readOnly
              defaultValue={project.slug}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono text-zinc-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Category
            </label>
            <select
              name="category"
              defaultValue={project.category || "Cloud & DevOps"}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400"
            >
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="Networking & SDN">Networking & SDN</option>
              <option value="Observability & SRE">Observability & SRE</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Role
            </label>
            <input
              type="text"
              name="role"
              defaultValue={project.role}
              placeholder="Lead DevOps Architect"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Period / Timeline
            </label>
            <input
              type="text"
              name="period"
              defaultValue={project.period}
              placeholder="2024"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Summary / Executive Abstract
          </label>
          <textarea
            name="summary"
            rows={2}
            defaultValue={project.summary}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400 resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Tech Stack (Comma-separated)
          </label>
          <input
            type="text"
            name="techStack"
            defaultValue={project.techStack.join(", ")}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono focus:outline-none focus:border-zinc-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              GitHub Repository URL
            </label>
            <input
              type="url"
              name="githubUrl"
              defaultValue={project.githubUrl || ""}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Live Demo URL
            </label>
            <input
              type="url"
              name="demoUrl"
              defaultValue={project.demoUrl || ""}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 py-1">
          <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={project.featured}
              className="rounded"
            />
            <span>Feature on Homepage</span>
          </label>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Order:</span>
            <input
              type="number"
              name="order"
              defaultValue={project.order ?? 1}
              className="w-16 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-center"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Case Study Content (Markdown & Mermaid supported)
          </label>
          <textarea
            name="content"
            rows={14}
            defaultValue={project.content}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono leading-relaxed focus:outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/admin/projects"
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
            <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </Form>
    </div>
  );
}
