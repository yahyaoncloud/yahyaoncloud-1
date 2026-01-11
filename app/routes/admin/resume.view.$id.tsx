import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { initMongoDB } from '~/utils/db.server';
import { getResumeById } from '~/Services/resume.server';

export async function loader({ params }: LoaderFunctionArgs) {
  await initMongoDB();
  const resumeId = params.id;
  if (!resumeId) throw new Response("Not Found", { status: 404 });

  const resume = await getResumeById(resumeId);
  if (!resume || !resume.pdfUrl) {
    throw new Response("PDF Not Found", { status: 404 });
  }

  return json({ pdfUrl: resume.pdfUrl, title: resume.title });
}

export default function ResumePdfViewer() {
  const { pdfUrl, title } = useLoaderData<typeof loader>();

  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col">
      <div className="h-12 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 border-b shrink-0">
         <h1 className="font-semibold text-sm">{title} - PDF Preview</h1>
         <a href={pdfUrl} download className="text-sm text-blue-600 hover:underline">Download Original</a>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <iframe 
            src={pdfUrl} 
            className="w-full h-full border-none"
            title="PDF Viewer"
        />
      </div>
    </div>
  );
}
