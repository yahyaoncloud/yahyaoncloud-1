// Admin Portfolio - Modern Portfolio Editor
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { json, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { getAllPortfolios, updatePortfolio } from "~/Services/post.server";
import { uploadImage } from "~/utils/cloudinary.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/Card";
import {
  Save,
  Plus,
  Trash2,
  User,
  Briefcase,
  Award,
  Code,
  FolderGit2,
  Share2,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";

// Types
interface Experience {
  title: string;
  company: string;
  role: string;
  location: string;
  period: string;
  year: string;
  isWorking: number;
  description: string[];
  summary: string;
}

interface Certification {
  title: string;
  issuer: string;
  year: string;
}

interface Project {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  duration: string;
}

interface PortfolioData {
  _id: string;
  name: string;
  bio: string[];
  location: string;
  portraitUrl: string;
  experiences: Experience[];
  certifications: Certification[];
  hobbies: { name: string; description: string }[];
  skills: string[] | Record<string, string[]>;
  currentWorks: { title: string; description: string }[];
  projects: Project[];
  socialLinks: Record<string, string>;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const portfolios = await getAllPortfolios();
  const portfolio = portfolios[0] || null;
  return json({ portfolio });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    if (intent === "updateProfile") {
      const id = formData.get("id") as string;
      const portrait = formData.get("portrait") as File;
      let portraitUrl = formData.get("existingPortraitUrl") as string;
      
      if (portrait && portrait.size > 0) {
        const name = formData.get("name") as string;
        const uploaded = await uploadImage(portrait, `portfolio-${name}-${Date.now()}`);
        portraitUrl = uploaded.url;
      }

      await updatePortfolio(id, {
        name: formData.get("name") as string,
        bio: (formData.get("bio") as string).split("\n").filter(Boolean),
        location: formData.get("location") as string,
        portraitUrl,
      });
      return json({ success: true, message: "Profile updated" });
    }

    if (intent === "updateExperiences") {
      const id = formData.get("id") as string;
      const experiences = JSON.parse(formData.get("experiences") as string);
      await updatePortfolio(id, { experiences });
      return json({ success: true, message: "Experiences updated" });
    }

    if (intent === "updateCertifications") {
      const id = formData.get("id") as string;
      const certifications = JSON.parse(formData.get("certifications") as string);
      await updatePortfolio(id, { certifications });
      return json({ success: true, message: "Certifications updated" });
    }

    if (intent === "updateSkills") {
      const id = formData.get("id") as string;
      const skills = JSON.parse(formData.get("skills") as string);
      await updatePortfolio(id, { skills });
      return json({ success: true, message: "Skills updated" });
    }

    if (intent === "updateProjects") {
      const id = formData.get("id") as string;
      const projects = JSON.parse(formData.get("projects") as string);
      await updatePortfolio(id, { projects });
      return json({ success: true, message: "Projects updated" });
    }

    if (intent === "updateSocialLinks") {
      const id = formData.get("id") as string;
      const socialLinks = JSON.parse(formData.get("socialLinks") as string);
      await updatePortfolio(id, { socialLinks });
      return json({ success: true, message: "Social links updated" });
    }

    return json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Portfolio action error:", error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "An error occurred" 
    }, { status: 500 });
  }
}

// Collapsible Section Component
function Section({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  icon: React.ComponentType<{ size?: number }>; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Card className="border-t-4" style={{ borderTopColor: 'rgb(var(--color-primary))' }}>
      <CardHeader 
        className="cursor-pointer select-none" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: 'rgb(var(--color-primary))' }}>
            <Icon size={20} />
            {title}
          </CardTitle>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </CardHeader>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export default function AdminPortfolio() {
  const { portfolio } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  
  // Local state for each section
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (portfolio) {
      setExperiences(portfolio.experiences || []);
      setCertifications(portfolio.certifications || []);
      setSkills(Array.isArray(portfolio.skills) ? portfolio.skills : Object.values(portfolio.skills || {}).flat());
      setProjects(portfolio.projects || []);
      setSocialLinks(portfolio.socialLinks || {});
    }
  }, [portfolio]);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
    }
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Portfolio Found</h2>
          <p className="text-zinc-500">Create a portfolio first in the database.</p>
        </div>
      </div>
    );
  }

  // Experience handlers
  const addExperience = () => {
    setExperiences([...experiences, {
      title: "",
      company: "",
      role: "",
      location: "",
      period: "",
      year: "",
      isWorking: 0,
      description: [],
      summary: ""
    }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  // Certification handlers
  const addCertification = () => {
    setCertifications([...certifications, { title: "", issuer: "", year: "" }]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  // Project handlers
  const addProject = () => {
    setProjects([...projects, { title: "", description: "", url: "", imageUrl: "", duration: "" }]);
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Portfolio Editor</h1>
          <div className="w-12 h-0.5 bg-zinc-900 dark:bg-zinc-100"></div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
            Manage your portfolio content displayed on the About page
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Section title="Profile" icon={User} defaultOpen={true}>
            <Form method="post" encType="multipart/form-data" className="space-y-4">
              <input type="hidden" name="intent" value="updateProfile" />
              <input type="hidden" name="id" value={portfolio._id} />
              <input type="hidden" name="existingPortraitUrl" value={portfolio.portraitUrl || ""} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={portfolio.name} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-zinc-400" />
                    <Input id="location" name="location" defaultValue={portfolio.location} className="mt-1 pl-10" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio (one paragraph per line)</Label>
                <Textarea 
                  id="bio" 
                  name="bio" 
                  rows={4}
                  defaultValue={portfolio.bio?.join("\n")} 
                  className="mt-1" 
                  placeholder="Write your bio... Each line becomes a separate paragraph."
                />
              </div>

              <div>
                <Label htmlFor="portrait">Portrait Image</Label>
                <Input id="portrait" name="portrait" type="file" accept="image/*" className="mt-1" />
                {portfolio.portraitUrl && (
                  <img src={portfolio.portraitUrl} alt="Current portrait" className="mt-2 w-24 h-24 rounded-full object-cover" />
                )}
              </div>

              <Button 
                type="submit" 
                disabled={navigation.state === "submitting"}
                className="gap-2 text-white hover:opacity-90"
                style={{ backgroundColor: 'rgb(var(--color-primary))' }}
              >
                <Save size={16} /> Save Profile
              </Button>
            </Form>
          </Section>

          {/* Experiences Section */}
          <Section title="Work Experience" icon={Briefcase}>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="updateExperiences" />
              <input type="hidden" name="id" value={portfolio._id} />
              <input type="hidden" name="experiences" value={JSON.stringify(experiences)} />

              {experiences.map((exp, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-zinc-500">Experience #{index + 1}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeExperience(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input 
                      placeholder="Job Title" 
                      value={exp.title} 
                      onChange={(e) => updateExperience(index, "title", e.target.value)}
                    />
                    <Input 
                      placeholder="Company" 
                      value={exp.company} 
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                    />
                    <Input 
                      placeholder="Role" 
                      value={exp.role} 
                      onChange={(e) => updateExperience(index, "role", e.target.value)}
                    />
                    <Input 
                      placeholder="Location" 
                      value={exp.location} 
                      onChange={(e) => updateExperience(index, "location", e.target.value)}
                    />
                    <Input 
                      placeholder="Period (e.g. 2020-2023)" 
                      value={exp.period} 
                      onChange={(e) => updateExperience(index, "period", e.target.value)}
                    />
                    <Input 
                      placeholder="Year" 
                      value={exp.year} 
                      onChange={(e) => updateExperience(index, "year", e.target.value)}
                    />
                  </div>
                  <Textarea 
                    placeholder="Summary" 
                    value={exp.summary} 
                    onChange={(e) => updateExperience(index, "summary", e.target.value)}
                    className="mt-3"
                    rows={2}
                  />
                  <Textarea 
                    placeholder="Description (one point per line)" 
                    value={exp.description?.join("\n") || ""} 
                    onChange={(e) => updateExperience(index, "description", e.target.value.split("\n"))}
                    className="mt-2"
                    rows={3}
                  />
                  <label className="flex items-center gap-2 mt-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={exp.isWorking === 1} 
                      onChange={(e) => updateExperience(index, "isWorking", e.target.checked ? 1 : 0)}
                    />
                    Currently working here
                  </label>
                </motion.div>
              ))}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addExperience} className="gap-2">
                  <Plus size={16} /> Add Experience
                </Button>
                <Button 
                  type="submit" 
                  disabled={navigation.state === "submitting"}
                  className="gap-2 text-white hover:opacity-90"
                  style={{ backgroundColor: 'rgb(var(--color-primary))' }}
                >
                  <Save size={16} /> Save Experiences
                </Button>
              </div>
            </Form>
          </Section>

          {/* Certifications Section */}
          <Section title="Certifications" icon={Award}>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="updateCertifications" />
              <input type="hidden" name="id" value={portfolio._id} />
              <input type="hidden" name="certifications" value={JSON.stringify(certifications)} />

              {certifications.map((cert, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-start"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input 
                      placeholder="Certification Title" 
                      value={cert.title} 
                      onChange={(e) => updateCertification(index, "title", e.target.value)}
                    />
                    <Input 
                      placeholder="Issuer (e.g. AWS)" 
                      value={cert.issuer} 
                      onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                    />
                    <Input 
                      placeholder="Year" 
                      value={cert.year} 
                      onChange={(e) => updateCertification(index, "year", e.target.value)}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeCertification(index)}
                    className="text-red-500 hover:text-red-700 mt-1"
                  >
                    <Trash2 size={14} />
                  </Button>
                </motion.div>
              ))}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addCertification} className="gap-2">
                  <Plus size={16} /> Add Certification
                </Button>
                <Button 
                  type="submit" 
                  disabled={navigation.state === "submitting"}
                  className="gap-2 text-white hover:opacity-90"
                  style={{ backgroundColor: 'rgb(var(--color-primary))' }}
                >
                  <Save size={16} /> Save Certifications
                </Button>
              </div>
            </Form>
          </Section>

          {/* Skills Section */}
          <Section title="Skills" icon={Code}>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="updateSkills" />
              <input type="hidden" name="id" value={portfolio._id} />
              <input type="hidden" name="skills" value={JSON.stringify(skills)} />

              <div>
                <Label>Skills (comma-separated)</Label>
                <Textarea 
                  value={skills.join(", ")} 
                  onChange={(e) => setSkills(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                  className="mt-1"
                  rows={3}
                  placeholder="React, Node.js, AWS, Docker, Kubernetes..."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded">
                    {skill}
                  </span>
                ))}
              </div>

              <Button 
                type="submit" 
                disabled={navigation.state === "submitting"}
                className="gap-2 text-white hover:opacity-90"
                style={{ backgroundColor: 'rgb(var(--color-primary))' }}
              >
                <Save size={16} /> Save Skills
              </Button>
            </Form>
          </Section>

          {/* Projects Section */}
          <Section title="Projects" icon={FolderGit2}>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="updateProjects" />
              <input type="hidden" name="id" value={portfolio._id} />
              <input type="hidden" name="projects" value={JSON.stringify(projects)} />

              {projects.map((project, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-zinc-500">Project #{index + 1}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeProject(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input 
                      placeholder="Project Title" 
                      value={project.title} 
                      onChange={(e) => updateProject(index, "title", e.target.value)}
                    />
                    <Input 
                      placeholder="Duration (e.g. 6 months)" 
                      value={project.duration} 
                      onChange={(e) => updateProject(index, "duration", e.target.value)}
                    />
                    <Input 
                      placeholder="URL" 
                      value={project.url} 
                      onChange={(e) => updateProject(index, "url", e.target.value)}
                    />
                    <Input 
                      placeholder="Image URL" 
                      value={project.imageUrl} 
                      onChange={(e) => updateProject(index, "imageUrl", e.target.value)}
                    />
                  </div>
                  <Textarea 
                    placeholder="Description" 
                    value={project.description} 
                    onChange={(e) => updateProject(index, "description", e.target.value)}
                    className="mt-3"
                    rows={2}
                  />
                </motion.div>
              ))}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addProject} className="gap-2">
                  <Plus size={16} /> Add Project
                </Button>
                <Button 
                  type="submit" 
                  disabled={navigation.state === "submitting"}
                  className="gap-2 text-white hover:opacity-90"
                  style={{ backgroundColor: 'rgb(var(--color-primary))' }}
                >
                  <Save size={16} /> Save Projects
                </Button>
              </div>
            </Form>
          </Section>

          {/* Social Links Section */}
          <Section title="Social Links" icon={Share2}>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="updateSocialLinks" />
              <input type="hidden" name="id" value={portfolio._id} />
              <input type="hidden" name="socialLinks" value={JSON.stringify(socialLinks)} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["linkedin", "github", "twitter", "youtube", "instagram", "email"].map((platform) => (
                  <div key={platform}>
                    <Label htmlFor={platform} className="capitalize">{platform}</Label>
                    <Input 
                      id={platform}
                      placeholder={platform === "email" ? "email@example.com" : `https://${platform}.com/...`}
                      value={socialLinks[platform] || ""} 
                      onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>

              <Button 
                type="submit" 
                disabled={navigation.state === "submitting"}
                className="gap-2 text-white hover:opacity-90"
                style={{ backgroundColor: 'rgb(var(--color-primary))' }}
              >
                <Save size={16} /> Save Social Links
              </Button>
            </Form>
          </Section>
        </div>
      </div>
    </div>
  );
}
