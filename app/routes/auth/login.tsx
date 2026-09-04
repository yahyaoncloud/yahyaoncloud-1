import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation, useSearchParams, useSubmit, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { FaGoogle, FaGithub, FaDiscord } from "react-icons/fa";
import { LuSun as Sun, LuMoon as Moon, LuLock as Lock, LuArrowRight as ArrowRight } from "react-icons/lu";
import { useTheme } from "~/Contexts/ThemeContext";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import YOC from "~/assets/yoc-logo5.png";
import GraffitiBg from "~/assets/tech-blog-graffiti-bg.jpg";
import { authenticateAdmin, createAdminSession, generateAdminToken, getAdminFromRequest } from "~/utils/admin-auth.server";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "~/utils/firebase.client";
import { toast } from "sonner";
import type { ActionResponse } from "~/Types/types";

export async function loader({ request }: LoaderFunctionArgs) {
  const admin = await getAdminFromRequest(request);
  if (admin) {
    return redirect("/admin/dashboard");
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");
  const rememberMe = formData.get("rememberMe") === "on";

  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return json<ActionResponse>({ error: "Username and password are required" }, { status: 400 });
  }

  const admin = await authenticateAdmin(username, password);

  if (!admin) {
    return json<ActionResponse>({ error: "Invalid username or password" }, { status: 401 });
  }

  const token = generateAdminToken(admin);
  const cookie = createAdminSession(token, rememberMe);

  return redirect("/admin/dashboard", {
    headers: {
      "Set-Cookie": cookie,
    },
  });
}

export default function UnifiedLogin() {
  const actionData = useActionData<typeof action>() as ActionResponse | undefined;
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  const isSubmitting = navigation.state === "submitting";

  // Handle URL errors (from SSO redirects)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("error");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const submit = useSubmit();

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
      toast.error("Firebase Auth not initialized");
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      submit({ idToken, loginType: "google" }, { method: "post", action: "/api/auth" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in with Google";
      console.error("Google Sign-In Error:", err);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* Full-Page 3-Tone Tech Blog Graffiti Background (Dark Zinc, Zinc White, Electric Indigo) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity scale-105 pointer-events-none"
        style={{ backgroundImage: `url(${GraffitiBg})` }}
      />

      {/* Solid Dark Overlay (No glassmorphism) */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/90 to-zinc-950 pointer-events-none" />

      {/* Top Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 max-w-6xl mx-auto w-full">
        <Link
          to="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors text-sm font-mono tracking-tight"
        >
          <span className="text-indigo-400 font-bold">←</span> Back to Portfolio
        </Link>
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-indigo-500 transition-all shadow-md cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-400" />}
        </button>
      </header>

      {/* Main Solid 3-Tone Login Card (No top border line) */}
      <div className="w-full max-w-[440px] relative z-10 my-10 px-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black space-y-7 relative overflow-hidden">
          {/* Large Logo & Brand Heading */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner">
              <img
                src={YOC}
                alt="YahyaOnCloud Logo"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain transition-transform hover:scale-105"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                YahyaOnCloud
              </h1>
              <p className="text-xs text-indigo-400 font-mono tracking-wider uppercase mt-0.5">
                Admin Control Portal
              </p>
            </div>
          </div>

          {/* 3-Tone SSO Quick Sign-In Grid */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 hover:border-indigo-500/80 text-zinc-100 text-xs font-semibold font-mono transition-all cursor-pointer active:scale-95 shadow-sm"
                title="Sign in with Google"
              >
                <FaGoogle className="w-4 h-4 text-red-500" />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/auth/sso/github";
                }}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 hover:border-indigo-500/80 text-zinc-100 text-xs font-semibold font-mono transition-all cursor-pointer active:scale-95 shadow-sm"
                title="Sign in with GitHub"
              >
                <FaGithub className="w-4 h-4 text-white" />
                <span>GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/auth/sso/discord";
                }}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 hover:border-indigo-500/80 text-zinc-100 text-xs font-semibold font-mono transition-all cursor-pointer active:scale-95 shadow-sm"
                title="Sign in with Discord"
              >
                <FaDiscord className="w-4 h-4 text-indigo-400" />
                <span>Discord</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative px-3 bg-zinc-900 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                or master credentials
              </span>
            </div>
          </div>

          {/* Direct Credentials Form */}
          <Form method="post" className="space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="admin-username" className="text-xs font-mono font-medium text-zinc-300">
                Username / Identifier
              </Label>
              <Input
                id="admin-username"
                name="username"
                type="text"
                required
                autoComplete="username"
                placeholder="admin"
                className="h-11 text-sm bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-password" className="text-xs font-mono font-medium text-zinc-300">
                  Master Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 text-sm bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 pr-10"
                />
                <Lock size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Minimalist Remember Me Selection UI */}
            <div className="flex items-center justify-between pt-1">
              <label htmlFor="admin-remember" className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors">
                <input
                  id="admin-remember"
                  name="rememberMe"
                  type="checkbox"
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/30 focus:ring-offset-0 transition-colors cursor-pointer"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {(actionData?.error || error) && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs font-mono">
                {actionData?.error || error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-sm font-mono font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-950/50 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? "Verifying..." : "Sign In to Admin Portal"}</span>
              <ArrowRight size={15} />
            </Button>
          </Form>

          {/* Footer Link to Home Public Page */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-center">
            <Link
              to="/"
              className="text-xs font-mono text-zinc-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <span>Return to Public Website</span>
              <span className="text-indigo-400">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
