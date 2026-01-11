import { useState } from 'react';
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { getAllResumes } from '~/Services/resume.server';
import { getLinktree, updateLinktreeQR } from '~/Services/linktree.prisma.server';
import { uploadToSupabase } from '~/utils/supabase.server';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { 
  QrCode, Download, Share2, RefreshCw, Check, AlertCircle, ArrowLeft
} from 'lucide-react';
import QRCode from 'qrcode';
import { prisma } from '~/Services/post.prisma.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const [resumes, linktree] = await Promise.all([
    prisma.resume.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    }),
    getLinktree()
  ]);

  return json({
    resumes: resumes.map(r => ({
      id: r.id,
      title: r.title,
      pdfUrl: r.pdfUrl,
      fileName: r.fileName,
      updatedAt: r.updatedAt.toISOString()
    })),
    linktree: linktree ? {
      id: linktree.id,
      shortCode: linktree.shortCode,
      qrCodeUrl: linktree.qrCodeUrl,
      displayName: linktree.displayName
    } : null
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('_action') as string;
  const resumeId = formData.get('resumeId') as string;
  const theme = formData.get('theme') as string || 'light';

  try {
    if (actionType === 'generate-resume-qr') {
      if (!resumeId) return json({ success: false, message: 'Resume ID required' }, { status: 400 });
      
      const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
      if (!resume || !resume.pdfUrl) {
        return json({ success: false, message: 'Resume PDF not found' }, { status: 404 });
      }

      // Generate QR code for the PDF URL
      const qrBuffer = await QRCode.toBuffer(resume.pdfUrl, {
        type: 'png',
        width: 512,
        margin: 2,
        color: { dark: '#4f46e5', light: '#FFFFFF' } // Indigo QR code
      });

      // Upload to Supabase
      const path = `resumes/${resumeId}/qr-code.png`;
      const file = new Blob([qrBuffer], { type: 'image/png' });
      const { url: qrUrl, error } = await uploadToSupabase('resumes', path, file);

      if (error) throw new Error(error);

      return json({ success: true, qrCodeUrl: qrUrl, message: 'Resume QR code generated!', resumeId });
    }

    if (actionType === 'generate-profile-qr') {
      const linktree = await getLinktree();
      if (!linktree) throw new Error('Linktree profile not found');

      const url = new URL(request.url);
      const profileUrl = `${url.origin}/me/${linktree.shortCode}`;

      // Theme-based colors
      const isDark = theme === 'dark';
      const qrBuffer = await QRCode.toBuffer(profileUrl, {
        type: 'png',
        width: 512,
        margin: 2,
        color: { 
          dark: isDark ? '#FFFFFF' : '#4f46e5',  // White for dark theme, Indigo for light
          light: isDark ? '#1e1b4b' : '#FFFFFF'  // Dark indigo bg for dark theme, White for light
        }
      });

      const path = `linktrees/${linktree.shortCode}/qr-profile-${theme}.png`;
      const file = new Blob([qrBuffer], { type: 'image/png' });
      const { url: qrUrl, error } = await uploadToSupabase('resumes', path, file);

      if (error) throw new Error(error);

      // Update DB with light theme QR by default
      if (theme === 'light') {
        await updateLinktreeQR(linktree.id, qrUrl);
      }
      
      return json({ 
        success: true, 
        qrCodeUrl: qrUrl, 
        message: `Profile QR code (${theme} theme) generated!`,
        theme 
      });
    }

    return json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Action error:', error);
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred'
    }, { status: 500 });
  }
}

export default function ResumeQrGenerator() {
  const { resumes, linktree } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ success: boolean; message: string; qrCodeUrl?: string; resumeId?: string }>();
  
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(
    resumes.length > 0 ? resumes[0].id : null
  );
  const [resumeQrUrls, setResumeQrUrls] = useState<Record<string, string>>({});
  const [profileQrLight, setProfileQrLight] = useState<string | null>(linktree?.qrCodeUrl || null);
  const [profileQrDark, setProfileQrDark] = useState<string | null>(null);

  const selectedResume = resumes.find(r => r.id === selectedResumeId);
  const isGeneratingResumeQr = fetcher.state === 'submitting' && fetcher.formData?.get('_action') === 'generate-resume-qr';
  const isGeneratingProfileQr = fetcher.state === 'submitting' && fetcher.formData?.get('_action') === 'generate-profile-qr';

  // Update QR URLs when fetcher returns
  if (fetcher.data?.success && fetcher.data.qrCodeUrl && fetcher.data.resumeId) {
    if (!resumeQrUrls[fetcher.data.resumeId]) {
      setResumeQrUrls(prev => ({ ...prev, [fetcher.data.resumeId!]: fetcher.data.qrCodeUrl! }));
    }
  }

  const handleGenerateResumeQr = () => {
    if (!selectedResume?.id) return;
    fetcher.submit(
      { _action: 'generate-resume-qr', resumeId: selectedResume.id },
      { method: 'post' }
    );
  };

  const handleGenerateProfileQr = (theme: 'light' | 'dark') => {
    fetcher.submit(
      { _action: 'generate-profile-qr', theme },
      { method: 'post' }
    );
  };

  // Update profile QR URLs when fetcher returns
  if (fetcher.data?.success && fetcher.data.qrCodeUrl && fetcher.formData?.get('_action') === 'generate-profile-qr') {
    const theme = fetcher.formData.get('theme') as string;
    if (theme === 'light' && !profileQrLight) {
      setProfileQrLight(fetcher.data.qrCodeUrl);
    } else if (theme === 'dark' && !profileQrDark) {
      setProfileQrDark(fetcher.data.qrCodeUrl);
    }
  }

  const displayResumeQr = selectedResume ? resumeQrUrls[selectedResume.id] : null;

  if (resumes.length === 0 && !linktree) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-zinc-500">
        <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-white">No Data Found</h1>
        <p className="mb-6">Please upload a resume or create a profile first.</p>
        <Link to="/admin/resumes">
          <Button className="bg-indigo-600 hover:bg-indigo-700">Upload Resume</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            QR Generator
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create QR codes for resumes and profiles
          </p>
        </div>
        <Link to="/admin/resumes">
          <Button variant="outline" className="gap-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
            <ArrowLeft size={16} />
            Back to Resumes
          </Button>
        </Link>
      </div>

      {/* Resume Selector */}
      {resumes.length > 0 && (
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            {resumes.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedResumeId(r.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
                  selectedResumeId === r.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {r.title}
                {selectedResumeId === r.id && <Check className="inline-block ml-2 w-3 h-3"/>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Message */}
      {fetcher.data && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${
          fetcher.data.success
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
            : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900'
        }`}>
          {fetcher.data.success ? <Check className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
          <span className="text-sm font-medium">{fetcher.data.message}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Resume QR Section */}
        {selectedResume && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-zinc-900 dark:text-white">Resume QR</h3>
              </div>
              <p className="text-sm text-zinc-500 font-normal mt-1">Direct link to PDF file</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Resume Info */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <p className="font-medium text-zinc-900 dark:text-zinc-200 text-sm mb-1">{selectedResume.title}</p>
                <div className="flex justify-between items-center text-xs text-zinc-500">
                    <span>{selectedResume.fileName || 'PDF Resume'}</span>
                    <span>{new Date(selectedResume.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="flex items-center justify-center p-8 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 min-h-[200px]">
                {displayResumeQr ? (
                  <img 
                    src={displayResumeQr} 
                    alt="Resume QR" 
                    className="w-40 h-40 object-contain p-2 bg-white rounded-lg shadow-sm border border-zinc-100" 
                  />
                ) : (
                  <div className="text-center text-zinc-400">
                    <QrCode className="w-10 h-10 mx-auto mb-2 opacity-20"/>
                    <p className="text-xs">No QR code generated</p>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={handleGenerateResumeQr} 
                  disabled={isGeneratingResumeQr || !selectedResume.pdfUrl} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {isGeneratingResumeQr ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin"/> Generating...</>
                  ) : (
                    <><QrCode className="mr-2 h-4 w-4"/> Generate New QR</>
                  )}
                </Button>
                
                {displayResumeQr && (
                  <a 
                    href={displayResumeQr} 
                    download={`${selectedResume.title.replace(/\s+/g,'-')}-qr.png`} 
                    className="w-full block"
                  >
                    <Button variant="outline" className="w-full border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      <Download className="mr-2 h-4 w-4"/> Download PNG
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile QR Section */}
        {linktree && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-zinc-900 dark:text-white">Profile QR</h3>
              </div>
              <p className="text-sm text-zinc-500 font-normal mt-1">Link to full profile</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Info */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-lg border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-200 text-sm">@{linktree.displayName}</p>
                    <p className="text-xs text-zinc-500">/me/{linktree.shortCode}</p>
                </div>
                <Link to={`/admin/linktree`} className="text-xs text-indigo-600 hover:underline">Edit Profile</Link>
              </div>

              {/* QR Code Display - Show both if available */}
              <div className="grid grid-cols-2 gap-4">
                {/* Light Theme QR */}
                <div className="flex flex-col items-center">
                  <p className="text-xs font-medium text-zinc-500 mb-2">Light Mode</p>
                  <div className="flex justify-center items-center bg-zinc-50/50 dark:bg-zinc-950/30 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 p-4 w-full h-[160px]">
                    {profileQrLight ? (
                      <img 
                        src={profileQrLight} 
                        alt="Profile QR Light" 
                        className="w-28 h-28 object-contain p-2 bg-white rounded-lg shadow-sm" 
                      />
                    ) : (
                      <div className="text-center text-zinc-400">
                        <Share2 className="w-8 h-8 mx-auto mb-2 opacity-20"/>
                        <p className="text-[10px]">Not generated</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dark Theme QR */}
                <div className="flex flex-col items-center">
                  <p className="text-xs font-medium text-zinc-500 mb-2">Dark Mode</p>
                  <div className="flex justify-center items-center bg-zinc-900 rounded-lg border border-dashed border-zinc-700 p-4 w-full h-[160px]">
                    {profileQrDark ? (
                      <img 
                        src={profileQrDark} 
                        alt="Profile QR Dark" 
                        className="w-28 h-28 object-contain p-2 rounded-lg" 
                      />
                    ) : (
                      <div className="text-center text-zinc-600">
                        <Share2 className="w-8 h-8 mx-auto mb-2 opacity-20"/>
                        <p className="text-[10px]">Not generated</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {/* Generate Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleGenerateProfileQr('light')} 
                    disabled={isGeneratingProfileQr} 
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 shadow-sm"
                  >
                    {isGeneratingProfileQr ? (
                      <RefreshCw className="h-4 w-4 animate-spin"/>
                    ) : (
                      <><QrCode className="mr-1 h-3 w-3"/> Generate Light</>
                    )}
                  </Button>
                  <Button 
                    onClick={() => handleGenerateProfileQr('dark')} 
                    disabled={isGeneratingProfileQr} 
                    className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
                  >
                    {isGeneratingProfileQr ? (
                      <RefreshCw className="h-4 w-4 animate-spin"/>
                    ) : (
                      <><QrCode className="mr-1 h-3 w-3"/> Generate Dark</>
                    )}
                  </Button>
                </div>

                {/* Download Buttons */}
                {(profileQrLight || profileQrDark) && (
                  <div className="grid grid-cols-2 gap-3">
                    {profileQrLight && (
                      <a 
                        href={profileQrLight} 
                        download={`profile-${linktree.shortCode}-light.png`} 
                        className="w-full block"
                      >
                        <Button variant="ghost" className="w-full text-xs h-8 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
                          <Download className="mr-1 h-3 w-3"/> Download
                        </Button>
                      </a>
                    )}
                    {profileQrDark && (
                      <a 
                        href={profileQrDark} 
                        download={`profile-${linktree.shortCode}-dark.png`} 
                        className="w-full block"
                      >
                        <Button variant="ghost" className="w-full text-xs h-8 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
                          <Download className="mr-1 h-3 w-3"/> Download
                        </Button>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
      
      {/* Footer Instructions */}
      <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
        <div className="p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-medium text-sm mb-2 flex items-center gap-2 text-zinc-900 dark:text-white">
            <QrCode size={16}/>
            Resume QR Codes
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Select the appropriate resume above and generate its QR code. Perfect for job applications, 
            business cards, or printing on your physical resume. Each QR code links directly to the PDF.
          </p>
        </div>
        <div className="p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-medium text-sm mb-2 flex items-center gap-2 text-zinc-900 dark:text-white">
            <Share2 size={16}/>
            Profile QR Code
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Use your profile QR code for networking events and social media. It directs people to your 
            Linktree page where they can explore all your resumes and links in one place.
          </p>
        </div>
      </div>
    </div>
  );
}
