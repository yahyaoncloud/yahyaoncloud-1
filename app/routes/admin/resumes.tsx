// Admin Resumes - Manage PDF resumes
import { json, LoaderFunctionArgs, ActionFunctionArgs, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react";
import { getAllResumes, createResume, deleteResume, toggleResumeActive } from "~/Services/resume.server";
import { uploadToSupabase } from "~/utils/supabase.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "~/components/ui/table";
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  FileText, 
  Upload, 
  QrCode,
  Download
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export async function loader({ request }: LoaderFunctionArgs) {
  const resumes = await getAllResumes();
  return json({ resumes });
}

export async function action({ request }: ActionFunctionArgs) {
  const contentType = request.headers.get("Content-Type") || "";
  
  try {
    if (contentType.includes("multipart/form-data")) {
      const uploadHandler = unstable_composeUploadHandlers(
        unstable_createMemoryUploadHandler({ maxPartSize: 10_000_000 }) // 10MB limit
      );
      const formData = await unstable_parseMultipartFormData(request, uploadHandler);
      const intent = formData.get("intent");

      if (intent === "create") {
        const title = formData.get("title") as string;
        const file = formData.get("file") as File;
        
        if (!file || file.size === 0) {
          return json({ success: false, error: "Please select a PDF file" }, { status: 400 });
        }

        // Upload to Supabase
        const filename = `resume-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const { url, error } = await uploadToSupabase(
          "resumes",
          filename,
          file
        );

        if (error) throw new Error(`Upload failed: ${error}`);

        await createResume({
          title,
          pdfUrl: url,
          fileName: file.name
        });

        return json({ success: true, message: "Resume uploaded successfully" });
      }
    } else {
      const formData = await request.formData();
      const intent = formData.get("intent");

      if (intent === "delete") {
        const id = formData.get("id") as string;
        await deleteResume(id);
        return json({ success: true, message: "Resume deleted" });
      }

      if (intent === "toggle") {
        const id = formData.get("id") as string;
        await toggleResumeActive(id);
        return json({ success: true, message: "Status updated" });
      }
    }

    return json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Resume action error:", error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "An error occurred" 
    }, { status: 500 });
  }
}

export default function AdminResumes() {
  const { resumes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
      setIsUploading(false);
    }
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Resumes</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your PDF resumes and CVs</p>
        </div>
        <div className="flex gap-2">
            <Link to="/admin/resume/qr">
                <Button variant="outline" className="gap-2">
                    <QrCode size={16} /> QR Generator
                </Button>
            </Link>
            <Button 
            onClick={() => setIsUploading(true)} 
            disabled={isUploading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
            <Upload size={16} className="mr-2" /> Upload Resume
            </Button>
        </div>
      </div>

      {isUploading && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upload New Resume</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsUploading(false)}>
              Close
            </Button>
          </div>
          <Form method="post" encType="multipart/form-data" className="space-y-4">
            <input type="hidden" name="intent" value="create" />
            
            <div>
              <Label htmlFor="title">Title / Version Name</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="e.g., Software Engineer 2024" 
                required 
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="file">PDF File</Label>
              <Input 
                id="file" 
                name="file" 
                type="file" 
                accept="application/pdf"
                required 
                className="mt-1"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Uploading..." : "Upload PDF"}
              </Button>
            </div>
          </Form>
        </div>
      )}

      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Filename</TableHead>
              <TableHead>Date Uploaded</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resumes.length > 0 ? (
              resumes.map((resume: any) => (
                <TableRow key={resume.id || resume._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-red-500" />
                      {resume.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">{resume.fileName}</TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Form method="post">
                        <input type="hidden" name="intent" value="toggle" />
                        <input type="hidden" name="id" value={resume.id || resume._id} />
                        <button type="submit" className="flex items-center gap-1.5 focus:outline-none">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                resume.isActive 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                    : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                                }`}>
                                {resume.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </button>
                    </Form>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <a href={resume.pdfUrl} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-indigo-600" title="View PDF">
                          <Download size={14} />
                        </Button>
                      </a>
                      <Form 
                        method="post" 
                        onSubmit={(e) => !confirm("Are you sure you want to delete this resume?") && e.preventDefault()}
                      >
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={resume.id || resume._id} />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-600" title="Delete">
                          <Trash2 size={14} />
                        </Button>
                      </Form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                  No resumes uploaded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
