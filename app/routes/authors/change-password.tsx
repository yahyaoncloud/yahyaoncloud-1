import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { requireAuthor } from '~/utils/author-auth.server';
import { verifyPassword, validatePasswordStrength } from '~/utils/password.server';
import { updateAuthorPassword } from '~/Services/author-management.server';
import { prisma } from '~/utils/prisma.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const author = await requireAuthor(request);
  return json({ author });
}

export async function action({ request }: ActionFunctionArgs) {
  const author = await requireAuthor(request);
  const formData = await request.formData();
  
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  
  // Validate inputs
  if (!currentPassword || !newPassword || !confirmPassword) {
    return json({ error: 'All fields are required' }, { status: 400 });
  }
  
  if (newPassword !== confirmPassword) {
    return json({ error: 'New passwords do not match' }, { status: 400 });
  }
  
  // Validate password strength
  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    return json({ error: validation.errors.join(', ') }, { status: 400 });
  }
  
  // Get author details
  const authorDetails = await prisma.author.findUnique({
    where: { authorId: author.authorId }
  });
  
  if (!authorDetails) {
    return json({ error: 'Author not found' }, { status: 404 });
  }
  
  // Verify current password
  const isValid = await verifyPassword(currentPassword, authorDetails.password);
  if (!isValid) {
    return json({ error: 'Current password is incorrect' }, { status: 401 });
  }
  
  // Update password
  await updateAuthorPassword(authorDetails.id, newPassword, false);
  
  return redirect('/authors/dashboard');
}

export default function ChangePassword() {
  const { author } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const isSubmitting = navigation.state === 'submitting';
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Change Password</h1>
          {author.mustChangePassword && (
            <p className="text-amber-600 dark:text-amber-400 mt-2">
              You must change your password before continuing
            </p>
          )}
        </div>
        
        <Form method="post" className="space-y-6">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative mt-1">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                {showPasswords.current ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative mt-1">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                {showPasswords.new ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                {showPasswords.confirm ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          {actionData?.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {actionData.error}
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </Form>
      </div>
    </div>
  );
}
