import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { requireAdmin } from "~/utils/admin-auth.server";
import { getAllResearchPapers, deleteResearchPaper, type ResearchPaper } from "~/Services/content.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const papers = await getAllResearchPapers();
  return json({ papers });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const slug = formData.get("slug");
    if (typeof slug === "string") {
      await deleteResearchPaper(slug);
      return json({ success: true });
    }
  }

  return json({ success: false }, { status: 400 });
}

export default function AdminResearch() {
  const { papers } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleDelete = (slug: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const formData = new FormData();
      formData.append("intent", "delete");
      formData.append("slug", slug);
      submit(formData, { method: "post" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Research Papers & Whitepapers
          </h1>
          <p className="text-xs text-zinc-500">
            Manage academic papers, benchmarks, and experimental research studies.
          </p>
        </div>
        <Link
          to="/admin/research/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
        >
          <Plus size={14} />
          <span>New Paper</span>
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {papers.map((paper: ResearchPaper) => (
            <div
              key={paper.slug}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {paper.title}
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {paper.venue} ({paper.year})
                  </span>
                  {paper.featured && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 line-clamp-1">
                  {paper.abstract}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <a
                  href={`/research`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                  title="View Live"
                >
                  <ExternalLink size={15} />
                </a>
                <Link
                  to={`/admin/research/edit/${paper.slug}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={() => handleDelete(paper.slug, paper.title)}
                  className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {papers.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-400">
              No research papers found. Add your first paper above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
