import { json, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/Card";
import { 
  getCategoriesWithCount, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "~/Services/category.prisma.server";
import { useToast } from "~/hooks/use-toast";
import { AdminDataTable, type Column } from "~/components/AdminDataTable";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const categories = await getCategoriesWithCount();
    return json({ categories });
  } catch (error) {
    console.error("Categories loader error:", error);
    return json({ categories: [], error: "Failed to load categories" }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "create") {
      const name = formData.get("name") as string;
      const slug = formData.get("slug") as string || undefined;
      await createCategory(name, slug);
      return json({ success: true, message: "Category created" });
    } else if (intent === "update") {
      const id = formData.get("id") as string;
      const name = formData.get("name") as string;
      const slug = formData.get("slug") as string;
      await updateCategory(id, { name, slug });
      return json({ success: true, message: "Category updated" });
    } else if (intent === "delete") {
      const id = formData.get("id") as string;
      await deleteCategory(id);
      return json({ success: true, message: "Category deleted" });
    }
    return json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Action failed" 
    }, { status: 400 });
  }
}

export default function Categories() {
    const { categories } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const { toast } = useToast();
    const navigation = useNavigation();
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (actionData?.success) {
            toast({ title: "Success", description: actionData.message });
            setEditingId(null);
        } else if (actionData?.error) {
            toast({ title: "Error", description: actionData.error, variant: "destructive" });
        }
    }, [actionData, toast]);

    const isSubmitting = navigation.state === "submitting";

    const columns: Column<any>[] = [
        { header: "Name", accessorKey: "name", className: "w-[30%]" },
        { header: "Slug", accessorKey: "slug", className: "w-[30%] text-zinc-500 font-mono text-xs" },
        { 
            header: "Posts", 
            accessorKey: "postCount", 
            cell: (item) => <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">{item.postCount || 0}</span>
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (item) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingId(item.id)}
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                        <Pencil size={14} />
                    </Button>
                    <Form method="post" className="inline" onSubmit={(e) => { if(!confirm("Delete this category?")) e.preventDefault(); }}>
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={item.id} />
                        <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </Form>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Tag size={24} className="text-indigo-600 dark:text-indigo-400"/> Categories
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                             Organize your posts with categories.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Create / Edit Form */}
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 sticky top-8">
                            <h2 className="font-medium mb-4">{editingId ? "Edit Category" : "New Category"}</h2>
                            <Form method="post" className="space-y-4">
                                <input type="hidden" name="intent" value={editingId ? "update" : "create"} />
                                {editingId && <input type="hidden" name="id" value={editingId} />}
                                
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Technology"
                                        defaultValue={editingId ? categories.find((c: any) => c.id === editingId)?.name : ""}
                                        required
                                    />
                                </div>
                                
                                <div className="space-y-1.5">
                                    <Label htmlFor="slug">Slug (Optional)</Label>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        placeholder="e.g. technology"
                                        defaultValue={editingId ? categories.find((c: any) => c.id === editingId)?.slug : ""}
                                    />
                                </div>

                                <div className="pt-2 flex flex-col gap-2">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {editingId ? "Update Category" : "Create Category"}
                                    </Button>
                                    {editingId && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setEditingId(null)}
                                            className="w-full text-zinc-500"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="md:col-span-2">
                        <AdminDataTable 
                            columns={columns} 
                            data={categories} 
                            className="bg-white dark:bg-zinc-900"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
