import { Post, Subscription, Purchase, type IPost, type ISubscription } from '../models';

/**
 * Check if a user can access a specific post based on their subscription and purchases
 */
export async function canUserAccessPost(
  userId: string | null,
  post: IPost
): Promise<{ canAccess: boolean; reason?: string }> {
  // Free content is always accessible
  if (post.pricing === 'free' && post.accessLevel === 'public') {
    return { canAccess: true };
  }

  // Non-logged in users can only access free public content
  if (!userId) {
    return { 
      canAccess: false, 
      reason: 'Please log in to access this content' 
    };
  }

  // Check if user has purchased this specific post
  const purchase = await Purchase.findOne({ userId, postId: post._id });
  if (purchase) {
    return { canAccess: true };
  }

  // Check user's subscription
  const subscription = await Subscription.findOne({ 
    userId, 
    status: 'active' 
  });

  if (!subscription) {
    // No subscription - can only access free content
    if (post.pricing === 'free') {
      return { canAccess: true };
    }
    return { 
      canAccess: false, 
      reason: 'Subscribe to access this content' 
    };
  }

  // Check subscription tier against content access level
  const tierHierarchy = { free: 0, premium: 1, exclusive: 2 };
  const userTier = tierHierarchy[subscription.tier] || 0;
  const requiredTier = tierHierarchy[post.accessLevel] || 0;

  if (userTier >= requiredTier) {
    return { canAccess: true };
  }

  return { 
    canAccess: false, 
    reason: `Upgrade to ${post.accessLevel} to access this content` 
  };
}

/**
 * Get user's subscription status
 */
export async function getUserSubscription(userId: string): Promise<ISubscription | null> {
  return await Subscription.findOne({ 
    userId, 
    status: 'active' 
  }).sort({ createdAt: -1 });
}

/**
 * Create or update user subscription
 */
export async function updateUserSubscription(
  userId: string,
  tier: 'free' | 'premium' | 'exclusive',
  paymentId?: string
): Promise<ISubscription> {
  // Cancel any existing active subscriptions
  await Subscription.updateMany(
    { userId, status: 'active' },
    { status: 'cancelled' }
  );

  // Create new subscription
  const subscription = new Subscription({
    userId,
    tier,
    status: 'active',
    startDate: new Date(),
    paymentId
  });

  await subscription.save();
  return subscription;
}

/**
 * Record a content purchase
 */
export async function recordPurchase(
  userId: string,
  postId: string,
  amount: number,
  paymentId: string
) {
  const purchase = new Purchase({
    userId,
    postId,
    amount,
    paymentId,
    purchasedAt: new Date()
  });

  await purchase.save();
  return purchase;
}

/**
 * Get user's purchased posts
 */
export async function getUserPurchases(userId: string) {
  return await Purchase.find({ userId })
    .populate('postId')
    .sort({ purchasedAt: -1 });
}

/**
 * Track post view
 */
export async function trackPostView(postId: string) {
  await Post.findByIdAndUpdate(postId, {
    $inc: { views: 1 }
  });
}

/**
 * Track post like
 */
export async function trackPostLike(postId: string) {
  await Post.findByIdAndUpdate(postId, {
    $inc: { likes: 1 }
  });
}

/**
 * Get popular posts
 */
export async function getPopularPosts(limit: number = 10) {
  return await Post.find({ status: 'published' })
    .sort({ views: -1, likes: -1 })
    .limit(limit)
    .select('title slug views likes coverImage summary');
}

/**
 * Get featured posts
 */
export async function getFeaturedPosts(limit: number = 5) {
  return await Post.find({ status: 'published', featured: true })
    .sort({ date: -1 })
    .limit(limit)
    .select('title slug coverImage summary date pricing');
}

/**
 * Get posts by access level for user
 */
export async function getAccessiblePosts(
  userId: string | null,
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit;

  // Get user subscription
  let userTier = 'free';
  if (userId) {
    const subscription = await getUserSubscription(userId);
    userTier = subscription?.tier || 'free';
  }

  // Build access filter
  const tierHierarchy = { free: ['public'], premium: ['public', 'premium'], exclusive: ['public', 'premium', 'exclusive'] };
  const accessibleLevels = tierHierarchy[userTier as keyof typeof tierHierarchy] || ['public'];

  const query = {
    status: 'published',
    $or: [
      { pricing: 'free', accessLevel: 'public' },
      { accessLevel: { $in: accessibleLevels } }
    ]
  };

  const [posts, total] = await Promise.all([
    Post.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug coverImage summary date pricing accessLevel views'),
    Post.countDocuments(query)
  ]);

  return {
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}
