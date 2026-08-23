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
  const updatedTime = new Date().toISOString();

  const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Yahya</title>
  <subtitle>Technical writing on cloud infrastructure, distributed systems, and reliability engineering.</subtitle>
  <link href="${baseUrl}/atom.xml" rel="self"/>
  <link href="${baseUrl}/blog"/>
  <id>${baseUrl}/blog</id>
  <updated>${updatedTime}</updated>
  <author>
    <name>Yahya</name>
    <email>hello@yahyaoncloud.com</email>
  </author>
  ${posts
    .map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const published = new Date(post.createdAt || post.date || Date.now()).toISOString();
      return `
  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${postUrl}"/>
    <id>${postUrl}</id>
    <published>${published}</published>
    <updated>${published}</updated>
    <summary type="html"><![CDATA[${post.excerpt || ""}]]></summary>
    <content type="html"><![CDATA[${post.content || ""}]]></content>
  </entry>`;
    })
    .join("")}
</feed>`;

  return new Response(atom.trim(), {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "x-content-type-options": "nosniff",
      "Cache-Control": "public, max-age=3600, s-maxage=18000",
    },
  });
}
