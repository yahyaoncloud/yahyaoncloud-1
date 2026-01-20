import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { 
  getPopularPosts, 
  getFeaturedPosts, 
  trackPostView, 
  trackPostLike 
} from '~/Services/content-access.server';

/**
 * GET /api/analytics - Get popular and featured posts
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'popular';
  const limit = parseInt(url.searchParams.get('limit') || '10');

  try {
    if (type === 'featured') {
      const posts = await getFeaturedPosts(limit);
      return json({ success: true, posts });
    }

    const posts = await getPopularPosts(limit);
    return json({ success: true, posts });

  } catch (error) {
    console.error('Analytics error:', error);
    return json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

/**
 * POST /api/analytics - Track post views and likes
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const postId = formData.get('postId') as string;
  const actionType = formData.get('action') as string;

  if (!postId) {
    return json({ success: false, error: 'Post ID required' }, { status: 400 });
  }

  try {
    if (actionType === 'view') {
      await trackPostView(postId);
      return json({ success: true, message: 'View tracked' });
    }

    if (actionType === 'like') {
      await trackPostLike(postId);
      return json({ success: true, message: 'Like recorded' });
    }

    return json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return json({ success: false, error: 'Failed to track' }, { status: 500 });
  }
}
