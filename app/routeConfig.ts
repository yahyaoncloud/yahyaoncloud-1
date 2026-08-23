// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const routes = (defineRoutes: any) => {
  return defineRoutes((route) => {
    // Public Routes (Layout: public/layout.tsx)
    route("/", "routes/public/layout.tsx", () => {
      route("", "routes/public/_index.tsx", { index: true });
      route("blog", "routes/public/blog.tsx");
      route("blog/:slug", "routes/public/blog.$slug.tsx");
      route("projects", "routes/public/projects.tsx");
      route("projects/:slug", "routes/public/projects.$slug.tsx");
      route("research", "routes/public/research.tsx");
      route("contact", "routes/public/contact.tsx");
      route("about", "routes/public/_index.tsx", { id: "public-about-alias" });
      
      // Policies
      route("privacy-policy", "routes/public/privacy-policy.tsx");
      route("terms-and-conditions", "routes/public/terms-and-conditions.tsx");
    });

    // Admin Routes (Layout: admin/layout.tsx)
    route("admin", "routes/admin/layout.tsx", () => {
      route("", "routes/admin/dashboard.tsx", { index: true });
      route("dashboard", "routes/admin/dashboard.tsx", { id: "admin-dashboard-alias" });
      
      // Content Management (Blog Posts, Projects, Research)
      route("posts", "routes/admin/posts.tsx");
      route("post/create", "routes/admin/post.create.tsx");
      route("post/edit/:slug", "routes/admin/post.edit.$slug.tsx");
      route("projects", "routes/admin/projects.tsx");
      route("projects/create", "routes/admin/projects.create.tsx");
      route("projects/edit/:slug", "routes/admin/projects.edit.$slug.tsx");
      route("research", "routes/admin/research.tsx");
      route("research/create", "routes/admin/research.create.tsx");
      route("research/edit/:slug", "routes/admin/research.edit.$slug.tsx");
      
      route("categories", "routes/admin/categories.tsx");
      route("tags", "routes/admin/tags.tsx");
      route("featured-articles", "routes/admin/featured-articles.tsx");
      
      // Pages / Sections
      route("about", "routes/admin/about.tsx");
      route("portfolio", "routes/admin/portfolio.tsx");
      route("guestbook", "routes/admin/guestbook.tsx");
      route("messages", "routes/admin/messages.tsx");
      route("linktree", "routes/admin/linktree.tsx");
      route("homepage-cards", "routes/admin/homepage-cards.tsx");
      
      // Users & Settings
      route("users", "routes/admin/users.tsx");
      route("authors", "routes/admin/authors.tsx");
      route("authors/:id", "routes/admin/authors.$id.tsx");
      route("settings", "routes/admin/settings.tsx");
      route("site-settings", "routes/admin/site-settings.tsx");
      route("blog-settings", "routes/admin/blog-settings.tsx");
      route("announcements", "routes/admin/announcements.tsx");
      route("media", "routes/admin/media.tsx");
      
      // Resumes
      route("resumes", "routes/admin/resumes.tsx");
      route("assets", "routes/admin/assets.tsx");
      route("logout", "routes/admin/logout.tsx");
    });

    // Author Portal (Layout: authors/layout.tsx)
    route("authors", "routes/authors/layout.tsx", () => {
      route("", "routes/authors/dashboard.tsx", { index: true });
      route("dashboard", "routes/authors/dashboard.tsx", { id: "authors-dashboard-alias" });
      route("posts", "routes/authors/posts.tsx");
      route("post/create", "routes/authors/post.create.tsx");
      route("post/edit/:slug", "routes/authors/post.edit.$slug.tsx");
      route("assets", "routes/authors/assets.tsx");
      route("profile", "routes/authors/profile.tsx");
      route("api/upload", "routes/authors/api.upload.tsx");
      route("change-password", "routes/authors/change-password.tsx");
      route("logout", "routes/authors/logout.tsx");
    });

    // Auth Portal (Layout: auth/layout.tsx)
    route("login", "routes/auth/layout.tsx", () => {
      route("", "routes/login.tsx", { index: true });
    });
    route("auth", "routes/auth/layout.tsx", { id: "auth-portal-group" }, () => {
      route("login", "routes/login.tsx", { id: "auth-login-alias" });
      route("portal", "routes/login.tsx", { id: "auth-portal-alias" });
    });
    
    // API Routes are Resource Routes (no layout)
    route("api/upload-image", "routes/api/upload-image.tsx");
    route("admin/api/upload", "routes/admin/api.upload.tsx");
    route("api/upload-resume", "routes/api/upload-resume.tsx");
    route("api/analytics", "routes/api/analytics.tsx");
    route("api/auth", "routes/api/auth.ts"); 
    route("api/logout", "routes/api/logout.ts"); 
    route("api/track", "routes/api/track.ts");
    route("api/media", "routes/api/media.tsx");
    route("api/generate-business-card-pdf", "routes/api/generate-business-card-pdf.tsx");

    // Auth Providers
    route("auth/:provider", "routes/auth/$provider.tsx");
    route("auth/sso/:provider", "routes/auth/sso.$provider.tsx");
    route("auth/callback", "routes/auth/callback.tsx");
    route("auth/logout", "routes/auth/logout.tsx");
    route("auth/verify-auth", "routes/auth/verify-auth.tsx");

    // Utilities
    route("me/:shortCode", "routes/me.$shortCode.tsx");
    route("resources/download/resume/:id", "routes/resources.download.resume.$id.tsx");
    route("links", "routes/links.tsx");
    // Feeds & SEO XML
    route("rss.xml", "routes/rss[.]xml.ts");
    route("atom.xml", "routes/atom[.]xml.ts");
    route("sitemap.xml", "routes/sitemap[.]xml.ts");
    
    // 404
    route("*", "routes/404.tsx");
  });
};
