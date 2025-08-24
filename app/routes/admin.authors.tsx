import { json, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { getAllAuthors, createAuthor, updateAuthor, deleteAuthor } from "../Services/post.server";
import { useToast } from "../hooks/use-toast";

export async function loader({ request }: LoaderFunctionArgs) {
    const authors = await getAllAuthors();
    return json({ authors });
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    try {
        const payload = {
            authorId: formData.get("authorId") as string,
            authorName: formData.get("authorName") as string,
            authorProfession: formData.get("authorProfession") as string,
            userId: formData.get("userId") as string,
            contactDetails: {
                email: formData.get("email") as string,
                phone: formData.get("phone") as string,
                linkedin: formData.get("linkedin") as string,
                github: formData.get("github") as string,
                twitter: formData.get("twitter") as string,
                website: formData.get("website") as string,
            },
        };

        if (intent === "create") {
            await createAuthor(payload);
            return json({ success: true, message: "Author created" });
        }
        if (intent === "update") {
            const id = formData.get("id") as string;
            await updateAuthor(id, payload);
            return json({ success: true, message: "Author updated" });
        }
        if (intent === "delete") {
            const id = formData.get("id") as string;
            await deleteAuthor(id);
            return json({ success: true, message: "Author deleted" });
        }
    } catch (error: any) {
        return json({ success: false, error: error.message }, { status: 400 });
    }
}

export default function Authors() {
    const { authors } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const { toast } = useToast();
    const navigation = useNavigation();

    const [editingAuthor, setEditingAuthor] = useState<any | null>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (actionData?.success) {
            toast({ title: "Success", description: actionData.message });
            setEditingAuthor(null);
            setCreating(false);
        } else if (actionData?.error) {
            toast({ title: "Error", description: actionData.error, variant: "destructive" });
        }
    }, [actionData, toast]);

    const AuthorFormModal = ({ mode, author }: { mode: "create" | "edit"; author?: any }) => {
        const closeModal = () => (mode === "create" ? setCreating(false) : setEditingAuthor(null));
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-6 rounded-xl w-full max-w-lg shadow-lg relative">
                    {/* Close Button */}
                    <div className="flex justify-between items-center  mb-6">

                        <h2 className="text-xl font-semibold ">{mode === "create" ? "Create Author" : "Edit Author"}</h2>
                        <button
                            type="button"
                            onClick={closeModal}
                            className=" text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                    <Form method="post" className="space-y-3 ">
                        <input type="hidden" name="intent" value={mode === "create" ? "create" : "update"} />
                        {mode === "edit" && <input type="hidden" name="id" value={author._id} />}
                        <Label>Author ID</Label>
                        <Input name="authorId" defaultValue={author?.authorId || ""} className="dark:bg-zinc-800" />
                        <Label>Name</Label>
                        <Input name="authorName" defaultValue={author?.authorName || ""} className="dark:bg-zinc-800" />
                        <Label>Profession</Label>
                        <Input name="authorProfession" defaultValue={author?.authorProfession || ""} className="dark:bg-zinc-800" />
                        <Label>User ID</Label>
                        <Input name="userId" defaultValue={author?.userId || ""} className="dark:bg-zinc-800" />
                        <Label>Email</Label>
                        <Input name="email" defaultValue={author?.contactDetails?.email || ""} className="dark:bg-zinc-800" />
                        <Label>Phone</Label>
                        <Input name="phone" defaultValue={author?.contactDetails?.phone || ""} className="dark:bg-zinc-800" />
                        <Label>LinkedIn</Label>
                        <Input name="linkedin" defaultValue={author?.contactDetails?.linkedin || ""} className="dark:bg-zinc-800" />
                        <Label>GitHub</Label>
                        <Input name="github" defaultValue={author?.contactDetails?.github || ""} className="dark:bg-zinc-800" />
                        <Label>Twitter</Label>
                        <Input name="twitter" defaultValue={author?.contactDetails?.twitter || ""} className="dark:bg-zinc-800" />
                        <Label>Website</Label>
                        <Input name="website" defaultValue={author?.contactDetails?.website || ""} className="dark:bg-zinc-800" />
                        <div className="flex gap-2 mt-4">
                            <Button
                                type="submit"
                                disabled={navigation.state === "submitting"}
                                className="bg-zinc-700 dark:bg-zinc-300 text-zinc-100 dark:text-zinc-900"
                            >
                                {mode === "create" ? "Create" : "Save"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                className="border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200"
                            >
                                Cancel
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Authors</CardTitle>
                        <Button
                            onClick={() => setCreating(true)}
                            className="border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                        >
                            + Create Author
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-200 dark:border-zinc-700">
                                <TableHead>Name</TableHead>
                                <TableHead>Profession</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {authors.map((author) => (
                                <TableRow key={author._id} className="border-zinc-200 dark:border-zinc-700">
                                    <TableCell>{author.authorName}</TableCell>
                                    <TableCell>{author.authorProfession}</TableCell>
                                    <TableCell>{author.contactDetails.email || "N/A"}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingAuthor(author)}
                                            className="mr-2 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                                        >
                                            Edit
                                        </Button>
                                        <Form method="post" className="inline">
                                            <input type="hidden" name="intent" value="delete" />
                                            <input type="hidden" name="id" value={author._id} />
                                            <Button type="submit" variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
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
            {creating && <AuthorFormModal mode="create" />}
            {editingAuthor && <AuthorFormModal mode="edit" author={editingAuthor} />}
        </div>
    );
}
