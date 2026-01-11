import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation, Form, useActionData } from "@remix-run/react";
import { requireAdmin } from "~/utils/admin-auth.server";
import { getAdminById, updateAdmin } from "~/Services/admin.prisma.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { User, Shield, Save, Loader2 } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { id } = await requireAdmin(request);
  const admin = await getAdminById(id);
  
  if (!admin) {
    throw new Response("Admin not found", { status: 404 });
  }

  return json({ admin });
}

export async function action({ request }: ActionFunctionArgs) {
  const { id } = await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "profile") {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;

    if (!username) {
        return json({ success: false, error: "Username is required", intent: "profile" });
    }

    try {
        await updateAdmin(id, { username, email });
        return json({ success: true, message: "Profile updated successfully", intent: "profile" });
    } catch (error) {
        console.error("Update error:", error);
        return json({ success: false, error: "Failed to update profile", intent: "profile" });
    }
  }

  if (intent === "security") {
    const password = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || password.length < 6) {
        return json({ success: false, error: "Password must be at least 6 characters", intent: "security" });
    }

    if (password !== confirmPassword) {
        return json({ success: false, error: "Passwords do not match", intent: "security" });
    }

    try {
        await updateAdmin(id, { password });
        return json({ success: true, message: "Password updated successfully", intent: "security" });
    } catch (error) {
         console.error("Update error:", error);
         return json({ success: false, error: "Failed to update password", intent: "security" });
    }
  }

  return json({ success: false, error: "Invalid intent" });
}

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  intent?: string;
}

export default function AdminSettings() {
  const { admin } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as ActionResponse | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Manage your account settings and preferences.</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <User className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Profile Information</h2>
        </div>
        
        <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="profile" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                        id="username" 
                        name="username" 
                        defaultValue={admin.username || ""} 
                        className="bg-zinc-50 dark:bg-zinc-950"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        defaultValue={admin.email || ""} 
                        placeholder="admin@example.com"
                        className="bg-zinc-50 dark:bg-zinc-950"
                    />
                </div>
            </div>

            {actionData?.intent === "profile" && (
                <div className={`text-sm ${actionData.success ? "text-green-600" : "text-red-600"}`}>
                    {actionData.success ? actionData.message : actionData.error}
                </div>
            )}

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Profile
                </Button>
            </div>
        </Form>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Shield className="text-emerald-600 dark:text-emerald-400" size={20} />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Security</h2>
        </div>
        
        <Form method="post" className="space-y-4">
             <input type="hidden" name="intent" value="security" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                        id="newPassword" 
                        name="newPassword" 
                        type="password"
                        placeholder="••••••••"
                        className="bg-zinc-50 dark:bg-zinc-950"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        type="password"
                        placeholder="••••••••"
                        className="bg-zinc-50 dark:bg-zinc-950"
                    />
                </div>
            </div>

            {actionData?.intent === "security" && (
                <div className={`text-sm ${actionData.success ? "text-green-600" : "text-red-600"}`}>
                    {actionData.success ? actionData.message : actionData.error}
                </div>
            )}

            <div className="flex justify-end pt-2">
                <Button type="submit" variant="outline" disabled={isSubmitting} className="gap-2 border-red-200 hover:bg-red-50 text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20 dark:text-red-400">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
                    Update Password
                </Button>
            </div>
        </Form>
      </div>
    </div>
  );
}
