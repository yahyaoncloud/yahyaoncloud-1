import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useNavigation, useSearchParams, useSubmit } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { FaGoogle, FaGithub, FaDiscord } from 'react-icons/fa';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import YOC from "~/assets/yoc-logo5.png"
import { authenticateAuthor, createAuthorSession, generateAuthorToken } from '~/utils/author-auth.server';
import { authenticateAdmin, createAdminSession, generateAdminToken, getAdminFromRequest } from '~/utils/admin-auth.server';
import { getAuthorFromRequest } from '~/utils/author-auth.server';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '~/utils/firebase.client';
import { toast } from 'sonner';

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if already logged in
  const author = await getAuthorFromRequest(request);
  if (author) {
    return redirect('/authors/dashboard');
  }
  
  const admin = await getAdminFromRequest(request);
  if (admin) {
    return redirect('/admin/dashboard');
  }
  
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const loginType = formData.get('loginType') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const rememberMe = formData.get('rememberMe') === 'on';
  
  if (!username || !password) {
    return json({ error: 'Username and password are required' }, { status: 400 });
  }
  
  if (loginType === 'author') {
    // Author authentication
    const author = await authenticateAuthor(username, password);
    
    if (!author) {
      return json({ error: 'Invalid username or password' }, { status: 401 });
    }
    
    const token = generateAuthorToken({
      ...author,
      username: author.username || username // Ensure username is never null
    });
    const cookie = createAuthorSession(token);
    
    const redirectTo = author.mustChangePassword ? '/authors/change-password' : '/authors/dashboard';
    
    return redirect(redirectTo, {
      headers: {
        'Set-Cookie': cookie
      }
    });
  } else {
    // Admin authentication (username/password)
    const admin = await authenticateAdmin(username, password);
    
    if (!admin) {
      return json({ error: 'Invalid username or password' }, { status: 401 });
    }
    
    const token = generateAdminToken(admin);
    const cookie = createAdminSession(token, rememberMe);
    
    return redirect('/admin/dashboard', {
      headers: {
        'Set-Cookie': cookie
      }
    });
  }
}

export default function UnifiedLogin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const activeTab = searchParams.get('type') || 'admin';
  const isSubmitting = navigation.state === 'submitting';
  
  // Get error from URL params (from SSO callback)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
      // Clear error from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('error');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  
  const setActiveTab = (tab: string) => {
    setSearchParams({ type: tab });
    setError(null);
  };

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
      
      // Submit token to server to create session
      submit({ idToken, loginType: 'google' }, { method: "post", action: "/api/auth" });
      
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4 relative overflow-hidden">
      {/* Dotted background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} 
        />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Animated gradient border */}
        <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 animate-gradient-x">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 h-[650px] flex flex-col">
            {/* Logo and Branding */}
            <div className="text-center mb-6">
              <img 
                src={YOC} 
                alt="YahyaOnCloud Logo" 
                className="w-24 h-24 mx-auto mb-3"
              />
              <h1 className="text-2xl font-light mb-1 mrs-saint-delafield-regular">YahyaOnCloud</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Sign in to your account</p>
            </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-zinc-100 dark:bg-zinc-700 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'admin'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('author')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'author'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Author
            </button>
          </div>
          
          {/* Content Area - Fixed height */}
          <div className="flex-1 overflow-y-auto">
          
          {/* Admin Login */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              {/* SSO Providers */}
              <div className="flex gap-3">
                <Button
                  onClick={handleGoogleLogin}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white dark:border-zinc-600"
                  variant="outline"
                  type="button"
                >
                  <FaGoogle className="w-4 h-4 text-red-500" />
                </Button>

                <Button
                  onClick={() => window.location.href = '/auth/sso/github'}
                  className="flex-1 bg-black hover:bg-gray-800 text-white dark:bg-zinc-900 dark:hover:bg-black"
                  type="button"
                >
                  <FaGithub className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => window.location.href = '/auth/sso/discord'}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-800"
                  type="button"
                >
                  <FaDiscord className="w-4 h-4" />
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-300 dark:border-zinc-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-zinc-800 text-zinc-500">or</span>
                </div>
              </div>

              {/* Username/Password Form */}
              <Form method="post" className="space-y-4">
                <input type="hidden" name="loginType" value="admin" />
                <div>
                  <Input
                    id="admin-username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Username"
                    className="w-full"
                  />
                </div>
                
                <div className="relative">
                  <Input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Password"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="admin-remember"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="admin-remember" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                    Remember me
                  </label>
                </div>
                
                {(actionData?.error || error) && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded text-sm">
                    {actionData?.error || error}
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form>
            </div>
          )}
          
          {/* Author Login */}
          {activeTab === 'author' && (
            <Form method="post" className="space-y-6">
              <input type="hidden" name="loginType" value="author" />
              
              <div>
                <Label htmlFor="author-username">Username or Email</Label>
                <Input
                  id="author-username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="mt-1"
                  placeholder="Enter your username or email"
                />
              </div>
              
              <div>
                <Label htmlFor="author-password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="author-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              
              {actionData?.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                  {actionData.error}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign In as Author'}
              </Button>
              
              <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                <p>Need access? Contact your administrator</p>
              </div>
            </Form>
          )}
          </div>
        </div>
        </div> {/* End gradient border */}
      </div>
    </div>
  );
}
