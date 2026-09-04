import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form, Link } from "@remix-run/react";
import { LuUser as User, LuShield as Shield, LuKeyRound as KeyRound, LuMail as Mail, LuLock as Lock, LuSave as Save, LuLoaderCircle as Loader2, LuCircleCheck as CheckCircle2, LuLogOut as LogOut, LuClock as Clock, LuSparkles as Sparkles, LuShieldCheck as ShieldCheck } from "react-icons/lu";
import { requireAdmin } from "~/utils/admin-auth.server";
import { getAdminByUsername, updateAdmin } from "~/Services/admin.prisma.server";
import { verifyPassword } from "~/utils/password.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { AdminPageHeader } from "~/components/admin";
import { toast } from "sonner";
import { useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const adminPayload = await requireAdmin(request);

  // Query MongoDB record for admin
  let admin = await getAdminByUsername(adminPayload.username);

  if (!admin) {
    return json({
      admin: {
        id: adminPayload.id,
        username: adminPayload.username,
        email: adminPayload.email || "",
        role: adminPayload.role || "admin",
        createdAt: new Date().toISOString(),
        isFirebaseOnly: true,
      },
    });
  }

  return json({
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email || "",
      role: admin.role || "admin",
      createdAt: admin.createdAt ? new Date(admin.createdAt).toISOString() : new Date().toISOString(),
      isFirebaseOnly: false,
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const adminPayload = await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  const admin = await getAdminByUsername(adminPayload.username);
  if (!admin) {
    return json(
      {
        success: false,
        error: "Your account is managed by session token. Changes cannot be committed to MongoDB.",
        intent: String(intent),
      },
      { status: 400 }
    );
  }

  // 1. Update Profile (Username & Email)
  if (intent === "update-profile") {
    const username = (formData.get("username") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();

    if (!username) {
      return json({ success: false, error: "Username is required", intent: "update-profile" }, { status: 400 });
    }

    try {
      await updateAdmin(admin.id, { username, email: email || undefined });
      return json({
        success: true,
        message: "Profile information updated successfully!",
        intent: "update-profile",
      });
    } catch (err) {
      console.error("Profile update error:", err);
      return json(
        {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update profile",
          intent: "update-profile",
        },
        { status: 500 }
      );
    }
  }

  // 2. Update Password
  if (intent === "update-password") {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!newPassword || newPassword.length < 6) {
      return json(
        { success: false, error: "New password must be at least 6 characters long", intent: "update-password" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return json(
        { success: false, error: "New passwords do not match", intent: "update-password" },
        { status: 400 }
      );
    }

    // Verify current password if admin has password
    if (admin.password) {
      if (!currentPassword) {
        return json(
          { success: false, error: "Current password is required to set a new password", intent: "update-password" },
          { status: 400 }
        );
      }

      const isValid = await verifyPassword(currentPassword, admin.password);
      if (!isValid) {
        return json(
          { success: false, error: "Current password is incorrect", intent: "update-password" },
          { status: 400 }
        );
      }
    }

    try {
      await updateAdmin(admin.id, { password: newPassword });
      return json({
        success: true,
        message: "Admin password updated successfully!",
        intent: "update-password",
      });
    } catch (err) {
      console.error("Password update error:", err);
      return json(
        {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update password",
          intent: "update-password",
        },
        { status: 500 }
      );
    }
  }

  return json({ success: false, error: "Invalid action intent" }, { status: 400 });
}

export default function AdminProfile() {
  const { admin } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as
    | { success?: boolean; message?: string; error?: string; intent?: string }
    | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success && actionData.message) {
      toast.success(actionData.message);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <AdminPageHeader
        title="Admin Profile"
        description="Manage your administrator identity, account credentials, and session authentication."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="capitalize">{admin.role || "Administrator"}</span>
          </span>
        }
        actions={
          <Link to="/admin/logout">
            <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
              <LogOut className="h-4 w-4 mr-1.5" />
              <span>Sign Out</span>
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Profile Card & Identity */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-20 h-20 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-md mb-3">
                {admin.username.charAt(0).toUpperCase()}
              </div>
              <CardTitle className="text-lg text-zinc-900 dark:text-zinc-100">{admin.username}</CardTitle>
              <CardDescription className="text-xs truncate">{admin.email || "No email assigned"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Account Role</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase font-mono text-[11px]">
                  {admin.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Auth Engine</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {admin.isFirebaseOnly ? "Firebase Auth" : "MongoDB Native"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Member Since</span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Security Overview Box */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <CardTitle className="text-sm font-semibold">Security Health</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>JWT Encrypted Sessions</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>HttpOnly & SameSite Protection</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Strict SSR Authorization Guard</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Details Form */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-500" />
                <div>
                  <CardTitle className="text-base font-semibold">Account Details</CardTitle>
                  <CardDescription className="text-xs">
                    Update your administrator username and contact email.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="update-profile" />

                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-medium">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      id="username"
                      name="username"
                      defaultValue={admin.username}
                      className="pl-9 bg-zinc-50/50 dark:bg-zinc-950"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={admin.email}
                      placeholder="admin@yahyaoncloud.com"
                      className="pl-9 bg-zinc-50/50 dark:bg-zinc-950"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1.5" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>

          {/* Change Password Form */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-purple-500" />
                <div>
                  <CardTitle className="text-base font-semibold">Change Password</CardTitle>
                  <CardDescription className="text-xs">
                    Ensure your account is using a strong, secure passphrase.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="update-password" />

                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-xs font-medium">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 bg-zinc-50/50 dark:bg-zinc-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-xs font-medium">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9 bg-zinc-50/50 dark:bg-zinc-950"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-medium">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9 bg-zinc-50/50 dark:bg-zinc-950"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4 mr-1.5" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
