// Admin Linktree Editor - Manage your link tree profile
import { useState, useEffect, useRef } from "react";
import {
  json,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { useLoaderData, useNavigation, Form, Link, useFetcher } from "@remix-run/react";
import { 
  getLinktree, 
  updateLinktree,
  type ShowcaseItem,
  type CustomLink
} from "~/Services/linktree.prisma.server";
import {
  getActiveQR,
  createQR,
  regenerateQR,
  updateQRCodeUrl,
  getQRStats,
  getRecentScans,
  getQRUrl,
} from "~/Services/linktree-qr.prisma.server";
import { uploadImage, uploadDocument } from "~/utils/cloudinary.server";
import { initMongoDB } from "~/utils/db.server";
import { getAllResumes } from "~/Services/resume.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Save,
  Linkedin,
  Instagram,
  Twitter,
  Github,
  Mail,
  FileText,
  Cloud,
  Plus,
  Trash2,
  ExternalLink,
  User,
  Share2,
  Briefcase,
  Upload,
  Camera,
  Link as LinkIcon,
  Palette,
  QrCode,
  Download,
  RefreshCw,
  Copy,
  Check,
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  AlertTriangle
} from "lucide-react";
import QRCode from "qrcode";

export async function loader({ request }: LoaderFunctionArgs) {
  await initMongoDB();
  const [linktree, resumes] = await Promise.all([
    getLinktree(),
    getAllResumes(),
  ]);

  if (!linktree) {
    throw new Response("Linktree not found", { status: 404 });
  }

  // Get the origin from request for QR code URL
  const url = new URL(request.url);
  
  // Get active QR for this linktree
  const activeQR = await getActiveQR(linktree.id);
  
  // Get QR stats and recent scans if we have an active QR
  let qrStats = null;
  let recentScans: { id: string; sessionId: string; device: string | null; browser: string | null; os: string | null; country: string | null; createdAt: Date }[] = [];
  let permanentQrUrl = null;
  
  if (activeQR) {
    qrStats = await getQRStats(activeQR.id);
    recentScans = await getRecentScans(activeQR.id, 10);
    permanentQrUrl = `${url.origin}/qr/${activeQR.qrId}`;
  }

  return json({
    linktree: {
      id: linktree.id,
      displayName: linktree.displayName,
      tagline: linktree.tagline,
      avatarUrl: linktree.avatarUrl,
      theme: linktree.theme,
      resumeUrl: linktree.resumeUrl,
      selectedResumeId: linktree.selectedResumeId,
      linkedinUrl: linktree.linkedinUrl,
      instagramUrl: linktree.instagramUrl,
      twitterUrl: linktree.twitterUrl,
      githubUrl: linktree.githubUrl,
      emailUrl: linktree.emailUrl,
      showcaseTitle: linktree.showcaseTitle,
      showcaseItems: (linktree.showcaseItems as unknown as ShowcaseItem[]) || [],
      customLinks: (linktree.customLinks as unknown as CustomLink[]) || [],
      shortCode: linktree.shortCode,
    },
    resumes: resumes.map((r) => ({
      _id: r._id.toString(),
      title: r.title || "Untitled Resume",
    })),
    activeQR: activeQR ? {
      id: activeQR.id,
      qrId: activeQR.qrId,
      qrCodeUrl: activeQR.qrCodeUrl,
      qrTheme: activeQR.qrTheme,
      totalScans: activeQR.totalScans,
      createdAt: activeQR.createdAt.toISOString(),
    } : null,
    qrStats,
    recentScans: recentScans.map(scan => ({
      ...scan,
      createdAt: scan.createdAt.toISOString(),
    })),
    permanentQrUrl,
    baseUrl: url.origin,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const contentType = request.headers.get("Content-Type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  try {
    const linktree = await getLinktree();
    if (!linktree) {
      return json({ success: false, error: "Linktree not found" }, { status: 404 });
    }

    // For multipart forms (profile with file upload)
    if (isMultipart) {
      const uploadHandler = unstable_composeUploadHandlers(
        unstable_createMemoryUploadHandler({ maxPartSize: 5_000_000 }) // 5MB limit
      );
      const formData = await unstable_parseMultipartFormData(request, uploadHandler);
      const intent = formData.get("intent");

      if (intent === "updateProfile") {
        let avatarUrl = formData.get("avatarUrl") as string;
        const avatarFile = formData.get("avatarFile") as File;

        if (avatarFile && avatarFile.size > 0) {
          // Upload to Cloudinary
          const cleanFileName = avatarFile.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
          const publicId = `linktrees/${linktree.id}/avatar-${cleanFileName}-${Date.now()}`;
          
          try {
            const { url } = await uploadImage(avatarFile, publicId);
            avatarUrl = url;
          } catch (error) {
             throw new Error(`Avatar upload failed: ${error}`);
          }
        }

        await updateLinktree(linktree.id, {
          displayName: formData.get("displayName") as string,
          tagline: (formData.get("tagline") as string) || undefined,
          avatarUrl: avatarUrl || undefined,
          theme: (formData.get("theme") as string) || "dark",
        });
        return json({ success: true, message: "Profile updated" });
      }
    }

    // For regular forms (social links, showcase)
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "updateSocial") {
      const selectedResumeId = formData.get("selectedResumeId") as string;
      let resumeUrl = formData.get("resumeUrl") as string;

      // If a resume ID is selected, force the static route
      if (selectedResumeId) {
        resumeUrl = "/resume";
      }

      await updateLinktree(linktree.id, {
        selectedResumeId: selectedResumeId || undefined,
        resumeUrl: resumeUrl || undefined,
        linkedinUrl: (formData.get("linkedinUrl") as string) || undefined,
        instagramUrl: (formData.get("instagramUrl") as string) || undefined,
        twitterUrl: (formData.get("twitterUrl") as string) || undefined,
        githubUrl: (formData.get("githubUrl") as string) || undefined,
        emailUrl: (formData.get("emailUrl") as string) || undefined,
      });
      return json({ success: true, message: "Social links updated" });
    }

    if (intent === "updateShowcase") {
      const showcaseItemsRaw = formData.get("showcaseItems") as string;
      let showcaseItems: ShowcaseItem[] = [];
      try {
        showcaseItems = JSON.parse(showcaseItemsRaw || "[]");
      } catch {
        showcaseItems = [];
      }

      await updateLinktree(linktree.id, {
        showcaseTitle: (formData.get("showcaseTitle") as string) || "My Current Work",
        showcaseItems,
      });
      return json({ success: true, message: "Showcase updated" });
    }

    if (intent === "updateCustomLinks") {
        const customLinksRaw = formData.get("customLinks") as string;
        let customLinks: CustomLink[] = [];
        try {
            customLinks = JSON.parse(customLinksRaw || "[]");
        } catch {
            customLinks = [];
        }

        await updateLinktree(linktree.id, {
            customLinks,
        });
        return json({ success: true, message: "Custom links updated" });
    }

    // QR Code Generation - Creates new persistent QR with tracking
    if (intent === "generateQR") {
      const theme = formData.get("theme") as string || "light";
      const isRegenerate = formData.get("regenerate") === "true";
      const url = new URL(request.url);

      // Create or regenerate QR record
      let qr;
      if (isRegenerate) {
        qr = await regenerateQR(linktree.id, undefined, theme);
      } else {
        // Check if we already have an active QR
        const existingQR = await getActiveQR(linktree.id);
        if (existingQR) {
          qr = existingQR;
        } else {
          qr = await createQR(linktree.id, undefined, theme);
        }
      }

      // Generate QR code image for the tracking URL
      const trackingUrl = `${url.origin}/qr/${qr.qrId}`;
      const isDark = theme === "dark";
      const qrBuffer = await QRCode.toBuffer(trackingUrl, {
        type: "png",
        width: 512,
        margin: 2,
        color: {
          dark: isDark ? "#FFFFFF" : "#4f46e5",
          light: isDark ? "#1e1b4b" : "#FFFFFF",
        },
      });

      // Upload to Cloudinary
      // We need to convert Buffer to File/Blob for our utility
      // OR update uploadImage to accept Buffer. 
      // Current utility expects File. Buffer -> Blob -> File logic.
      const blob = new Blob([new Uint8Array(qrBuffer)], { type: "image/png" });
      const file = new File([blob], `qr-${qr.qrId}.png`, { type: "image/png" });
      
      const publicId = `linktrees/${linktree.id}/qr-${qr.qrId}-${theme}`;
      
      try {
          const { url: qrUrl } = await uploadImage(file, publicId);
          // Update QR record with the image URL
          await updateQRCodeUrl(qr.id, qrUrl);

          return json({ 
            success: true, 
            message: isRegenerate ? "New QR code generated! Old QR is now invalid." : "QR code generated!", 
            qrCodeUrl: qrUrl, 
            qrId: qr.qrId,
            theme 
          });

      } catch (error) {
           throw new Error(`QR upload failed: ${error}`);
      }
    }

    return json({ success: false, error: "Unknown intent" }, { status: 400 });
  } catch (error) {
    console.error("Linktree action error:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}

export default function AdminLinktree() {
  const { linktree, resumes, activeQR, qrStats, recentScans, permanentQrUrl, baseUrl } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<{ success: boolean; message: string; qrCodeUrl?: string; qrId?: string; theme?: string }>();

  // State for showcase items (client-side management)
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>(
    linktree.showcaseItems || []
  );

  // State for custom links (client-side management)
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(
    linktree.customLinks || []
  );

  // State for resume selection
  const [selectedResumeId, setSelectedResumeId] = useState<string>(linktree.selectedResumeId || "");
  const [resumeUrl, setResumeUrl] = useState<string>(linktree.resumeUrl || "");
  
  // State for avatar preview
  const [avatarPreview, setAvatarPreview] = useState<string | null>(linktree.avatarUrl || null);

  // State for QR code display
  const [currentQrUrl, setCurrentQrUrl] = useState<string | null>(activeQR?.qrCodeUrl || null);
  const [copied, setCopied] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Update QR URL when fetcher returns
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data.qrCodeUrl) {
      setCurrentQrUrl(fetcher.data.qrCodeUrl);
      setShowRegenerateConfirm(false);
    }
  }, [fetcher.data]);


  const handleGenerateQR = (regenerate: boolean = false) => {
    fetcher.submit({ intent: "generateQR", theme: "light", regenerate: regenerate.toString() }, { method: "post" });
  };

  const handleCopyUrl = async () => {
    if (permanentQrUrl) {
      await navigator.clipboard.writeText(permanentQrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDeviceIcon = (device: string | null) => {
    switch (device) {
      case 'mobile': return <Smartphone size={14} />;
      case 'tablet': return <Tablet size={14} />;
      default: return <Monitor size={14} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedResumeId(id);
    if (id) {
      setResumeUrl("/resume"); // Standard static route
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addShowcaseItem = () => {
    setShowcaseItems([...showcaseItems, { name: "", url: "", description: "" }]);
  };

  const removeShowcaseItem = (index: number) => {
    setShowcaseItems(showcaseItems.filter((_, i) => i !== index));
  };

  const updateShowcaseItem = (
    index: number,
    field: keyof ShowcaseItem,
    value: string
  ) => {
    const updated = [...showcaseItems];
    updated[index] = { ...updated[index], [field]: value };
    setShowcaseItems(updated);
  };

  const addCustomLink = () => {
    setCustomLinks([...customLinks, { title: "", url: "", icon: "link", color: "indigo" }]);
  };

  const removeCustomLink = (index: number) => {
    setCustomLinks(customLinks.filter((_, i) => i !== index));
  };

  const updateCustomLink = (
    index: number,
    field: keyof CustomLink,
    value: string
  ) => {
    const updated = [...customLinks];
    updated[index] = { ...updated[index], [field]: value };
    setCustomLinks(updated);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Linktree Editor</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Customize your public profile and links
            </p>
          </div>
          <Link
            to={`/me/${linktree.shortCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-zinc-900"
          >
            <ExternalLink size={16} className="text-zinc-500" />
            View Profile
          </Link>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <User size={20} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Profile Settings</h2>
            </div>
            
            <Form method="post" encType="multipart/form-data" className="space-y-6">
              <input type="hidden" name="intent" value="updateProfile" />
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-3">
                  <div 
                    onClick={handleAvatarClick}
                    className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 cursor-pointer group shadow-sm bg-zinc-50"
                  >
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar Preview" 
                        className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                        <User size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAvatarClick}
                    className="text-xs"
                  >
                    Change Photo
                  </Button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    name="avatarFile" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  {/* Keep the old URL just in case, but hidden */}
                  <input type="hidden" name="avatarUrl" value={linktree.avatarUrl || ""} />
                </div>

                {/* Fields Section */}
                <div className="flex-1 grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="displayName" className="text-zinc-700 dark:text-zinc-300">Display Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      defaultValue={linktree.displayName}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline" className="text-zinc-700 dark:text-zinc-300">Tagline</Label>
                    <Input
                      id="tagline"
                      name="tagline"
                      defaultValue={linktree.tagline || ""}
                      placeholder="e.g. Cloud & Web Developer"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="theme" className="text-zinc-700 dark:text-zinc-300">Theme</Label>
                    <select
                      id="theme"
                      name="theme"
                      defaultValue={linktree.theme}
                      className="w-full h-10 px-3 mt-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="dark">Dark Theme</option>
                      <option value="light">Light Theme</option>
                      <option value="gradient">Gradient Theme</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
                >
                  <Save size={16} />
                  Save Profile
                </Button>
              </div>
            </Form>
          </div>

          {/* Social Links */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <Share2 size={20} className="text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-white">Social Links</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Links will appear as buttons on your profile</p>
              </div>
            </div>
            
            <Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="updateSocial" />
              <input type="hidden" name="selectedResumeId" value={selectedResumeId} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 p-5 border border-indigo-100 dark:border-indigo-900/30 rounded-lg bg-indigo-50/30 dark:bg-indigo-900/10">
                  <Label className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 mb-3 font-medium">
                    <FileText size={16} />
                    Attached Resume
                  </Label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 space-y-3">
                      <select
                        className="w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={selectedResumeId}
                        onChange={handleResumeSelect}
                      >
                        <option value="">-- Select a Resume from Library --</option>
                        {resumes.map((r) => (
                          <option key={r._id} value={r._id}>
                            {r.title}
                          </option>
                        ))}
                      </select>
                      
                      <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-zinc-400 text-xs">URL</span>
                         </div>
                         <Input
                            name="resumeUrl"
                            value={resumeUrl}
                            onChange={(e) => {
                              setResumeUrl(e.target.value);
                              // Clear selected ID if user manually types
                              if (selectedResumeId && e.target.value !== "/resume") {
                                setSelectedResumeId("");
                              }
                            }}
                            placeholder="/resume or https://..."
                            className="pl-10 bg-white dark:bg-zinc-950"
                          />
                      </div>
                      <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">
                        {selectedResumeId 
                          ? "✓ Using static route /resume mapped to selected file." 
                          : "Enter a custom URL or select a resume above."}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Linkedin size={16} className="text-blue-600" />
                    LinkedIn URL
                  </Label>
                  <Input
                    name="linkedinUrl"
                    defaultValue={linktree.linkedinUrl || ""}
                    placeholder="https://linkedin.com/in/..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Instagram size={16} className="text-pink-500" />
                    Instagram URL
                  </Label>
                  <Input
                    name="instagramUrl"
                    defaultValue={linktree.instagramUrl || ""}
                    placeholder="https://instagram.com/..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Twitter size={16} className="text-zinc-800 dark:text-zinc-200" />
                    Twitter / X URL
                  </Label>
                  <Input
                    name="twitterUrl"
                    defaultValue={linktree.twitterUrl || ""}
                    placeholder="https://twitter.com/..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Github size={16} className="text-zinc-800 dark:text-zinc-200" />
                    GitHub URL
                  </Label>
                  <Input
                    name="githubUrl"
                    defaultValue={linktree.githubUrl || ""}
                    placeholder="https://github.com/..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Mail size={16} className="text-green-500" />
                    Email Address
                  </Label>
                  <Input
                    name="emailUrl"
                    type="email"
                    defaultValue={linktree.emailUrl || ""}
                    placeholder="you@example.com"
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
                >
                  <Save size={16} />
                  Save Links
                </Button>
              </div>
            </Form>
          </div>

          {/* Current Work Showcase */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Briefcase size={20} className="text-indigo-600 dark:text-indigo-400" />
                <div>
                    <h2 className="font-semibold text-zinc-900 dark:text-white">Showcase</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Highlight your current projects</p>
                </div>
              </div>
              <Button
                onClick={addShowcaseItem}
                size="sm"
                variant="outline"
                className="gap-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <Plus size={14} />
                Add Item
              </Button>
            </div>
            
            <Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="updateShowcase" />
              <input
                type="hidden"
                name="showcaseItems"
                value={JSON.stringify(showcaseItems)}
              />

              <div>
                <Label htmlFor="showcaseTitle" className="text-zinc-700 dark:text-zinc-300">Section Title</Label>
                <Input
                  id="showcaseTitle"
                  name="showcaseTitle"
                  defaultValue={linktree.showcaseTitle || "My Current Work"}
                  className="mt-2 max-w-md"
                />
              </div>

              <div className="space-y-4">
                {showcaseItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Item #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeShowcaseItem(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Name (e.g., YahyaOnCloud)"
                        value={item.name}
                        onChange={(e) =>
                          updateShowcaseItem(index, "name", e.target.value)
                        }
                        className="bg-white dark:bg-zinc-950"
                      />
                      <Input
                        placeholder="URL (e.g., https://yahyaoncloud.com)"
                        value={item.url}
                        onChange={(e) =>
                          updateShowcaseItem(index, "url", e.target.value)
                        }
                        className="bg-white dark:bg-zinc-950"
                      />
                    </div>
                    <Input
                      placeholder="Description (optional)"
                      value={item.description || ""}
                      onChange={(e) =>
                        updateShowcaseItem(index, "description", e.target.value)
                      }
                      className="bg-white dark:bg-zinc-950"
                    />
                  </div>
                ))}
                
                {showcaseItems.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50/30 dark:bg-zinc-900/30">
                    <Cloud size={24} className="mx-auto mb-2 text-zinc-400" />
                    <p className="text-sm text-zinc-500">No showcase items yet</p>
                    <button 
                        type="button" 
                        onClick={addShowcaseItem}
                        className="text-sm text-indigo-600 hover:underline mt-1"
                    >
                        Add your first project
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
                >
                  <Save size={16} />
                  Save Showcase
                </Button>
              </div>
            </Form>
          </div>

          {/* QR Code Section - Enhanced with Tracking */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <QrCode size={20} className="text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-white">QR Code with Tracking</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Single persistent QR code that tracks every scan</p>
              </div>
            </div>

            {/* No QR Generated Yet */}
            {!activeQR && !currentQrUrl && (
              <div className="text-center py-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50/30 dark:bg-zinc-900/30">
                <QrCode size={48} className="mx-auto mb-4 text-zinc-400" />
                <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">No QR Code Generated</h3>
                <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
                  Generate a QR code for your linktree. Every scan will be tracked with user metadata.
                </p>
                <Button
                  type="button"
                  onClick={() => handleGenerateQR(false)}
                  disabled={fetcher.state === "submitting"}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                >
                  {fetcher.state === "submitting" ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <QrCode size={16} />
                  )}
                  Generate QR Code
                </Button>
              </div>
            )}

            {/* QR Code Display */}
            {(activeQR || currentQrUrl) && (
              <div className="space-y-6">
                {/* Main QR and Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code Display */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-48 h-48 flex items-center justify-center bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      {currentQrUrl ? (
                        <img src={currentQrUrl} alt="Linktree QR Code" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="text-center text-zinc-400">
                          <RefreshCw size={24} className="mx-auto animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 w-full max-w-[200px]">
                      {currentQrUrl && (
                        <a href={currentQrUrl} download="linktree-qr.png" className="flex-1">
                          <Button type="button" variant="outline" size="sm" className="w-full text-xs gap-1">
                            <Download size={12} />
                            Download
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-500 mb-1">
                          <BarChart3 size={14} />
                          <span className="text-xs font-medium">Total Scans</span>
                        </div>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                          {qrStats?.totalScans || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-500 mb-1">
                          <Clock size={14} />
                          <span className="text-xs font-medium">Today</span>
                        </div>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                          {qrStats?.scansToday || 0}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-500 mb-1">
                        <BarChart3 size={14} />
                        <span className="text-xs font-medium">This Week</span>
                      </div>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {qrStats?.scansThisWeek || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permanent URL Display */}
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                  <Label className="text-xs text-indigo-700 dark:text-indigo-300 font-medium mb-2 block">Trackable QR URL</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white dark:bg-zinc-950 border border-indigo-200 dark:border-indigo-800 rounded-md text-sm font-mono text-indigo-900 dark:text-indigo-100 truncate">
                      {permanentQrUrl || `${baseUrl}/qr/${activeQR?.qrId}`}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyUrl}
                      className="gap-1.5 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-2">
                    This URL tracks every scan. Use it for business cards, resumes, or print materials.
                  </p>
                </div>

                {/* Recent Scans */}
                {recentScans.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Recent Scans</h3>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 text-xs">
                            <th className="px-4 py-2 text-left font-medium">Device</th>
                            <th className="px-4 py-2 text-left font-medium">Browser</th>
                            <th className="px-4 py-2 text-left font-medium">OS</th>
                            <th className="px-4 py-2 text-right font-medium">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                          {recentScans.slice(0, 5).map((scan) => (
                            <tr key={scan.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                              <td className="px-4 py-2.5 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                {getDeviceIcon(scan.device)}
                                <span className="capitalize">{scan.device || 'Unknown'}</span>
                              </td>
                              <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{scan.browser || 'Unknown'}</td>
                              <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{scan.os || 'Unknown'}</td>
                              <td className="px-4 py-2.5 text-right text-zinc-500 text-xs">{formatTimeAgo(scan.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Regenerate Section */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  {!showRegenerateConfirm ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRegenerateConfirm(true)}
                      className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-900 dark:hover:bg-amber-900/20"
                    >
                      <RefreshCw size={14} />
                      Generate New QR Code
                    </Button>
                  ) : (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                            Generate New QR Code?
                          </h4>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                            The old QR code will become invalid. Anyone scanning the old QR will see an error message for 3 seconds and then be redirected to the about page.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleGenerateQR(true)}
                              disabled={fetcher.state === "submitting"}
                              className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                            >
                              {fetcher.state === "submitting" ? (
                                <RefreshCw size={12} className="mr-1 animate-spin" />
                              ) : null}
                              Yes, Generate New
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowRegenerateConfirm(false)}
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Message */}
                {fetcher.data && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                    fetcher.data.success
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                      : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900"
                  }`}>
                    {fetcher.data.success ? <Check size={14} /> : null}
                    <span className="font-medium">{fetcher.data.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
