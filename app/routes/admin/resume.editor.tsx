import { useState, useEffect, useCallback, useRef } from 'react';
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData, useSubmit, useNavigation, useFetcher, useNavigate } from '@remix-run/react';
import { initMongoDB } from '~/utils/db.server';
import { saveResume, updateResume, getAllResumes, getResumeById } from '~/Services/resume.server';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Save, Eye, EyeOff, FileText, QrCode, Plus, ChevronRight } from 'lucide-react';

// Default HTML template for new resumes
const defaultHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume</title>
  <style>
    body { font-family: sans-serif; padding: 2rem; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>Your Name</h1>
  <p>Your resume content here...</p>
</body>
</html>`;

export async function loader({ request }: LoaderFunctionArgs) {
  await initMongoDB();
  const url = new URL(request.url);
  const resumeId = url.searchParams.get('id');

  const resumes = await getAllResumes();
  
  let selectedResume = null;
  if (resumeId) {
    selectedResume = await getResumeById(resumeId);
  } else if (resumes.length > 0) {
    selectedResume = resumes[0]; // Default to first available
  }

  return json({
    resumes: resumes.map(r => ({ _id: r._id.toString(), title: r.title })),
    resume: selectedResume ? {
      _id: selectedResume._id.toString(),
      title: selectedResume.title,
      htmlContent: selectedResume.htmlContent,
      version: selectedResume.version,
      updatedAt: selectedResume.updatedAt.toISOString()
    } : null
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await initMongoDB();
  const formData = await request.formData();
  const actionType = formData.get('_action') as string;

  if (actionType === 'save') {
    const title = formData.get('title') as string;
    const htmlContent = formData.get('htmlContent') as string;
    const resumeId = formData.get('resumeId') as string | null;

    try {
      let savedResume;
      if (resumeId) {
        savedResume = await updateResume(resumeId, { title, htmlContent });
      } else {
        savedResume = await saveResume(title, htmlContent);
      }
      return json({ success: true, message: 'Resume saved!', resumeId: savedResume._id.toString() });
    } catch (error) {
      console.error('Save error:', error);
      return json({ success: false, message: 'Failed to save resume' }, { status: 500 });
    }
  }
  
  if (actionType === 'create') {
     const title = "New Resume";
     const savedResume = await saveResume(title, defaultHtmlTemplate);
     return json({ success: true, message: 'Created', resumeId: savedResume._id.toString() });
  }

  return json({ success: false, message: 'Unknown action' }, { status: 400 });
}

export default function ResumeEditor() {
  const { resumes, resume } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const [title, setTitle] = useState(resume?.title || '');
  const [htmlContent, setHtmlContent] = useState(resume?.htmlContent || defaultHtmlTemplate);
  const [showPreview, setShowPreview] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(resume?.updatedAt || null);

  // Sync state when resume changes (e.g. via selection)
  useEffect(() => {
    if (resume) {
      setTitle(resume.title);
      setHtmlContent(resume.htmlContent);
      setLastSaved(resume.updatedAt);
    }
  }, [resume]);

  const isSubmitting = navigation.state === 'submitting';

  // Handle save
  const handleSave = useCallback(() => {
    const formData = new FormData();
    formData.append('_action', 'save');
    formData.append('title', title);
    formData.append('htmlContent', htmlContent);
    if (resume?._id) {
      formData.append('resumeId', resume._id);
    }
    submit(formData, { method: 'post' });
    setLastSaved(new Date().toISOString());
  }, [title, htmlContent, resume?._id, submit]);

  // Handle create new
  const handleCreate = () => {
    const fd = new FormData();
    fd.append('_action', 'create');
    submit(fd, { method: 'post' });
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <div className="h-[calc(100vh-4rem)] flex w-full bg-white dark:bg-zinc-950">
      
      {/* Sidebar - Resume Selector */}
      <div className="w-64 border-r bg-gray-50 dark:bg-zinc-900 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300">My Resumes</h2>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCreate} title="Create New">
                <Plus size={14}/>
            </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {resumes.map(r => (
                <Link 
                    key={r._id} 
                    to={`?id=${r._id}`}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                        resume?._id === r._id 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' 
                        : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400'
                    }`}
                >
                    <span className="truncate">{r.title}</span>
                    {resume?._id === r._id && <ChevronRight size={14} className="opacity-50"/>}
                </Link>
            ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-zinc-900 shadow-sm z-10">
            <div className="flex items-center gap-4 flex-1">
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="flex-1 max-w-md">
                <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-semibold text-lg border-transparent hover:border-gray-200 focus:border-blue-500 bg-transparent px-2 h-9"
                placeholder="Resume title"
                />
            </div>
            {lastSaved && (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                Saved {new Date(lastSaved).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            )}
            </div>

            <div className="flex items-center gap-2">
            <Link to="/admin/resume/qr">
                <Button  size="sm" className="hidden sm:flex">
                <QrCode className="w-4 h-4 mr-2" />
                QR Center
                </Button>
            </Link>

            <Button
                
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
            >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? 'Editor Only' : 'Preview'}
            </Button>

            <Button
                onClick={handleSave}
                disabled={isSubmitting}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
            >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            </div>
        </div>

        {/* Editor Split View */}
        <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col border-r transition-all duration-300`}>
            <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 leading-relaxed"
                placeholder="Write your HTML resume here..."
                spellCheck={false}
            />
            <div className="px-4 py-2 bg-gray-100 dark:bg-zinc-900 border-t text-xs text-gray-500 font-mono flex justify-between">
                 <span>HTML Source</span>
                 <span>{htmlContent.length} chars</span>
            </div>
            </div>

            {/* Iframe Preview - ISOLATED STYLES */}
            {showPreview && (
            <div className="w-1/2 flex flex-col bg-slate-200 dark:bg-zinc-900 transition-all duration-300 relative">
                 <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-50"></div>
                <div className="flex-1 p-8 overflow-hidden flex justify-center">
                    <div className="w-full h-full bg-white shadow-2xl rounded-sm overflow-hidden max-w-[210mm]"> {/* A4 width approx */}
                        <iframe
                            title="Resume Preview"
                            srcDoc={htmlContent}
                            className="w-full h-full border-0"
                            sandbox="allow-same-origin" 
                        />
                    </div>
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
