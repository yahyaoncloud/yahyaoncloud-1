import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { LuPlus as Plus, LuPencil as Edit2, LuTrash2 as Trash2, LuExternalLink as ExternalLink, LuBriefcase as Briefcase, LuEye as Eye } from "react-icons/lu";
import { requireAdmin } from "~/utils/admin-auth.server";
import { getAllProjects, deleteProject, type ProjectCaseStudy } from "~/Services/content.server";
import { AdminPageHeader, AdminDataTable, type Column } from "~/components/admin";
import { Button } from "~/components/ui/button";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const projects = await getAllProjects();
  return json({ projects });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const slug = formData.get("slug");
    if (typeof slug === "string") {
      await deleteProject(slug);
      return json({ success: true, message: "Project deleted successfully" });
    }
  }

  return json({ success: false, error: "Invalid intent" }, { status: 400 });
}

export default function AdminProjects() {
  const { projects } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();

  const handleDelete = (slug: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const formData = new FormData();
      formData.append("intent", "delete");
      formData.append("slug", slug);
      submit(formData, { method: "post" });
    }
  };

  const columns: Column<ProjectCaseStudy>[] = [
    {
      header: "Project Title",
      accessorKey: "title",
      sortable: true,
      cell: (project) => (
        <div className="space-y-0.5 max-w-md">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {project.title}
            </span>
            {project.featured && (
              <span className="text-[10px] font-medium font-mono px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                Featured
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 line-clamp-1">
            {project.summary}
          </p>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      sortable: true,
      width: "160px",
      cell: (project) => (
        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
          {project.category || "Engineering"}
        </span>
      ),
    },
    {
      header: "Timeline / Role",
      accessorKey: "period",
      width: "140px",
      cell: (project) => (
        <span className="font-mono text-xs text-zinc-500">
          {project.period || project.role || "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      width: "140px",
      cell: (project) => (
        <div className="flex items-center justify-end gap-1.5">
          <a
            href={`/projects/${project.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="View Live Case Study"
          >
            <ExternalLink size={15} />
          </a>
          <Link
            to={`/admin/projects/edit/${project.slug}`}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Edit Project"
          >
            <Edit2 size={14} />
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(project.slug, project.title)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            title="Delete Project"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Project Case Studies"
        description="Manage featured architecture blueprints, systems engineering projects, and case studies."
        actions={
          <Link to="/admin/projects/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus size={15} className="mr-1.5" />
              <span>Create Project</span>
            </Button>
          </Link>
        }
      />

      <AdminDataTable
        columns={columns}
        data={projects}
        keyField="slug"
        searchable
        searchPlaceholder="Search projects by title, category, or summary..."
        searchKeys={["title", "category", "summary"]}
        pageSize={10}
        emptyIcon={Briefcase}
        emptyMessage="No project case studies found."
        emptyAction={
          <Link to="/admin/projects/create">
            <Button size="sm" variant="outline" className="mt-2">
              <Plus size={14} className="mr-1" />
              Create First Project
            </Button>
          </Link>
        }
        isLoading={navigation.state === "loading"}
      />
    </div>
  );
}
