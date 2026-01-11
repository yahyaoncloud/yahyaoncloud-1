import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { connectDB } from '~/utils/db.server';
import { getActiveResume } from '~/Services/resume.server';
import { Download, QrCode } from 'lucide-react';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.resume) {
    return [
      { title: 'Resume Not Found | YahyaOnCloud' },
      { name: 'description', content: 'Resume not available' }
    ];
  }

  return [
    { title: `${data.resume.title} | YahyaOnCloud` },
    { name: 'description', content: 'Professional resume and portfolio' },
    { property: 'og:title', content: data.resume.title },
    { property: 'og:type', content: 'profile' }
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await connectDB();
  const resume = await getActiveResume();

  if (!resume) {
    throw new Response('Resume not found', { status: 404 });
  }

  return json({
    resume: {
      title: resume.title,
      htmlContent: resume.htmlContent,
      pdfUrl: resume.pdfUrl,
      qrCodeUrl: resume.qrCodeUrl,
      version: resume.version,
      updatedAt: resume.updatedAt.toISOString()
    }
  });
}

export default function PublicResume() {
  const { resume } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Actions Bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-semibold text-lg">{resume.title}</h1>
          
          <div className="flex items-center gap-2">
            {resume.qrCodeUrl && (
              <a
                href={resume.qrCodeUrl}
                download="resume-qr.png"
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                title="Download QR Code"
              >
                <QrCode className="w-5 h-5" />
              </a>
            )}
            
            {resume.pdfUrl && (
              <a
                href={resume.pdfUrl}
                download="resume.pdf"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Resume Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 shadow-lg my-8 mx-4 rounded-lg overflow-hidden">
          <div
            className="resume-content p-8"
            dangerouslySetInnerHTML={{ __html: resume.htmlContent }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-gray-500">
        <p>
          Last updated: {new Date(resume.updatedAt).toLocaleDateString()} •{' '}
          <Link to="/" className="text-blue-600 hover:underline">
            YahyaOnCloud
          </Link>
        </p>
      </div>
    </div>
  );
}

// Error boundary for 404
export function ErrorBoundary() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Resume Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The resume you're looking for doesn't exist or hasn't been published yet.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
