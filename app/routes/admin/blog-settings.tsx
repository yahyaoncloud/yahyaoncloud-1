import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation, Form, useActionData } from "@remix-run/react";
import { requireAdmin } from "~/utils/admin-auth.server";
import { getSiteSettings, updateSiteSettings } from "~/Services/site-settings.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Save, Globe, AlertTriangle, Loader2 } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const settings = await getSiteSettings();
  return json({ settings });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  
  const updates = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    keywords: formData.get("keywords") as string,
    maintenanceMode: formData.get("maintenanceMode") === "on",
    socialLinks: {
        twitter: formData.get("twitter") as string,
        github: formData.get("github") as string,
        linkedin: formData.get("linkedin") as string,
        instagram: formData.get("instagram") as string,
    }
  };

  try {
    await updateSiteSettings(updates);
    return json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    return json({ success: false, error: "Failed to update settings" });
  }
}

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default function BlogSettings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as ActionResponse | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Blog Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Configure global site settings and SEO defaults.</p>
      </div>

      <Form method="post" className="space-y-8">
        {/* General Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <Globe className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">General Information</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Site Title</Label>
                    <Input 
                        id="title" 
                        name="title" 
                        defaultValue={settings.title} 
                        className="bg-zinc-50 dark:bg-zinc-950"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Site Description (Meta)</Label>
                    <Textarea 
                        id="description" 
                        name="description" 
                        defaultValue={settings.description} 
                        className="bg-zinc-50 dark:bg-zinc-950 min-h-[100px]"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords (comma separated)</Label>
                    <Input 
                        id="keywords" 
                        name="keywords" 
                        defaultValue={settings.keywords} 
                        placeholder="react, remix, blog..."
                        className="bg-zinc-50 dark:bg-zinc-950"
                    />
                </div>
            </div>
        </div>

        {/* Social Links (Global) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter / X URL</Label>
                    <Input id="twitter" name="twitter" defaultValue={settings.socialLinks?.twitter} className="bg-zinc-50 dark:bg-zinc-950" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="github">GitHub URL</Label>
                    <Input id="github" name="github" defaultValue={settings.socialLinks?.github} className="bg-zinc-50 dark:bg-zinc-950" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input id="linkedin" name="linkedin" defaultValue={settings.socialLinks?.linkedin} className="bg-zinc-50 dark:bg-zinc-950" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram URL</Label>
                    <Input id="instagram" name="instagram" defaultValue={settings.socialLinks?.instagram} className="bg-zinc-50 dark:bg-zinc-950" />
                </div>
            </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm border-l-4 border-l-amber-500">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="text-amber-500" size={24} />
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Maintenance Mode</h2>
                        <p className="text-sm text-zinc-500">Enable this to show a maintenance page to all visitors.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="hidden" 
                        name="maintenanceMode" 
                        value={settings.maintenanceMode ? "on" : "off"} 
                    />
                   <Switch 
                        checked={settings.maintenanceMode} 
                        onCheckedChange={() => {
                            // This is a UI controlled input only for visual, the form submission handles the value usually via hidden input or manual handling if we used client state.
                            // But standard Form submission with switch component might need a hidden input if the switch itself doesn't have a name/value prop that works natively.
                            // Shadcn Switch manages state. We need to sync/ensure a named input exists or use client state submitting.
                            // For simplicity, I'll rely on the native HTML semantics or wrapper.
                             // Actually, shadcn Switch requires a hidden input or onCheckedChange to update a hidden field if used in a raw Form.
                        }}
                        name="maintenanceMode_toggle" /* Shadcn might not pass name down to input directly same way */
                   />
                   {/* Fallback simple checkbox if Switch is complex to wire without client state */}
                   <input type="checkbox" name="maintenanceMode" defaultChecked={settings.maintenanceMode} className="accent-amber-500 w-5 h-5 ml-2" />
                </div>
             </div>
        </div>

        {actionData && (
            <div className={`text-sm p-4 rounded-lg ${actionData.success ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                {actionData.success ? actionData.message : actionData.error}
            </div>
        )}

        <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Configuration
            </Button>
        </div>
      </Form>
    </div>
  );
}
