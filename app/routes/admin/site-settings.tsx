import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { requireAdmin } from "~/utils/admin-auth.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Settings, Globe, Save, Loader2, Mail, Share2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

// For now, we'll use environment variables and a simple key-value store approach
// In the future, this could be backed by a database Settings model

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
  analyticsId?: string;
  maintenanceMode: boolean;
}

// Default settings (in production, these would come from database)
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "YahyaOnCloud",
  siteDescription: "Personal website and blog",
  contactEmail: "",
  socialLinks: {},
  analyticsId: "",
  maintenanceMode: false,
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  
  // TODO: Load settings from database
  // For now, return defaults
  const settings = DEFAULT_SETTINGS;
  
  return json({ settings });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  
  const siteName = formData.get("siteName") as string;
  const siteDescription = formData.get("siteDescription") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const twitter = formData.get("twitter") as string;
  const github = formData.get("github") as string;
  const linkedin = formData.get("linkedin") as string;
  const instagram = formData.get("instagram") as string;
  const analyticsId = formData.get("analyticsId") as string;
  const maintenanceMode = formData.get("maintenanceMode") === "on";

  // TODO: Save settings to database
  // For now, just return success
  console.log("Site settings update:", {
    siteName,
    siteDescription,
    contactEmail,
    socialLinks: { twitter, github, linkedin, instagram },
    analyticsId,
    maintenanceMode,
  });

  return json({ success: true, message: "Settings updated! (Note: Database persistence coming soon)" });
}

export default function SiteSettings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success && actionData.message) {
      toast.success(actionData.message);
    }
  }, [actionData]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Site Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Configure your website's global settings.</p>
      </div>

      <Form method="post" className="space-y-8">
        {/* General Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Globe className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">General</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input 
                id="siteName" 
                name="siteName" 
                defaultValue={settings.siteName}
                placeholder="My Awesome Site"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea 
                id="siteDescription" 
                name="siteDescription" 
                defaultValue={settings.siteDescription}
                placeholder="A brief description of your website..."
                className="bg-zinc-50 dark:bg-zinc-950 min-h-[80px]"
              />
              <p className="text-xs text-zinc-500">Used for SEO and social sharing.</p>
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Mail className="text-emerald-600 dark:text-emerald-400" size={20} />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Contact</h2>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input 
              id="contactEmail" 
              name="contactEmail" 
              type="email"
              defaultValue={settings.contactEmail}
              placeholder="contact@example.com"
              className="bg-zinc-50 dark:bg-zinc-950"
            />
            <p className="text-xs text-zinc-500">Email address for contact form submissions.</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Share2 className="text-blue-600 dark:text-blue-400" size={20} />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Social Links</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input 
                id="twitter" 
                name="twitter" 
                defaultValue={settings.socialLinks.twitter || ""}
                placeholder="https://twitter.com/username"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input 
                id="github" 
                name="github" 
                defaultValue={settings.socialLinks.github || ""}
                placeholder="https://github.com/username"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input 
                id="linkedin" 
                name="linkedin" 
                defaultValue={settings.socialLinks.linkedin || ""}
                placeholder="https://linkedin.com/in/username"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input 
                id="instagram" 
                name="instagram" 
                defaultValue={settings.socialLinks.instagram || ""}
                placeholder="https://instagram.com/username"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Settings className="text-amber-600 dark:text-amber-400" size={20} />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Advanced</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="analyticsId">Google Analytics ID</Label>
              <Input 
                id="analyticsId" 
                name="analyticsId" 
                defaultValue={settings.analyticsId || ""}
                placeholder="G-XXXXXXXXXX"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
              <p className="text-xs text-zinc-500">Your Google Analytics 4 measurement ID.</p>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                defaultChecked={settings.maintenanceMode}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <Label htmlFor="maintenanceMode" className="cursor-pointer">Maintenance Mode</Label>
                <p className="text-xs text-zinc-500">When enabled, visitors will see a maintenance page.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Settings
          </Button>
        </div>
      </Form>
    </div>
  );
}
