import { json, type LoaderFunctionArgs, type ActionFunctionArgs, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from '@remix-run/node';
import { useLoaderData, useActionData, useNavigation, useSubmit } from '@remix-run/react';
import { requireAuthor } from '~/utils/author-auth.server';
import { uploadToSupabase, deleteFromSupabase, listSupabaseFiles } from '~/utils/supabase.server';
import { Button } from '~/components/ui/button';
import { Upload, Trash2, Copy, FileText, FileVideo, FileAudio, File, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export async function loader({ request }: LoaderFunctionArgs) {
  const author = await requireAuthor(request);

  const folderPath = `author-assets/${author.authorId}`;
  const { files, error } = await listSupabaseFiles('documents', folderPath);

  if (error) {
    console.error('Supabase List Error:', error);
  }

  const filesWithUrl = files?.map((file) => {
    const path = `${folderPath}/${file.name}`;
    const supabaseId = process.env.SUPABASE_ID;
    const url = `https://${supabaseId}.supabase.co/storage/v1/object/public/documents/${path}`;
    return { ...file, url };
  });

  return json({ files: filesWithUrl || [], authorId: author.authorId, error });
}

export async function action({ request }: ActionFunctionArgs) {
  const author = await requireAuthor(request);
  const folderPath = `author-assets/${author.authorId}`;

  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_composeUploadHandlers(
      unstable_createMemoryUploadHandler({ maxPartSize: 1024 * 1024 * 5 })
    )
  );

  const intent = formData.get('intent');

  if (intent === 'delete') {
    const fileName = formData.get('fileName') as string;
    if (!fileName) return json({ success: false, error: 'Missing filename' });

    const path = `${folderPath}/${fileName}`;
    const { success, error } = await deleteFromSupabase('documents', path);

    if (!success) return json({ success: false, error });
    return json({ success: true, message: 'File deleted successfully' });
  }

  if (intent === 'upload') {
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
      return json({ success: false, error: 'No file selected' });
    }

    if (file.size > 5 * 1024 * 1024) {
      return json({ success: false, error: 'File size exceeds 5MB limit' });
    }

    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folderPath}/${timestamp}-${cleanName}`;

    const { url, error } = await uploadToSupabase('documents', path, file);

    if (error) {
      return json({ success: false, error });
    }

    return json({ success: true, message: 'File uploaded successfully', url });
  }

  return json({ success: false, error: 'Invalid action' });
}

export default function AuthorAssets() {
  const { files, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === 'submitting';

  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (actionData?.success && 'message' in actionData) {
      toast.success(actionData.message);
    }
    if (actionData && 'error' in actionData && actionData.error) {
      toast.error(actionData.error as string);
    }
  }, [actionData]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5MB limit');
      return;
    }

    const formData = new FormData();
    formData.append('intent', 'upload');
    formData.append('file', file);
    submit(formData, { method: 'post', encType: 'multipart/form-data' });
  };

  const handleDelete = (fileName: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    const formData = new FormData();
    formData.append('intent', 'delete');
    formData.append('fileName', fileName);
    submit(formData, { method: 'post' });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const getFileType = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
    if (['pdf'].includes(ext || '')) return 'pdf';
    if (['mp4', 'webm', 'mov'].includes(ext || '')) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'audio';
    return 'other';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">My Assets</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Manage your uploaded images and files (Max 5MB per file)</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive ? 'border-indigo-500 bg-indigo-50/10' : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <Upload size={24} />
          </div>
          <div>
            <p className="text-zinc-900 dark:text-zinc-100 font-medium">Click or drag file to upload</p>
            <p className="text-zinc-500 text-xs mt-1">Images, videos, PDFs up to 5MB</p>
          </div>
          <input type="file" className="hidden" id="file-upload" onChange={handleChange} disabled={isSubmitting} />
          <Button variant="outline" asChild disabled={isSubmitting}>
            <label htmlFor="file-upload" className="cursor-pointer">
              {isSubmitting ? 'Uploading...' : 'Select File'}
            </label>
          </Button>
        </div>
      </div>

      {actionData && 'error' in actionData && actionData.error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          {actionData.error as string}
        </div>
      )}

      {actionData?.success && 'message' in actionData && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 p-4 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle size={16} />
          {actionData.message}
        </div>
      )}

      {/* Asset Grid */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Your Assets ({files.length})</h2>
        {files.length === 0 ? (
          <p className="text-zinc-500 italic">No assets uploaded yet.</p>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {files.map((file: any) => {
              const fileType = getFileType(file.name);
              return (
                <div
                  key={file.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg flex flex-col gap-2 group hover:border-indigo-500 transition-colors shadow-sm hover:shadow-md"
                >
                  <div className="aspect-square w-full bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden relative flex items-center justify-center">
                    {fileType === 'image' && file.url && <img src={file.url} alt={file.name} className="w-full h-full object-cover" />}
                    {fileType === 'pdf' && <FileText size={32} className="text-zinc-400" />}
                    {fileType === 'video' && <FileVideo size={32} className="text-zinc-400" />}
                    {fileType === 'audio' && <FileAudio size={32} className="text-zinc-400" />}
                    {fileType === 'other' && <File size={32} className="text-zinc-400" />}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button size="sm" variant="secondary" className="h-8 text-xs bg-white/90 hover:bg-white text-zinc-900" onClick={() => window.open(file.url, '_blank')}>
                        View
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 min-w-0 pt-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate text-zinc-700 dark:text-zinc-300" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">{(file.metadata?.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-zinc-900" onClick={() => copyToClipboard(file.url || file.name)} title="Copy Link">
                        <Copy size={12} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(file.name)} title="Delete">
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
