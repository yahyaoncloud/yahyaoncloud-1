import { json, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";

// Mock database service (replace with actual database implementation)
const db = {
    async getSettings() {
        // Simulated settings data
        return {
            siteTitle: "My Blog",
            siteDescription: "A blog about technology and lifestyle",
            defaultAuthor: "John Doe",
            metaKeywords: "blog, technology, lifestyle",
        };
    },
    async updateSettings(data: { siteTitle: string; siteDescription: string; defaultAuthor: string; metaKeywords: string }) {
        // Simulated update operation
        return data;
    },
};

export async function loader({ request }: LoaderFunctionArgs) {
    const settings = await db.getSettings();
    return json({ settings });
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    try {
        if (intent === "update") {
            const siteTitle = formData.get("siteTitle") as string;
            const siteDescription = formData.get("siteDescription") as string;
            const defaultAuthor = formData.get("defaultAuthor") as string;
            const metaKeywords = formData.get("metaKeywords") as string;

            if (!siteTitle || !siteDescription || !defaultAuthor) {
                return json({ success: false, error: "All fields are required" }, { status: 400 });
            }

            const updatedSettings = await db.updateSettings({
                siteTitle,
                siteDescription,
                defaultAuthor,
                metaKeywords,
            });

            return json({ success: true, message: "Settings updated successfully", settings: updatedSettings });
        }
    } catch (error) {
        return json({ success: false, error: error.message }, { status: 400 });
    }

    return json({ success: false, error: "Unknown action" }, { status: 400 });
}

export default function Settings() {
    const { settings } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const { toast } = useToast();
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        siteTitle: settings.siteTitle,
        siteDescription: settings.siteDescription,
        defaultAuthor: settings.defaultAuthor,
        metaKeywords: settings.metaKeywords,
    });

    useEffect(() => {
        if (actionData?.success) {
            toast({ title: "Success", description: actionData.message });
            setFormData({
                siteTitle: actionData.settings.siteTitle,
                siteDescription: actionData.settings.siteDescription,
                defaultAuthor: actionData.settings.defaultAuthor,
                metaKeywords: actionData.settings.metaKeywords,
            });
        } else if (actionData?.error) {
            toast({ title: "Error", description: actionData.error, variant: "destructive" });
        }
    }, [actionData, toast]);

    return (
        <div className="container mx-auto p-4">
            <Card className="border border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-900 dark:text-zinc-100">Blog Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form method="post" className="space-y-4 mb-6">
                        <input type="hidden" name="intent" value="update" />
                        <div>
                            <Label htmlFor="siteTitle" className="text-zinc-900 dark:text-zinc-100">
                                Site Title
                            </Label>
                            <Input
                                id="siteTitle"
                                name="siteTitle"
                                value={formData.siteTitle}
                                onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                                placeholder="Enter site title"
                            />
                        </div>
                        <div>
                            <Label htmlFor="siteDescription" className="text-zinc-900 dark:text-zinc-100">
                                Site Description
                            </Label>
                            <Textarea
                                id="siteDescription"
                                name="siteDescription"
                                value={formData.siteDescription}
                                onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                                placeholder="Enter site description"
                                rows={4}
                            />
                        </div>
                        <div>
                            <Label htmlFor="defaultAuthor" className="text-zinc-900 dark:text-zinc-100">
                                Default Author
                            </Label>
                            <Input
                                id="defaultAuthor"
                                name="defaultAuthor"
                                value={formData.defaultAuthor}
                                onChange={(e) => setFormData({ ...formData, defaultAuthor: e.target.value })}
                                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                                placeholder="Enter default author name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="metaKeywords" className="text-zinc-900 dark:text-zinc-100">
                                Meta Keywords
                            </Label>
                            <Input
                                id="metaKeywords"
                                name="metaKeywords"
                                value={formData.metaKeywords}
                                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                                placeholder="Enter meta keywords (comma-separated)"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={navigation.state === "submitting"}
                            className="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                        >
                            Save Settings
                        </Button>
                    </Form>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-200 dark:border-zinc-700">
                                <TableHead className="text-zinc-900 dark:text-zinc-100">Setting</TableHead>
                                <TableHead className="text-zinc-900 dark:text-zinc-100">Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="border-zinc-200 dark:border-zinc-700">
                                <TableCell className="text-zinc-900 dark:text-zinc-100">Site Title</TableCell>
                                <TableCell className="text-zinc-600 dark:text-zinc-400">{formData.siteTitle}</TableCell>
                            </TableRow>
                            <TableRow className="border-zinc-200 dark:border-zinc-700">
                                <TableCell className="text-zinc-900 dark:text-zinc-100">Site Description</TableCell>
                                <TableCell className="text-zinc-600 dark:text-zinc-400">{formData.siteDescription}</TableCell>
                            </TableRow>
                            <TableRow className="border-zinc-200 dark:border-zinc-700">
                                <TableCell className="text-zinc-900 dark:text-zinc-100">Default Author</TableCell>
                                <TableCell className="text-zinc-600 dark:text-zinc-400">{formData.defaultAuthor}</TableCell>
                            </TableRow>
                            <TableRow className="border-zinc-200 dark:border-zinc-700">
                                <TableCell className="text-zinc-900 dark:text-zinc-100">Meta Keywords</TableCell>
                                <TableCell className="text-zinc-600 dark:text-zinc-400">{formData.metaKeywords}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}