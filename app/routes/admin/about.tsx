// Admin About - Manage Portfolio/Profile
import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, useSearchParams, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { getProfileInfo, saveProfileInfo, type ProfileInfoData, type SectionVisibility } from "~/Services/content.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Plus, Trash2, Save, User, Briefcase, Code, Award, Share2, Layers, LayoutGrid, CheckCircle2, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ImageUpload from "~/components/ImageUpload";
import { requireAdmin } from "~/utils/admin-auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  try {
    const profileInfo = await getProfileInfo();
    return json({ profileInfo });
  } catch (error) {
    console.error("Error in admin/about loader:", error);
    return json({ profileInfo: null });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "save") {
      const bio = JSON.parse((formData.get("bio") as string) || "[]");
      const skills = JSON.parse((formData.get("skills") as string) || "[]");
      const rawExperiences = JSON.parse((formData.get("experiences") as string) || "[]");
      const rawCertifications = JSON.parse((formData.get("certifications") as string) || "[]");
      const rawSocialLinks = JSON.parse((formData.get("socialLinks") as string) || "{}");
      const rawSectionsVisibility = JSON.parse((formData.get("sectionsVisibility") as string) || "{}");

      // Format for live Minimalist ProfileInfo in MongoDB
      const experiences = rawExperiences.map((exp: any) => ({
        year: String(exp.year || ""),
        present: Boolean(exp.present || exp.isWorking),
        company: String(exp.company || ""),
        role: String(exp.role || ""),
        description: String(exp.description || exp.summary || ""),
        projects: Array.isArray(exp.projects) ? exp.projects : [],
      }));

      const certifications = rawCertifications.map((c: any) => ({
        name: String(c.name || c.title || ""),
        issuer: String(c.issuer || ""),
        issueDate: String(c.issueDate || c.year || ""),
        credentialUrl: c.credentialUrl || undefined,
        credentialId: c.credentialId || undefined,
      }));

      const socialLinksList = Array.isArray(rawSocialLinks)
        ? rawSocialLinks
        : Object.entries(rawSocialLinks).map(([k, v]) => ({
            label: k.charAt(0).toUpperCase() + k.slice(1),
            href: String(v),
            display: String(v),
            external: !String(v).startsWith("mailto:"),
          }));

      const sectionsVisibility: SectionVisibility = {
        summary: rawSectionsVisibility.summary !== undefined ? Boolean(rawSectionsVisibility.summary) : true,
        experience: rawSectionsVisibility.experience !== undefined ? Boolean(rawSectionsVisibility.experience) : true,
        elsewhere: rawSectionsVisibility.elsewhere !== undefined ? Boolean(rawSectionsVisibility.elsewhere) : true,
        certifications: rawSectionsVisibility.certifications !== undefined ? Boolean(rawSectionsVisibility.certifications) : true,
        skills: rawSectionsVisibility.skills !== undefined ? Boolean(rawSectionsVisibility.skills) : true,
        selectedWork: rawSectionsVisibility.selectedWork !== undefined ? Boolean(rawSectionsVisibility.selectedWork) : true,
        writing: rawSectionsVisibility.writing !== undefined ? Boolean(rawSectionsVisibility.writing) : true,
        research: rawSectionsVisibility.research !== undefined ? Boolean(rawSectionsVisibility.research) : true,
      };

      // Save to ProfileInfo in Prisma MongoDB
      await saveProfileInfo({
        headline: (formData.get("headline") as string) || "Cloud DevOps & Infrastructure Engineer.",
        bio,
        skills,
        experiences,
        certifications,
        socialLinks: socialLinksList,
        sectionsVisibility,
      });

      return json({ success: true, message: "Website profile & homepage updated successfully", error: undefined });
    }
    return json({ success: false, error: "Invalid intent", message: undefined }, { status: 400 });
  } catch (error) {
    console.error("Portfolio save error:", error);
    return json({ success: false, error: "Failed to save profile", message: undefined }, { status: 500 });
  }
}

export default function AdminAbout() {
  const { profileInfo } = useLoaderData<typeof loader>() as {
    profileInfo: ProfileInfoData | null;
  };
  const actionData = useActionData<typeof action>() as any;
  const navigation = useNavigation();

  // Initial State Setup - Prefer live ProfileInfo data
  const [headline, setHeadline] = useState<string>(profileInfo?.headline || "Cloud DevOps & Infrastructure Engineer.");
  const [portraitUrl, setPortraitUrl] = useState<string>("/me.png");
  const [bio, setBio] = useState<string[]>(
    profileInfo?.bio && profileInfo.bio.length > 0 ? profileInfo.bio : [""]
  );
  const [skills, setSkills] = useState<string[]>(
    profileInfo?.skills && profileInfo.skills.length > 0 ? profileInfo.skills : []
  );
  const [experiences, setExperiences] = useState<any[]>(
    profileInfo?.experiences && profileInfo.experiences.length > 0 ? profileInfo.experiences : []
  );
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>(
    profileInfo?.certifications && profileInfo.certifications.length > 0 ? profileInfo.certifications : []
  );
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {
      email: "",
      github: "",
      linkedin: "",
      twitter: "",
      instagram: "",
      youtube: "",
    };
    if (Array.isArray(profileInfo?.socialLinks)) {
      for (const item of profileInfo.socialLinks) {
        if (item?.label && item?.href) {
          initial[item.label.toLowerCase()] = item.href;
        }
      }
    }
    return initial;
  });
  const [sectionsVisibility, setSectionsVisibility] = useState<SectionVisibility>({
    summary: profileInfo?.sectionsVisibility?.summary !== false,
    experience: profileInfo?.sectionsVisibility?.experience !== false,
    elsewhere: profileInfo?.sectionsVisibility?.elsewhere !== false,
    certifications: profileInfo?.sectionsVisibility?.certifications !== false,
    skills: profileInfo?.sectionsVisibility?.skills !== false,
    selectedWork: profileInfo?.sectionsVisibility?.selectedWork !== false,
    writing: profileInfo?.sectionsVisibility?.writing !== false,
    research: profileInfo?.sectionsVisibility?.research !== false,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "basic");

  useEffect(() => {
    const tabParam = searchParams.get("tab") || "basic";
    setActiveTab(tabParam);
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "basic") {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("tab");
      setSearchParams(newParams, { replace: true });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", tab);
      setSearchParams(newParams, { replace: true });
    }
  };

  useEffect(() => {
    if (actionData?.success && actionData.message) toast.success(actionData.message);
    if (actionData?.error) toast.error(actionData.error);
  }, [actionData]);

  // --- Handlers ---

  // Bio
  const updateBio = (index: number, val: string) => {
    const newBio = [...bio];
    newBio[index] = val;
    setBio(newBio);
  };
  const addBioLine = () => setBio([...bio, ""]);
  const removeBioLine = (index: number) => setBio(bio.filter((_, i) => i !== index));

  // Skills
  const updateSkill = (index: number, val: string) => {
    const newSkills = [...skills];
    newSkills[index] = val;
    setSkills(newSkills);
  };
  const addSkill = () => setSkills([...skills, ""]);
  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));

  // Experience
  const addExperience = () => setExperiences([...experiences, { company: "", role: "", year: "", location: "", summary: "", isWorking: false }]);
  const removeExperience = (index: number) => setExperiences(experiences.filter((_, i) => i !== index));
  const updateExperience = (index: number, field: string, val: any) => {
    const newExp = [...experiences];
    newExp[index] = { ...newExp[index], [field]: val };
    setExperiences(newExp);
  };

  // Projects
  const addProject = () => setProjects([...projects, { title: "", description: "", url: "" }]);
  const removeProject = (index: number) => setProjects(projects.filter((_, i) => i !== index));
  const updateProject = (index: number, field: string, val: any) => {
    const newProj = [...projects];
    newProj[index] = { ...newProj[index], [field]: val };
    setProjects(newProj);
  };

  // Certifications
  const addCertification = () => setCertifications([...certifications, { title: "", issuer: "", year: "" }]);
  const removeCertification = (index: number) => setCertifications(certifications.filter((_, i) => i !== index));
  const updateCertification = (index: number, field: string, val: any) => {
    const newCert = [...certifications];
    newCert[index] = { ...newCert[index], [field]: val };
    setCertifications(newCert);
  };

  // Socials
  const updateSocial = (key: string, val: string) => setSocialLinks({ ...socialLinks, [key]: val });


  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">About & Portfolio</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage your public profile information, homepage sections, and skills.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <a 
                    href="/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-zinc-900"
                >
                    <Share2 size={16} className="text-zinc-500" />
                    View Homepage
                </a>
                <Button 
                    type="submit" 
                    form="about-portfolio-form"
                    disabled={navigation.state === "submitting"}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <Save size={16} className="mr-2" />
                    {navigation.state === "submitting" ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </div>

      <Form id="about-portfolio-form" method="post" className="space-y-8">
        <input type="hidden" name="intent" value="save" />
        
        {/* Serialized JSON inputs */}
        <input type="hidden" name="bio" value={JSON.stringify(bio)} />
        <input type="hidden" name="skills" value={JSON.stringify(skills)} />
        <input type="hidden" name="experiences" value={JSON.stringify(experiences)} />
        <input type="hidden" name="projects" value={JSON.stringify(projects)} />
        <input type="hidden" name="certifications" value={JSON.stringify(certifications)} />
        <input type="hidden" name="socialLinks" value={JSON.stringify(socialLinks)} />
        <input type="hidden" name="sectionsVisibility" value={JSON.stringify(sectionsVisibility)} />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
          <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 h-auto grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7 mb-8 rounded-lg">
            <TabsTrigger value="basic" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white py-2">Basic</TabsTrigger>
            <TabsTrigger value="sections" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white py-2 font-medium">Sections</TabsTrigger>
            <TabsTrigger value="experience" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white py-2">Experience</TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white py-2">Projects</TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white py-2">Skills</TabsTrigger>
            <TabsTrigger value="certs" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white py-2">Certs</TabsTrigger>
            <TabsTrigger value="socials" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white py-2">Socials</TabsTrigger>
          </TabsList>

          {/* BASIC INFO */}
          <TabsContent value="basic">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                    <User size={20} className="text-indigo-600 dark:text-indigo-400" />
                    <div>
                        <CardTitle className="text-lg">Basic Info</CardTitle>
                        <CardDescription>Your primary profile details and headline</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="headline" className="text-zinc-700 dark:text-zinc-300">Professional Headline / Subtitle</Label>
                  <Input 
                    id="headline" 
                    name="headline" 
                    value={headline} 
                    onChange={(e) => setHeadline(e.target.value)} 
                    placeholder="e.g. Cloud DevOps & Infrastructure Engineer." 
                    className="bg-zinc-50 dark:bg-zinc-950" 
                  />
                  <p className="text-xs text-zinc-500">This appears prominently below your name on the homepage header.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portraitUrl" className="text-zinc-700 dark:text-zinc-300">Portrait Image</Label>
                  <input type="hidden" name="portraitUrl" value={portraitUrl} />
                  <div className="max-w-xs">
                    <div className="h-48 w-48 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-800">
                        <ImageUpload 
                            onUploadComplete={setPortraitUrl} 
                            currentImageUrl={portraitUrl}
                            bucket="homepage-cards"
                        />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">Bio / Introduction (One paragraph per line)</Label>
                  {bio.map((line, i) => (
                    <div key={i} className="flex gap-2">
                      <Textarea 
                        value={line} 
                        onChange={(e) => updateBio(i, e.target.value)} 
                        className="min-h-[80px] bg-zinc-50 dark:bg-zinc-950"
                        placeholder="Tell your story..."
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeBioLine(i)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addBioLine} className="gap-2 border-dashed border-zinc-300 dark:border-zinc-700">
                    <Plus size={14} /> Add Paragraph
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HOMEPAGE SECTIONS VISIBILITY */}
          <TabsContent value="sections">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <LayoutGrid size={22} className="text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <CardTitle className="text-lg">Homepage Sections Visibility</CardTitle>
                      <CardDescription>
                        Control which sections appear on your public homepage. Toggle individual sections or use quick presets.
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSectionsVisibility({
                          summary: true,
                          experience: true,
                          elsewhere: true,
                          certifications: true,
                          skills: true,
                          selectedWork: true,
                          writing: true,
                          research: true,
                        })
                      }
                      className="text-xs h-8 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <CheckCircle2 size={13} className="mr-1.5 text-emerald-600 dark:text-emerald-400" />
                      Enable All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSectionsVisibility({
                          summary: true,
                          experience: false,
                          elsewhere: true,
                          certifications: false,
                          skills: false,
                          selectedWork: true,
                          writing: true,
                          research: false,
                        })
                      }
                      className="text-xs h-8 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Sparkles size={13} className="mr-1.5 text-indigo-600 dark:text-indigo-400" />
                      Minimalist
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                {/* Core Profile Sections */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <User size={13} className="text-indigo-500" />
                    Core Identity & Bio
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950/40">
                    {/* Summary / Bio */}
                    <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <div className="space-y-0.5 pr-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="toggle-summary" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer">
                            Profile & Introduction
                          </Label>
                          <span className={`text-[11px] font-mono px-2 py-0.2 rounded-full font-medium ${
                            sectionsVisibility.summary !== false
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          }`}>
                            {sectionsVisibility.summary !== false ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Displays the avatar, professional headline, and introductory bio paragraphs at the top of the homepage.
                        </p>
                      </div>
                      <Switch
                        id="toggle-summary"
                        checked={sectionsVisibility.summary !== false}
                        onCheckedChange={(val) =>
                          setSectionsVisibility({ ...sectionsVisibility, summary: val })
                        }
                      />
                    </div>

                    {/* Career Experience */}
                    <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <div className="space-y-0.5 pr-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="toggle-experience" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer">
                            Career Experience
                          </Label>
                          <span className={`text-[11px] font-mono px-2 py-0.2 rounded-full font-medium ${
                            sectionsVisibility.experience !== false
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          }`}>
                            {sectionsVisibility.experience !== false ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Displays your career timeline, company roles, years, and accordion project details.
                        </p>
                      </div>
                      <Switch
                        id="toggle-experience"
                        checked={sectionsVisibility.experience !== false}
                        onCheckedChange={(val) =>
                          setSectionsVisibility({ ...sectionsVisibility, experience: val })
                        }
                      />
                    </div>

                    {/* Elsewhere / Socials */}
                    <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <div className="space-y-0.5 pr-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="toggle-elsewhere" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer">
                            Elsewhere & Contact
                          </Label>
                          <span className={`text-[11px] font-mono px-2 py-0.2 rounded-full font-medium ${
                            sectionsVisibility.elsewhere !== false
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          }`}>
                            {sectionsVisibility.elsewhere !== false ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Displays social profiles, GitHub, Twitter/X, LinkedIn, and direct contact email links.
                        </p>
                      </div>
                      <Switch
                        id="toggle-elsewhere"
                        checked={sectionsVisibility.elsewhere !== false}
                        onCheckedChange={(val) =>
                          setSectionsVisibility({ ...sectionsVisibility, elsewhere: val })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Content & Engineering Sections */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <Layers size={13} className="text-indigo-500" />
                    Engineering Showcases & Content
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950/40">
                    {/* Selected Work */}
                    <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <div className="space-y-0.5 pr-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="toggle-work" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer">
                            Selected Work (Featured Projects)
                          </Label>
                          <span className={`text-[11px] font-mono px-2 py-0.2 rounded-full font-medium ${
                            sectionsVisibility.selectedWork !== false
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          }`}>
                            {sectionsVisibility.selectedWork !== false ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Displays featured engineering projects, architectural summaries, GitHub, and live demo links.
                        </p>
                      </div>
                      <Switch
                        id="toggle-work"
                        checked={sectionsVisibility.selectedWork !== false}
                        onCheckedChange={(val) =>
                          setSectionsVisibility({ ...sectionsVisibility, selectedWork: val })
                        }
                      />
                    </div>

                    {/* Writing / Blog */}
                    <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <div className="space-y-0.5 pr-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="toggle-writing" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer">
                            Writing (Recent Articles)
                          </Label>
                          <span className={`text-[11px] font-mono px-2 py-0.2 rounded-full font-medium ${
                            sectionsVisibility.writing !== false
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          }`}>
                            {sectionsVisibility.writing !== false ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Displays the most recent published technical blog posts with publish dates and reading times.
                        </p>
                      </div>
                      <Switch
                        id="toggle-writing"
                        checked={sectionsVisibility.writing !== false}
                        onCheckedChange={(val) =>
                          setSectionsVisibility({ ...sectionsVisibility, writing: val })
                        }
                      />
                    </div>

                    {/* Research Papers */}
                    <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <div className="space-y-0.5 pr-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="toggle-research" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer">
                            Technical Research Papers
                          </Label>
                          <span className={`text-[11px] font-mono px-2 py-0.2 rounded-full font-medium ${
                            sectionsVisibility.research !== false
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          }`}>
                            {sectionsVisibility.research !== false ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Displays featured academic and technical research papers, venues, and publication abstracts.
                        </p>
                      </div>
                      <Switch
                        id="toggle-research"
                        checked={sectionsVisibility.research !== false}
                        onCheckedChange={(val) =>
                          setSectionsVisibility({ ...sectionsVisibility, research: val })
                        }
                      />
                    </div>

                    {/* Skills */}
                    <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <div className="space-y-0.5 pr-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="toggle-skills" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer">
                            Skills & Competencies
                          </Label>
                          <span className={`text-[11px] font-mono px-2 py-0.2 rounded-full font-medium ${
                            sectionsVisibility.skills !== false
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          }`}>
                            {sectionsVisibility.skills !== false ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Displays technical skill tags and core competencies as pills on the homepage.
                        </p>
                      </div>
                      <Switch
                        id="toggle-skills"
                        checked={sectionsVisibility.skills !== false}
                        onCheckedChange={(val) =>
                          setSectionsVisibility({ ...sectionsVisibility, skills: val })
                        }
                      />
                    </div>

                    {/* Certifications */}
                    <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <div className="space-y-0.5 pr-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="toggle-certs" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer">
                            Professional Certifications
                          </Label>
                          <span className={`text-[11px] font-mono px-2 py-0.2 rounded-full font-medium ${
                            sectionsVisibility.certifications !== false
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          }`}>
                            {sectionsVisibility.certifications !== false ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Displays certifications (CCNP, CCNA, Azure, AWS) with issuing organization and verification links.
                        </p>
                      </div>
                      <Switch
                        id="toggle-certs"
                        checked={sectionsVisibility.certifications !== false}
                        onCheckedChange={(val) =>
                          setSectionsVisibility({ ...sectionsVisibility, certifications: val })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-zinc-100 dark:border-zinc-800 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-950/20">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    {[
                      sectionsVisibility.summary !== false,
                      sectionsVisibility.experience !== false,
                      sectionsVisibility.elsewhere !== false,
                      sectionsVisibility.selectedWork !== false,
                      sectionsVisibility.writing !== false,
                      sectionsVisibility.research !== false,
                      sectionsVisibility.skills !== false,
                      sectionsVisibility.certifications !== false,
                    ].filter(Boolean).length}{" "}
                    of 8 sections visible on homepage
                  </span>
                </div>

                <Button
                  type="submit"
                  form="about-portfolio-form"
                  disabled={navigation.state === "submitting"}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Save size={15} className="mr-2" />
                  {navigation.state === "submitting" ? "Saving Changes..." : "Save Homepage Sections"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* EXPERIENCE */}
          <TabsContent value="experience">
             <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Briefcase size={20} className="text-blue-500" />
                        <div>
                            <CardTitle className="text-lg">Work Experience</CardTitle>
                            <CardDescription>Your career history</CardDescription>
                        </div>
                    </div>
                    <Button type="button" size="sm" onClick={addExperience} className="gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                        <Plus size={14} /> Add Role
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {experiences.map((exp, i) => (
                    <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-sm uppercase tracking-wide text-zinc-500">Role #{i + 1}</h3>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeExperience(i)} className="text-red-500 h-6 w-6">
                                <Trash2 size={14} />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input className="bg-white dark:bg-zinc-950" placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} />
                            <Input className="bg-white dark:bg-zinc-950" placeholder="Role / Title" value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)} />
                            <Input className="bg-white dark:bg-zinc-950" placeholder="Year (e.g. 2020 - 2022)" value={exp.year} onChange={(e) => updateExperience(i, "year", e.target.value)} />
                            <Input className="bg-white dark:bg-zinc-950" placeholder="Location" value={exp.location} onChange={(e) => updateExperience(i, "location", e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id={`working-${i}`} checked={exp.isWorking} onChange={(e) => updateExperience(i, "isWorking", e.target.checked)} className="rounded border-zinc-300" />
                            <Label htmlFor={`working-${i}`} className="text-sm text-zinc-600 dark:text-zinc-400">Currently Working Here</Label>
                        </div>
                        <Textarea className="bg-white dark:bg-zinc-950 min-h-[100px]" placeholder="Summary / Achievements" value={exp.summary} onChange={(e) => updateExperience(i, "summary", e.target.value)} />
                    </div>
                ))}
                {experiences.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <Briefcase className="mx-auto h-8 w-8 text-zinc-300" />
                        <p className="mt-2 text-sm text-zinc-500">No experience added yet</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROJECTS */}
          <TabsContent value="projects">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Layers size={20} className="text-indigo-500" />
                        <div>
                            <CardTitle className="text-lg">Projects</CardTitle>
                            <CardDescription>Showcase your work</CardDescription>
                        </div>
                    </div>
                    <Button type="button" size="sm" onClick={addProject} className="gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                        <Plus size={14} /> Add Project
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                 {projects.map((proj, i) => (
                    <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        <div className="flex justify-between items-center">
                             <Input className="font-medium bg-white dark:bg-zinc-950" placeholder="Project Title" value={proj.title} onChange={(e) => updateProject(i, "title", e.target.value)} />
                             <Button type="button" variant="ghost" size="icon" onClick={() => removeProject(i)} className="text-red-500 ml-2">
                                <Trash2 size={14} />
                            </Button>
                        </div>
                        <Textarea className="bg-white dark:bg-zinc-950" placeholder="Description" value={proj.description} onChange={(e) => updateProject(i, "description", e.target.value)} />
                        <Input className="bg-white dark:bg-zinc-950 text-sm font-mono" placeholder="https://..." value={proj.url} onChange={(e) => updateProject(i, "url", e.target.value)} />
                    </div>
                 ))}
                 {projects.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <Layers className="mx-auto h-8 w-8 text-zinc-300" />
                        <p className="mt-2 text-sm text-zinc-500">No projects added yet</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SKILLS */}
          <TabsContent value="skills">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
               <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                    <Code size={20} className="text-pink-500" />
                    <div>
                        <CardTitle className="text-lg">Skills</CardTitle>
                        <CardDescription>Technologies and competencies</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {skills.map((skill, i) => (
                        <div key={i} className="flex gap-2">
                            <Input className="bg-white dark:bg-zinc-950" value={skill} onChange={(e) => updateSkill(i, e.target.value)} placeholder="Skill name" />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(i)} className="text-red-500 shrink-0">
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addSkill} className="w-full border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                        <Plus size={14} className="mr-2" /> Add Skill
                    </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CERTIFICATIONS */}
          <TabsContent value="certs">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Award size={20} className="text-yellow-500" />
                        <div>
                            <CardTitle className="text-lg">Certifications</CardTitle>
                            <CardDescription>Awards and certificates</CardDescription>
                        </div>
                    </div>
                    <Button type="button" size="sm" onClick={addCertification} className="gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                        <Plus size={14} /> Add Cert
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                 {certifications.map((cert, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-3 items-start border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                        <div className="flex-1 w-full space-y-2">
                            <Input className="bg-white dark:bg-zinc-950 font-medium" placeholder="Certification Title" value={cert.title} onChange={(e) => updateCertification(i, "title", e.target.value)} />
                            <div className="flex gap-2">
                                <Input className="bg-white dark:bg-zinc-950" placeholder="Issuer" value={cert.issuer} onChange={(e) => updateCertification(i, "issuer", e.target.value)} />
                                <Input className="bg-white dark:bg-zinc-950 w-32 shrink-0" placeholder="Year" value={cert.year} onChange={(e) => updateCertification(i, "year", e.target.value)} />
                            </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCertification(i)} className="text-red-500">
                            <Trash2 size={14} />
                        </Button>
                    </div>
                 ))}
                 {certifications.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <Award className="mx-auto h-8 w-8 text-zinc-300" />
                        <p className="mt-2 text-sm text-zinc-500">No certifications added yet</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SOCIALS */}
          <TabsContent value="socials">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                    <Share2 size={20} className="text-green-500" />
                    <div>
                        <CardTitle className="text-lg">Social Links</CardTitle>
                        <CardDescription>Links for the contact section</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {["email", "github", "linkedin", "twitter", "instagram", "youtube"].map((platform) => (
                    <div key={platform} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <Label className="capitalize md:text-right text-zinc-600 dark:text-zinc-400 font-medium">{platform}</Label>
                        <div className="md:col-span-3">
                            <Input 
                                placeholder={`${platform} URL or address`}
                                value={socialLinks[platform] || ""}
                                onChange={(e) => updateSocial(platform, e.target.value)}
                                className="bg-white dark:bg-zinc-950"
                            />
                        </div>
                    </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </Form>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let message = "An unexpected error occurred while loading About & Homepage Sections.";
  if (isRouteErrorResponse(error)) {
    message = typeof error.data === "string" ? error.data : error.data?.message || `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">About & Sections Error</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-md mx-auto">{message}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 border-zinc-300 dark:border-zinc-700"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Page
        </Button>
      </div>
    </div>
  );
}

