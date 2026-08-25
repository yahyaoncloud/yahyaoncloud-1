import { type LoaderFunctionArgs } from "@remix-run/node";
import { getAllBlogPosts, getAllProjects, getAllResearchPapers } from "~/Services/content.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("host") ??
    "yahyaoncloud.com";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const [posts, projects, papers] = await Promise.all([
    getAllBlogPosts(),
    getAllProjects(),
    getAllResearchPapers(),
  ]);

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/blog", priority: "0.9", changefreq: "weekly" },
    { url: "/projects", priority: "0.9", changefreq: "monthly" },
    { url: "/research", priority: "0.8", changefreq: "monthly" },
    { url: "/contact", priority: "0.7", changefreq: "monthly" },
    { url: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
    { url: "/terms-and-conditions", priority: "0.3", changefreq: "yearly" },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("")}
  ${posts
    .map(
      (post) => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date((post as any).createdAt || post.date || Date.now()).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("")}
  ${projects
    .map(
      (proj) => `
  <url>
    <loc>${baseUrl}/projects/${proj.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "x-content-type-options": "nosniff",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
