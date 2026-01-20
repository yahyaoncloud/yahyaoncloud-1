// Admin About - Manage Portfolio/Profile
import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { getAllPortfolios, createPortfolio, updatePortfolio } from "~/Services/post.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Plus, Trash2, Save, User, Briefcase, Code, Award, Share2, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ImageUpload from "~/components/ImageUpload";

export async function loader({ request }: LoaderFunctionArgs) {
  const portfolios = await getAllPortfolios();
  const portfolio = portfolios.length > 0 ? portfolios[0] : null;
  return json({ portfolio });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id") as string;

  try {
    if (intent === "save") {
      const data: any = {
        name: formData.get("name") as string,
        portraitUrl: formData.get("portraitUrl") as string,
        location: formData.get("location") as string,
        bio: JSON.parse(formData.get("bio") as string || "[]"),
        skills: JSON.parse(formData.get("skills") as string || "[]"),
        experiences: JSON.parse(formData.get("experiences") as string || "[]"),
        projects: JSON.parse(formData.get("projects") as string || "[]"),
        certifications: JSON.parse(formData.get("certifications") as string || "[]"),
        socialLinks: JSON.parse(formData.get("socialLinks") as string || "{}"),
      };

      if (id) {
        await updatePortfolio(id, data);
        return json({ success: true, message: "Profile updated successfully", error: undefined });
      } else {
        await createPortfolio(data);
        return json({ success: true, message: "Profile created successfully", error: undefined });
      }
    }
    return json({ success: false, error: "Invalid intent", message: undefined }, { status: 400 });
  } catch (error) {
    console.error("Portfolio save error:", error);
    return json({ success: false, error: "Failed to save profile", message: undefined }, { status: 500 });
  }
}




interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

import { IPortfolioDoc } from "~/models";

export default function AdminAbout() {
  const { portfolio } = useLoaderData<typeof loader>() as { portfolio: IPortfolioDoc | null };
  const actionData = useActionData<typeof action>() as ActionResponse | undefined;
  const navigation = useNavigation();

  // Initial State Setup
  const [portraitUrl, setPortraitUrl] = useState<string>(portfolio?.portraitUrl || "");
  const [bio, setBio] = useState<string[]>(portfolio?.bio || [""]);
  const [skills, setSkills] = useState<string[]>(portfolio?.skills || []);
  const [experiences, setExperiences] = useState<any[]>(portfolio?.experiences || []);
  const [projects, setProjects] = useState<any[]>(portfolio?.projects || []);
  const [certifications, setCertifications] = useState<any[]>(portfolio?.certifications || []);
  const [socialLinks, setSocialLinks] = useState<any>(portfolio?.socialLinks || {});

  useEffect(() => {
    if (actionData?.success) toast.success(actionData.message);
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
                    Manage your public profile information, skills, and experience.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <a 
                    href="/about" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-zinc-900"
                >
                    <Share2 size={16} className="text-zinc-500" />
                    View Page
                </a>
                <Button 
                    type="submit" 
                    disabled={navigation.state === "submitting"}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <Save size={16} className="mr-2" />
                    {navigation.state === "submitting" ? "Saving..." : "Save Profile"}
                </Button>
            </div>
        </div>

      <Form method="post" className="space-y-8">
        <input type="hidden" name="intent" value="save" />
        {portfolio?._id && <input type="hidden" name="id" value={portfolio._id} />}
        
        {/* Serialized JSON inputs */}
        <input type="hidden" name="bio" value={JSON.stringify(bio)} />
        <input type="hidden" name="skills" value={JSON.stringify(skills)} />
        <input type="hidden" name="experiences" value={JSON.stringify(experiences)} />
        <input type="hidden" name="projects" value={JSON.stringify(projects)} />
        <input type="hidden" name="certifications" value={JSON.stringify(certifications)} />
        <input type="hidden" name="socialLinks" value={JSON.stringify(socialLinks)} />

        <Tabs defaultValue="basic" className="w-full space-y-6">
          <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 h-auto grid w-full grid-cols-3 md:grid-cols-6 mb-8 rounded-lg">
            <TabsTrigger value="basic" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white py-2">Basic</TabsTrigger>
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
                        <CardDescription>Your primary profile details</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">Full Name</Label>
                    <Input id="name" name="name" defaultValue={portfolio?.name} placeholder="e.g. Yahya" className="bg-zinc-50 dark:bg-zinc-950" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-zinc-700 dark:text-zinc-300">Location</Label>
                    <Input id="location" name="location" defaultValue={portfolio?.location} placeholder="e.g. Dubai, UAE" className="bg-zinc-50 dark:bg-zinc-950" />
                  </div>
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
