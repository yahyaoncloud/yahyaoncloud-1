import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { initMongoDB } from '~/utils/db.server';
import { getResumeById } from '~/Services/resume.server';
import { Button } from '~/components/ui/button';
import { Download } from 'lucide-react';

export async function loader({ params }: LoaderFunctionArgs) {
  await initMongoDB();
  const resumeId = params.id;
  if (!resumeId) throw new Response("Not Found", { status: 404 });

  const resume = await getResumeById(resumeId);
  
  // Optional: Check if resume is active or if user has permission
  // For now, assuming if they have the link (via Linktree), they can view it.
  
  if (!resume || !resume.pdfUrl) {
    throw new Response("PDF Not Found", { status: 404 });
  }

  return json({ pdfUrl: resume.pdfUrl, title: resume.title });
}

export default function PublicResumeViewer() {
  const { pdfUrl, title } = useLoaderData<typeof loader>();

  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col">
      <div className="h-14 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 border-b shrink-0 shadow-sm z-10">
         <h1 className="font-medium text-gray-900 dark:text-gray-100 truncate pr-4">{title}</h1>
         <a href={pdfUrl} download className="shrink-0">
            <Button size="sm" variant="default" className="gap-2">
                <Download size={16} />
                <span className="hidden sm:inline">Download PDF</span>
            </Button>
         </a>
      </div>
      <div className="flex-1 overflow-hidden relative bg-gray-200 dark:bg-zinc-900">
        <iframe 
            src={pdfUrl} 
            className="w-full h-full border-none"
            title={`${title} - Preview`}
        />
      </div>
    </div>
  );
}
