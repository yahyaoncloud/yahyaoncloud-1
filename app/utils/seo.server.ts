export interface ArticleJsonLdInput {
  title: string;
  summary?: string | null;
  coverImage?: string | null;
  date?: string | Date;
  updatedAt?: string | Date;
  slug: string;
  content?: string | null;
  minuteRead?: number;
}

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  image?: string;
  url?: string;
  type?: string;
}

/**
 * Generate meta tags array for Remix meta function
 */
export function generateMetaTags(seo: SEOData) {
  const tags = [
    { title: seo.title },
    { name: 'description', content: seo.description },
    { name: 'keywords', content: seo.keywords.join(', ') },
    
    // Open Graph
    { property: 'og:title', content: seo.title },
    { property: 'og:description', content: seo.description },
    { property: 'og:type', content: seo.type || 'website' },
  ];

  if (seo.image) {
    tags.push({ property: 'og:image', content: seo.image });
  }

  if (seo.url) {
    tags.push({ property: 'og:url', content: seo.url });
    tags.push({ rel: 'canonical', href: seo.url } as any);
  }

  // Twitter Card
  tags.push(
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seo.title },
    { name: 'twitter:description', content: seo.description }
  );

  if (seo.image) {
    tags.push({ name: 'twitter:image', content: seo.image });
  }

  // Article specific
  if (seo.author) {
    tags.push({ name: 'author', content: seo.author });
  }

  if (seo.publishedTime) {
    tags.push({ property: 'article:published_time', content: seo.publishedTime });
  }

  if (seo.modifiedTime) {
    tags.push({ property: 'article:modified_time', content: seo.modifiedTime });
  }

  return tags;
}

/**
 * Generate JSON-LD structured data for blog posts
 */
export function generateArticleJsonLd(post: ArticleJsonLdInput, authorName: string, siteUrl: string) {
  const publishedDate = post.date ? new Date(post.date).toISOString() : new Date().toISOString();
  const modifiedDate = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedDate;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary || '',
    image: post.coverImage || undefined,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: authorName
    },
    publisher: {
      '@type': 'Organization',
      name: 'YahyaOnCloud',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`
    },
    articleSection: 'Technology',
    wordCount: post.content?.split(/\s+/).length || 0,
    timeRequired: `PT${post.minuteRead || 5}M`
  };
}

/**
 * Generate JSON-LD for website/organization
 */
export function generateWebsiteJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'YahyaOnCloud',
    url: siteUrl,
    description: 'Tech knowledge sharing platform for IT professionals',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generate JSON-LD for person/author profile
 */
export function generatePersonJsonLd(
  name: string,
  siteUrl: string,
  socialLinks: { linkedin?: string; github?: string; twitter?: string }
) {
  const sameAs = [];
  if (socialLinks.linkedin) sameAs.push(socialLinks.linkedin);
  if (socialLinks.github) sameAs.push(socialLinks.github);
  if (socialLinks.twitter) sameAs.push(socialLinks.twitter);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: siteUrl,
    sameAs
  };
}

/**
 * Generate breadcrumb JSON-LD
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Render JSON-LD script tag
 */
export function renderJsonLd(data: object): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
