import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { requireAuthor } from '~/utils/author-auth.server';
import { prisma } from '~/utils/prisma.server';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { marked } from 'marked';
import { proseClasses } from '~/styles/prose';

marked.setOptions({ gfm: true, breaks: true });

export async function loader({ request, params }: LoaderFunctionArgs) {
  const author = await requireAuthor(request);
  const { slug } = params;

  // Get author's MongoDB ObjectId
  const authorRecord = await prisma.author.findUnique({
    where: { authorId: author.authorId },
    select: { id: true }
  });

  if (!authorRecord) {
    throw new Response('Author not found', { status: 404 });
  }

  const post = await prisma.post.findFirst({
    where: { slug, authorId: authorRecord.id },
  });

  if (!post) {
    throw new Response('Post not found or unauthorized', { status: 404 });
  }

  return json({ post });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const author = await requireAuthor(request);
  const { slug } = params;
  const formData = await request.formData();
  const intent = formData.get('intent');

  // Get author's MongoDB ObjectId
  const authorRecord = await prisma.author.findUnique({
    where: { authorId: author.authorId },
    select: { id: true }
  });

  if (!authorRecord) {
    return json({ success: false, error: 'Author not found' }, { status: 404 });
  }

  // Verify ownership with MongoDB ObjectId
  const post = await prisma.post.findFirst({
    where: { slug, authorId: authorRecord.id },
  });

  if (!post) {
    return json({ success: false, error: 'Post not found or unauthorized' }, { status: 404 });
  }

  if (intent === 'delete') {
    await prisma.post.delete({ where: { id: post.id } });
    return redirect('/authors/posts');
  }

  const title = formData.get('title') as string;
  const newSlug = formData.get('slug') as string;
  const content = formData.get('content') as string;
  const summary = formData.get('summary') as string;
  const coverImage = formData.get('coverImage') as string;
  const status = formData.get('status') as string;

  if (!title || !content) {
    return json({ success: false, error: 'Title and Content are required' }, { status: 400 });
  }

  try {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        title,
        slug: newSlug || post.slug,
        content,
        summary,
        coverImage,
        status,
      },
    });

    return json({ success: true, message: 'Post updated successfully' });
  } catch (error) {
    console.error('Update post error:', error);
    return json({ success: false, error: 'Failed to update post' }, { status: 500 });
  }
}

export default function AuthorPostEdit() {
  const { post } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [content, setContent] = useState(post.content);
  const [summary, setSummary] = useState(post.summary || '');
  const [coverImage, setCoverImage] = useState(post.coverImage || '');
  const [status, setStatus] = useState(post.status);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (actionData?.success && 'message' in actionData) {
      toast.success(actionData.message);
    }
    if (actionData && 'error' in actionData && actionData.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/authors/posts">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Post</h1>
            <p className="text-zinc-500 text-sm">Update your content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" onClick={() => setPreviewMode(!previewMode)}>
            <Eye size={16} className="mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Form method="post" onSubmit={(e) => !confirm('Delete this post?') && e.preventDefault()}>
            <input type="hidden" name="intent" value="delete" />
            <Button variant="destructive" type="submit">
              <Trash2 size={16} className="mr-2" /> Delete
            </Button>
          </Form>
        </div>
      </div>

      <Form method="post" className="space-y-6">
        <input type="hidden" name="status" value={status} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-url-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content * (Markdown)</Label>
              {previewMode ? (
                <div
                  className={`border rounded-lg p-4 min-h-[300px] bg-white dark:bg-zinc-900 ${proseClasses}`}
                  dangerouslySetInnerHTML={{ __html: marked(content) }}
                />
              ) : (
                <Textarea
                  id="content"
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content in Markdown..."
                  className="min-h-[300px] font-mono"
                  required
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Publish</h3>

              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 bg-white dark:bg-zinc-950"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  <Save size={16} className="mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Summary</h3>
              <Textarea
                name="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief description for SEO..."
                className="min-h-[80px]"
              />
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Cover Image</h3>
              <Input
                name="coverImage"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {coverImage && (
                <img src={coverImage} alt="Cover preview" className="w-full h-32 object-cover rounded-md" />
              )}
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 text-xs text-zinc-500">
              <p><strong>Created:</strong> {new Date(post.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(post.updatedAt).toLocaleDateString()}</p>
              <p><strong>Views:</strong> {post.views || 0}</p>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
