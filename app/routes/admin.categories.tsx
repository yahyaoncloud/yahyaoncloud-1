import { json, redirect, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { createCategory, getAllCategories, updateCategory, deleteCategory } from "../Services/post.server";
import { useToast } from "../hooks/use-toast";

export async function loader({ request }: LoaderFunctionArgs) {
    const categories = await getAllCategories();
    return json({ categories });
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    try {
        if (intent === "create") {
            const name = formData.get("name") as string;
            const slug = formData.get("slug") as string;
            await createCategory({ name, slug });
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
    } catch (error) {
        return json({ success: false, error: error.message }, { status: 400 });
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

    return (
        <div className="container mx-auto p-4">
            <Card className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <CardHeader>
                    <CardTitle>Manage Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form method="post" className="space-y-4 mb-6">
                        <input type="hidden" name="intent" value={editingId ? "update" : "create"} />
                        {editingId && <input type="hidden" name="id" value={editingId} />}
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                                defaultValue={editingId ? categories.find(c => c._id === editingId)?.name : ""}
                            />
                        </div>
                        <div>
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                name="slug"
                                className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                                defaultValue={editingId ? categories.find(c => c._id === editingId)?.slug : ""}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={navigation.state === "submitting"}
                            className="bg-zinc-700 dark:bg-zinc-300 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-600 dark:hover:bg-zinc-400"
                        >
                            {editingId ? "Update" : "Create"} Category
                        </Button>
                        {editingId && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                                className="border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
                            >
                                Cancel Edit
                            </Button>
                        )}
                    </Form>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-200 dark:border-zinc-700">
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category._id} className="border-zinc-200 dark:border-zinc-700">
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.slug}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingId(category._id)}
                                            className="mr-2 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
                                        >
                                            Edit
                                        </Button>
                                        <Form method="post" className="inline">
                                            <input type="hidden" name="intent" value="delete" />
                                            <input type="hidden" name="id" value={category._id} />
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Delete
                                            </Button>
                                        </Form>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}