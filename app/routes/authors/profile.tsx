import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation } from '@remix-run/react';
import { requireAuthor } from '~/utils/author-auth.server';
import { updateAuthor, getAuthorById } from '~/Services/author-management.server';
import { prisma } from '~/utils/prisma.server';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { useEffect } from 'react';
import { toast } from 'sonner';

export async function loader({ request }: LoaderFunctionArgs) {
  const author = await requireAuthor(request);
  
  // Get full author details from DB
  const authorDetails = await prisma.author.findUnique({
    where: { authorId: author.authorId },
  });
  
  return json({ author: authorDetails });
}

export async function action({ request }: ActionFunctionArgs) {
  const author = await requireAuthor(request);
  const formData = await request.formData();
  
  const authorName = formData.get('authorName') as string;
  const email = formData.get('email') as string;
  const authorProfession = formData.get('authorProfession') as string;
  const description = formData.get('description') as string;
  const linkedin = formData.get('linkedin') as string;
  const github = formData.get('github') as string;
  const twitter = formData.get('twitter') as string;
  const website = formData.get('website') as string;
  
  // Get the author's DB id
  const authorRecord = await prisma.author.findUnique({
    where: { authorId: author.authorId },
  });
  
  if (!authorRecord) {
    return json({ success: false, error: 'Author not found' }, { status: 404 });
  }
  
  try {
    await updateAuthor(authorRecord.id, {
      authorName,
      email,
      authorProfession,
      description,
      linkedin,
      github,
      twitter,
      website,
    });
    
    return json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    return json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}

export default function AuthorProfile() {
  const { author } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (actionData?.success && 'message' in actionData) {
      toast.success(actionData.message);
    }
    if (actionData && 'error' in actionData && actionData.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">My Profile</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Manage your public profile information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your details here. This information will be displayed publicly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authorName">Full Name *</Label>
                <Input
                  id="authorName"
                  name="authorName"
                  defaultValue={author?.authorName || ''}
                  required
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={author?.email || ''}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorProfession">Profession</Label>
                <Input
                  id="authorProfession"
                  name="authorProfession"
                  defaultValue={author?.authorProfession || ''}
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={author?.website || ''}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Bio</Label>
              <textarea
                id="description"
                name="description"
                defaultValue={author?.description || ''}
                placeholder="A short bio about yourself..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h3 className="font-medium mb-4">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    defaultValue={author?.linkedin || ''}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    name="github"
                    defaultValue={author?.github || ''}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    defaultValue={author?.twitter || ''}
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
