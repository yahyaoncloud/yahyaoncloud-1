// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const routes = (defineRoutes: any) => {
  return defineRoutes((route: any) => {
    // Public Routes (Layout: public/layout.tsx)
    route("/", "routes/public/layout.tsx", () => {
      route("", "routes/public/_index.tsx", { index: true });
      route("blog", "routes/public/blog.tsx");
      route("blog/:slug", "routes/public/blog.$slug.tsx");
      route("projects", "routes/public/projects.tsx");
      route("projects/:slug", "routes/public/projects.$slug.tsx");
      route("work", "routes/public/projects.tsx", { id: "public-work-alias" });
      route("work/:slug", "routes/public/projects.$slug.tsx", { id: "public-work-slug-alias" });
      route("research", "routes/public/research.tsx");
      route("guestbook", "routes/public/guestbook.tsx");
      route("about", "routes/public/_index.tsx", { id: "public-about-alias" });
      
      // Policies
      route("privacy-policy", "routes/public/privacy-policy.tsx");
      route("terms-and-conditions", "routes/public/terms-and-conditions.tsx");
    });

    // Admin Routes (Layout: admin/layout.tsx)
    route("admin", "routes/admin/layout.tsx", () => {
      route("", "routes/admin/dashboard.tsx", { index: true });
      route("dashboard", "routes/admin/dashboard.tsx", { id: "admin-dashboard-alias" });
      
      // Content Management (Blog Posts, Projects, Research, Featured, Taxonomies)
      route("posts", "routes/admin/posts.tsx");
      route("post/create", "routes/admin/post.create.tsx");
      route("post/edit/:slug", "routes/admin/post.edit.$slug.tsx");
      route("projects", "routes/admin/projects.tsx");
      route("projects/create", "routes/admin/projects.create.tsx");
      route("projects/edit/:slug", "routes/admin/projects.edit.$slug.tsx");
      route("research", "routes/admin/research.tsx");
      route("research/create", "routes/admin/research.create.tsx");
      route("research/edit/:slug", "routes/admin/research.edit.$slug.tsx");
      route("featured-articles", "routes/admin/featured-articles.tsx");
      route("categories", "routes/admin/categories.tsx");
      route("tags", "routes/admin/tags.tsx");
      
      // Pages / Sections
      route("about", "routes/admin/about.tsx");
      route("portfolio", "routes/admin/portfolio.tsx");
      route("guestbook", "routes/admin/guestbook.tsx");
      route("messages", "routes/admin/messages.tsx");
      route("linktree", "routes/admin/linktree.tsx");
      route("homepage-cards", "routes/admin/homepage-cards.tsx");
      route("announcements", "routes/admin/announcements.tsx");
      route("media", "routes/admin/media.tsx");
      route("assets", "routes/admin/assets.tsx");
      
      // Settings
      route("settings", "routes/admin/settings.tsx");
      route("site-settings", "routes/admin/site-settings.tsx");
      route("blog-settings", "routes/admin/blog-settings.tsx");
      route("logout", "routes/admin/logout.tsx");
    });

    // Auth & Login (Root Level / Layoutless)
    route("login", "routes/auth/login.tsx");
    route("auth/login", "routes/auth/login.tsx", { id: "auth-login-alias" });
    route("auth/portal", "routes/auth/login.tsx", { id: "auth-portal-alias" });
    
    // API Routes are Resource Routes (no layout)
    route("api/upload-image", "routes/api/upload-image.tsx");
    route("admin/api/upload", "routes/admin/api.upload.tsx");
    route("api/upload-resume", "routes/api/upload-resume.tsx");
    route("api/analytics", "routes/api/analytics.tsx");
    route("api/auth", "routes/api/auth.ts"); 
    route("api/logout", "routes/api/logout.ts"); 
    route("api/track", "routes/api/track.ts");
    route("api/media", "routes/api/media.tsx");

    // Auth Providers
    route("auth/:provider", "routes/auth/$provider.tsx");
    route("auth/sso/:provider", "routes/auth/sso.$provider.tsx");
    route("auth/callback", "routes/auth/callback.tsx");
    route("auth/logout", "routes/auth/logout.tsx");
    route("auth/verify-auth", "routes/auth/verify-auth.tsx");

    // Utilities & Helper Routes
    route("me/:shortCode", "routes/helpers/me.$shortCode.tsx");
    route("resources/download/resume/:id", "routes/helpers/resources.download.resume.$id.tsx");
    route("resume", "routes/helpers/resume.tsx");
    route("links", "routes/helpers/links.tsx");
    route("qr/:qrId", "routes/helpers/qr.$qrId.tsx");
    
    // Feeds & SEO XML
    route("rss.xml", "routes/helpers/rss[.]xml.ts");
    route("atom.xml", "routes/helpers/atom[.]xml.ts");
    route("sitemap.xml", "routes/helpers/sitemap[.]xml.ts");
    
    // 404 Not Found
    route("*", "routes/helpers/404.tsx");
  });
};
