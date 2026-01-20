
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const routes = (defineRoutes: any) => {
  return defineRoutes((route) => {
    // Public Routes (Layout: public/layout.tsx)
    route("/", "routes/public/layout.tsx", () => {
      route("", "routes/public/_index.tsx", { index: true });
      route("about", "routes/public/about.tsx");
      route("contact", "routes/public/contact.tsx");
      // route("contact", "routes/public/contact.tsx");
      // route("resume", "routes/public/resume.tsx"); // Removed in favor of root redirect
      
      // Blog
      route("blog", "routes/public/blog.tsx");
      route("blog/post/:slug", "routes/public/blog_.post.$slug.tsx");
      route("blog/posts", "routes/public/blog_.posts.tsx");
      
      // Guestbook
      route("guestbook", "routes/public/guestbook.tsx");
      route("guestbook/twitter-info", "routes/public/guestbook_.twitter-info.tsx");
      
      // Policies
      route("privacy-policy", "routes/public/privacy-policy.tsx");
      route("terms-and-conditions", "routes/public/terms-and-conditions.tsx");
    });

    // Admin Routes (Layout: admin/layout.tsx)
    route("admin", "routes/admin/layout.tsx", () => {
      route("", "routes/admin/dashboard.tsx", { index: true });
      route("dashboard", "routes/admin/dashboard.tsx", { id: "admin-dashboard-alias" });
      
      // Business Card
      route("business-card", "routes/admin/business-card.tsx");
      
      // Content Management
      route("posts", "routes/admin/posts.tsx");
      route("post/create", "routes/admin/post.create.tsx");
      route("post/edit/:slug", "routes/admin/post.edit.$slug.tsx");
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
      route("assets", "routes/admin/assets.tsx"); // New PDF Assets Manager
      route("logout", "routes/admin/logout.tsx");
      // route("resume/editor", "routes/admin/resume.editor.tsx");
      // route("resume/qr", "routes/admin/resume.qr.tsx");
      // route("resume/view/:id", "routes/admin/resume.view.$id.tsx");
    });

    // Author Portal
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

    // Auth & API (Root Level / Layoutless)
    route("login", "routes/login.tsx"); // Unified login page
    
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
    // route("api/supabase-keepalive", "routes/api/supabase-keepalive.ts");

    // Auth Providers
    route("auth/:provider", "routes/auth/$provider.tsx");
    route("auth/sso/:provider", "routes/auth/sso.$provider.tsx"); // SSO OAuth flow
    route("auth/callback", "routes/auth/callback.tsx");
    route("auth/logout", "routes/auth/logout.tsx"); // Universal logout
    route("auth/verify-auth", "routes/auth/verify-auth.tsx");

    // Utilities
    route("me/:shortCode", "routes/me.$shortCode.tsx");
    route("resources/download/resume/:id", "routes/resources.download.resume.$id.tsx"); // Proxy download
    route("links", "routes/links.tsx"); // Permanent QR code URL for linktree
    route("resume", "routes/resume.tsx"); // Public resume viewer
    // route("resume/view/:id", "routes/resume.view.$id.tsx"); // Public resume view?
    
    // 404
    route("*", "routes/404.tsx");
  });
};
