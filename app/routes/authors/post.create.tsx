import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { requireAuthor } from '~/utils/author-auth.server';
import { prisma } from '~/utils/prisma.server';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { marked } from 'marked';
import { proseClasses } from '~/styles/prose';

marked.setOptions({ gfm: true, breaks: true });

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuthor(request);
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const author = await requireAuthor(request);
  const formData = await request.formData();
  
  // Get author's MongoDB ObjectId
  const authorRecord = await prisma.author.findUnique({
    where: { authorId: author.authorId },
    select: { id: true }
  });
  
  if (!authorRecord) {
    return json({ success: false, error: 'Author not found' }, { status: 404 });
  }
  
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const content = formData.get('content') as string;
  const summary = formData.get('summary') as string;
  const coverImage = formData.get('coverImage') as string;
  const status = formData.get('status') as string || 'draft';

  if (!title || !content) {
    return json({ success: false, error: 'Title and Content are required' }, { status: 400 });
  }

  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    // Use Prisma to create post for consistency with author dashboard queries
    await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        content,
        summary: summary || '',
        coverImage: coverImage || '/default-cover.jpg',
        status,
        authorId: authorRecord.id,
        date: new Date(),
      }
    });

    return redirect('/authors/posts');
  } catch (error) {
    console.error('Create post error:', error);
    return json({ success: false, error: error instanceof Error ? error.message : 'Failed to create post' }, { status: 500 });
  }
}

export default function AuthorPostCreate() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (actionData && 'error' in actionData && actionData.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [title, slug]);

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
            <h1 className="text-2xl font-bold">Create New Post</h1>
            <p className="text-zinc-500 text-sm">Write and publish your content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" onClick={() => setPreviewMode(!previewMode)}>
            <Eye size={16} className="mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
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
                placeholder="auto-generated-from-title"
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
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  <Save size={16} className="mr-2" />
                  {isSubmitting ? 'Saving...' : status === 'published' ? 'Publish' : 'Save Draft'}
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
          </div>
        </div>
      </Form>
    </div>
  );
}
