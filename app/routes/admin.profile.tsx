import { json, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { updatePortfolio, getAllPortfolios } from "../Services/post.server";
import { uploadImage } from "../utils/cloudinary.server"
import { useToast } from "../hooks/use-toast";

export async function loader({ request }: LoaderFunctionArgs) {
  const portfolios = await getAllPortfolios();
  return json({ portfolios });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "update") {
      const id = formData.get("id") as string;
      const name = formData.get("name") as string;
      const bio = formData.get("bio")?.toString().split("\n") || [];
      const location = formData.get("location") as string;
      const portrait = formData.get("portrait") as File;
      let portraitUrl = formData.get("existingPortraitUrl") as string;
      if (portrait && portrait.size > 0) {
        const uploaded = await uploadImage(portrait, `portfolio-${name}-${Date.now()}`);
        portraitUrl = uploaded.url;
      }
      const experiences = JSON.parse(formData.get("experiences") as string);
      const certifications = JSON.parse(formData.get("certifications") as string);
      const hobbies = JSON.parse(formData.get("hobbies") as string);
      const skills = JSON.parse(formData.get("skills") as string);
      const currentWorks = JSON.parse(formData.get("currentWorks") as string);
      const projects = JSON.parse(formData.get("projects") as string);
      const socialLinks = JSON.parse(formData.get("socialLinks") as string);

      await updatePortfolio(id, {
        name,
        bio,
        portraitUrl,
        location,
        experiences,
        certifications,
        hobbies,
        skills,
        currentWorks,
        projects,
        socialLinks,
      });
      return json({ success: true, message: "Portfolio updated" });
    }
  } catch (error) {
    return json({ success: false, error: error.message }, { status: 400 });
  }
}

export default function Portfolio() {
  const { portfolios } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigation = useNavigation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    portrait: null,
    experiences: "[]",
    certifications: "[]",
    hobbies: "[]",
    skills: "[]",
    currentWorks: "[]",
    projects: "[]",
    socialLinks: "{}",
  });

  useEffect(() => {
    if (actionData?.success) {
      toast({ title: "Success", description: actionData.message });
      setEditingId(null);
      setFormData({
        name: "",
        bio: "",
        location: "",
        portrait: null,
        experiences: "[]",
        certifications: "[]",
        hobbies: "[]",
        skills: "[]",
        currentWorks: "[]",
        projects: "[]",
        socialLinks: "{}",
      });
    } else if (actionData?.error) {
      toast({ title: "Error", description: actionData.error, variant: "destructive" });
    }
  }, [actionData, toast]);

  useEffect(() => {
    if (editingId) {
      const portfolio = portfolios.find((p) => p._id === editingId);
      if (portfolio) {
        setFormData({
          name: portfolio.name || "",
          bio: portfolio.bio?.join("\n") || "",
          location: portfolio.location || "",
          portrait: null,
          experiences: JSON.stringify(portfolio.experiences || []),
          certifications: JSON.stringify(portfolio.certifications || []),
          hobbies: JSON.stringify(portfolio.hobbies || []),
          skills: JSON.stringify(portfolio.skills || []),
          currentWorks: JSON.stringify(portfolio.currentWorks || []),
          projects: JSON.stringify(portfolio.projects || []),
          socialLinks: JSON.stringify(portfolio.socialLinks || {}),
        });
      }
    }
  }, [editingId, portfolios]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
        <CardHeader>
          <CardTitle>Portfolios</CardTitle>
        </CardHeader>
        <CardContent>
          {editingId && (
            <Form method="post" encType="multipart/form-data" className="space-y-4 mb-6">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="id" value={editingId} />
              <input type="hidden" name="existingPortraitUrl" value={portfolios.find((p) => p._id === editingId)?.portraitUrl} />
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                />
              </div>
              <div>
                <Label htmlFor="portrait">Portrait</Label>
                <Input
                  id="portrait"
                  name="portrait"
                  type="file"
                  accept="image/*"
                  className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                  onChange={(e) => setFormData((prev) => ({ ...prev, portrait: e.target.files?.[0] || null }))}
                />
                {portfolios.find((p) => p._id === editingId)?.portraitUrl && (
                  <img
                    src={portfolios.find((p) => p._id === editingId)?.portraitUrl}
                    alt="Portrait"
                    className="mt-2 w-24 h-24 object-cover"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="experiences">Experiences (JSON)</Label>
                <Textarea
                  id="experiences"
                  name="experiences"
                  value={formData.experiences}
                  onChange={handleInputChange}
                  className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                  placeholder='[{"title":"Software Engineer","role":"Developer","year":"2020-2022","isWorking":0,"company":"Tech Corp","description":["Built apps"],"period":"2 years","location":"NY","summary":"Developed solutions"}]'
                />
              </div>
              <div>
                <Label htmlFor="certifications">Certifications (JSON)</Label>
                <Textarea
                  id="certifications"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                  placeholder='[{"title":"AWS Certified","issuer":"Amazon","year":"2023"}]'
                />
              </div>
              <div>
                <Label htmlFor="hobbies">Hobbies (JSON)</Label>
                <Textarea
                  id="hobbies"
                  name="hobbies"
                  value={formData.hobbies}
                  onChange={handleInputChange}
                  className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                  placeholder='[{"name":"Photography","description":"Nature shots"}]'
                />
              </div>
              <div>
                <Label htmlFor="skills">Skills (JSON)</Label>
                <Textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                  placeholder='["JavaScript","React"] or {"Frontend":["React","Vue"],"Backend":["Node.js"]}'
                />
              </div>
              <div>
                <Label htmlFor="currentWorks">Current Works (JSON)</Label>
                <Textarea
                  id="currentWorks"
                  name="currentWorks"
                  value={formData.currentWorks}
                  onChange={handleInputChange}
                  className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                  placeholder='[{"title":"Freelance Developer","description":"Building web apps"}]'
                />
              </div>
              <div>
                <Label htmlFor="projects">Projects (JSON)</Label>
                <Textarea
                  id="projects"
                  name="projects"
                  value={formData.projects}
                  onChange={handleInputChange}
                  className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                  placeholder='[{"title":"Blog App","description":"Remix.js CMS","url":"https://example.com","imageUrl":"https://example.com/image.jpg","duration":"6 months"}]'
                />
              </div>
              <div>
                <Label htmlFor="socialLinks">Social Links (JSON)</Label>
                <Textarea
                  id="socialLinks"
                  name="socialLinks"
                  value={formData.socialLinks}
                  onChange={handleInputChange}
                  className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                  placeholder='{"linkedin":"https://linkedin.com/in/user","github":"https://github.com/user"}'
                />
              </div>
              <Button
                type="submit"
                disabled={navigation.state === "submitting"}
                className="bg-zinc-700 dark:bg-zinc-300 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-600 dark:hover:bg-zinc-400"
              >
                Update Portfolio
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingId(null)}
                className="border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
              >
                Cancel
              </Button>
            </Form>
          )}

          <Table>
            <TableHeader>
              <TableRow className="border-zinc-200 dark:border-zinc-700">
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Portrait</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolios.map((portfolio) => (
                <TableRow key={portfolio._id} className="border-zinc-200 dark:border-zinc-700">
                  <TableCell>{portfolio.name}</TableCell>
                  <TableCell>{portfolio.location || "N/A"}</TableCell>
                  <TableCell>
                    {portfolio.portraitUrl && (
                      <img src={portfolio.portraitUrl} alt={portfolio.name} className="w-16 h-16 object-cover" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(portfolio._id)}
                      className="border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}