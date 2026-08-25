import { type LoaderFunctionArgs } from "@remix-run/node";
import { getAllBlogPosts } from "~/Services/content.server";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("host") ??
    "yahyaoncloud.com";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const posts = await getAllBlogPosts();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Yahya</title>
    <link>${baseUrl}/blog</link>
    <description>Technical writing on cloud infrastructure, distributed systems, and reliability engineering.</description>
    <language>en-us</language>
    <generator>Remix &amp; Bun</generator>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map((post) => {
        const postUrl = `${baseUrl}/blog/${post.slug}`;
        const pubDate = new Date((post as any).createdAt || post.date || Date.now()).toUTCString();
        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${(post as any).excerpt || post.summary || (post as any).content || ""}]]></description>
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new Response(rss.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "x-content-type-options": "nosniff",
      "Cache-Control": "public, max-age=3600, s-maxage=18000",
    },
  });
}
