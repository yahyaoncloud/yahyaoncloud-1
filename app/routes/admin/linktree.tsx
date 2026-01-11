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
import { useLoaderData, useNavigation, Form, Link } from "@remix-run/react";
import { 
  getLinktree, 
  updateLinktree, 
  type ShowcaseItem,
  type CustomLink
} from "~/Services/linktree.prisma.server";
import { uploadToSupabase } from "~/utils/supabase.server";
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
  Palette
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  await initMongoDB();
  const [linktree, resumes] = await Promise.all([
    getLinktree(),
    getAllResumes(),
  ]);

  if (!linktree) {
    throw new Response("Linktree not found", { status: 404 });
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
      showcaseItems: (linktree.showcaseItems as ShowcaseItem[]) || [],
      customLinks: (linktree.customLinks as CustomLink[]) || [],
      shortCode: linktree.shortCode,
    },
    resumes: resumes.map((r) => ({
      _id: r._id.toString(),
      title: r.title || "Untitled Resume",
    })),
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
          // Upload to Supabase
          const filename = `avatar-${Date.now()}-${avatarFile.name}`;
          const { url, error } = await uploadToSupabase(
            "avatars",
            `${linktree.id}/${filename}`,
            avatarFile
          );

          if (error) {
            throw new Error(`Avatar upload failed: ${error}`);
          }
          avatarUrl = url;
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
  const { linktree, resumes } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        </div>
      </div>
    </div>
  );
}
