import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { requireAdmin } from "~/utils/admin-auth.server";
import { getSiteSettings, updateSiteSettings, type SiteSettings } from "~/Services/site-settings.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Settings, Globe, Save, Loader2, Mail, Share2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const settings = await getSiteSettings();
  return json({ settings });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  
  const siteName = (formData.get("siteName") as string)?.trim() || "YahyaOnCloud";
  const siteDescription = (formData.get("siteDescription") as string)?.trim() || "";
  const keywords = (formData.get("keywords") as string)?.trim() || "";
  const twitter = (formData.get("twitter") as string)?.trim() || "";
  const github = (formData.get("github") as string)?.trim() || "";
  const linkedin = (formData.get("linkedin") as string)?.trim() || "";
  const instagram = (formData.get("instagram") as string)?.trim() || "";
  const maintenanceMode = formData.get("maintenanceMode") === "on";

  try {
    const updated = await updateSiteSettings({
      title: siteName,
      description: siteDescription,
      keywords,
      maintenanceMode,
      socialLinks: {
        twitter,
        github,
        linkedin,
        instagram,
      },
    });

    return json({ success: true, message: "Site settings updated and persisted successfully!" });
  } catch (err) {
    return json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to update settings",
    }, { status: 500 });
  }
}

export default function AdminSiteSettings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [maintenance, setMaintenance] = useState(Boolean(settings.maintenanceMode));

  useEffect(() => {
    if ((actionData as any)?.success && (actionData as any).message) {
      toast.success((actionData as any).message);
    } else if ((actionData as any)?.error) {
      toast.error((actionData as any).error);
    }
  }, [actionData]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Settings className="text-indigo-600 dark:text-indigo-400" size={24} /> Site & SEO Configuration
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Configure your portfolio website's global titles, OpenGraph meta, social handles, and maintenance status.
        </p>
      </div>

      <Form method="post" className="space-y-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Globe className="text-indigo-600 dark:text-indigo-400" size={18} />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">General Identity & SEO</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="siteName">Site Name / Title</Label>
              <Input 
                id="siteName" 
                name="siteName" 
                defaultValue={settings.title}
                placeholder="YahyaOnCloud"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="siteDescription">Meta Description (SEO & Social Cards)</Label>
              <Textarea 
                id="siteDescription" 
                name="siteDescription" 
                defaultValue={settings.description}
                placeholder="Personal website, engineering case studies, research papers, and technical blog by Yahya..."
                className="bg-zinc-50 dark:bg-zinc-950 min-h-[80px] text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="keywords">Keywords (Comma Separated)</Label>
              <Input 
                id="keywords" 
                name="keywords" 
                defaultValue={settings.keywords}
                placeholder="cloud engineering, distributed systems, research, remix, react, kubernetes"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Share2 className="text-blue-600 dark:text-blue-400" size={18} />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Social Media & Contact Links</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="twitter">Twitter / X URL</Label>
              <Input 
                id="twitter" 
                name="twitter" 
                defaultValue={settings.socialLinks?.twitter || ""}
                placeholder="https://x.com/yahyaoncloud"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="github">GitHub Profile URL</Label>
              <Input 
                id="github" 
                name="github" 
                defaultValue={settings.socialLinks?.github || ""}
                placeholder="https://github.com/yahyaoncloud"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
              <Input 
                id="linkedin" 
                name="linkedin" 
                defaultValue={settings.socialLinks?.linkedin || ""}
                placeholder="https://linkedin.com/in/yahyaoncloud"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="instagram">Instagram Profile URL</Label>
              <Input 
                id="instagram" 
                name="instagram" 
                defaultValue={settings.socialLinks?.instagram || ""}
                placeholder="https://instagram.com/yahyaoncloud"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <AlertTriangle className="text-amber-500" size={18} />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">System Availability</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="maintenanceMode"
              name="maintenanceMode"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <Label htmlFor="maintenanceMode" className="cursor-pointer font-medium text-xs">
                Enable Maintenance Mode
              </Label>
              <p className="text-[11px] text-zinc-500">
                When active, public visitors will see a maintenance screen while admin portal remains accessible.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]">
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Settings
          </Button>
        </div>
      </Form>
    </div>
  );
}
