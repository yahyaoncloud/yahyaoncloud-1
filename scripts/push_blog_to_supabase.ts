import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseId = process.env.SUPABASE_ID;
const supabaseUrl = process.env.SUPABASE_URL || (supabaseId ? `https://${supabaseId}.supabase.co` : "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON;

const BUCKET_BLOGS = "blog-content";
const BUCKET_ASSETS = "portfolio-assets";

interface BlogAsset {
  filename: string;
  localPath: string;
  remotePath: string;
  contentType: string;
  publicUrl?: string;
  uploaded?: boolean;
}

interface BlogMetadata {
  slug: string;
  title: string;
  summary: string;
  date: string;
  displayDate: string;
  author: string;
  tags: string[];
  categories: string[];
  minuteRead: number;
  featured: boolean;
  order: number;
  assets: Array<{
    filename: string;
    remotePath: string;
    url: string;
  }>;
  syncedAt: string;
}

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".md": "text/markdown; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

async function ensureBucket(supabase: any, bucketName: string) {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    const exists = buckets?.some((b: any) => b.name === bucketName);
    if (!exists) {
      console.log(`📦 Creating public bucket '${bucketName}'...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });
      if (createError && !createError.message.includes("already exists")) {
        console.warn(`Bucket creation notice: ${createError.message}`);
      }
    }
  } catch (err: any) {
    console.warn(`Notice inspecting/creating bucket '${bucketName}':`, err.message || err);
  }
}

async function main() {
  console.log("=================================================");
  console.log("  🚀 Supabase Blog & Structured Assets Publisher  ");
  console.log("=================================================\n");

  console.log(`Supabase ID:  ${supabaseId || "Not set"}`);
  console.log(`Supabase URL: ${supabaseUrl || "Not set"}`);
  console.log(`Auth Key:     ${supabaseKey ? "Configured (Present)" : "Missing"}\n`);

  let supabase: any = null;
  let remoteAvailable = false;

  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    // Test connectivity
    try {
      const { error } = await supabase.storage.listBuckets();
      if (!error) {
        remoteAvailable = true;
        console.log(" Connected successfully to Supabase Storage endpoint.\n");
      } else {
        console.warn("⚠️  Supabase storage endpoint returned:", error.message);
      }
    } catch (connErr: any) {
      console.warn("⚠️  Supabase storage unreachable:", connErr.message || connErr);
      if (connErr.message?.includes("ENOTFOUND") || connErr.cause?.code === "ENOTFOUND") {
        console.warn(`
ℹ️  NOTE: Supabase free-tier project '${supabaseId}' appears paused.
   To restore remote syncing, log in to:
   https://supabase.com/dashboard/project/${supabaseId} and click 'Restore project'.
`);
      }
    }
  } else {
    console.warn("⚠️  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE. Running in structured staging mirror mode.\n");
  }

  if (remoteAvailable) {
    await ensureBucket(supabase, BUCKET_BLOGS);
    await ensureBucket(supabase, BUCKET_ASSETS);
  }

  const blogDir = path.resolve(process.cwd(), "content", "blog");
  if (!fs.existsSync(blogDir)) {
    console.error("No content/blog directory found!");
    process.exit(1);
  }

  const blogFiles = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
  console.log(`Found ${blogFiles.length} blog post(s) to process:\n`);

  const mirrorBaseDir = path.resolve(process.cwd(), "content", "storage_mirror", "blogs");
  fs.mkdirSync(mirrorBaseDir, { recursive: true });

  for (const file of blogFiles) {
    const filePath = path.join(blogDir, file);
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(rawContent);

    const slug = frontmatter.slug || file.replace(/\.md$/, "");
    console.log(`-------------------------------------------------`);
    console.log(`📝 Processing Post: "${frontmatter.title || slug}"`);
    console.log(`   Slug: ${slug}`);

    // Discover associated structured assets
    const assets: BlogAsset[] = [];
    
    // 1. Check local public/images/blog/ for assets matching this blog
    const blogAssetsDir = path.resolve(process.cwd(), "public", "images", "blog");
    if (fs.existsSync(blogAssetsDir)) {
      const assetFiles = fs.readdirSync(blogAssetsDir);
      for (const af of assetFiles) {
        // If image is referenced in the post content
        if (content.includes(af) || rawContent.includes(af)) {
          assets.push({
            filename: af,
            localPath: path.join(blogAssetsDir, af),
            remotePath: `blogs/${slug}/assets/${af}`,
            contentType: getMimeType(af),
          });
        }
      }
    }

    // 2. Also inspect HormuzWatch source directory if applicable
    if (slug.includes("concurrency_persistence") || slug.includes("hormuzwatch")) {
      const hwAssetsDir = "/home/tp24/SHARED/Projects/HormuzWatch/docs/articles/assets";
      if (fs.existsSync(hwAssetsDir)) {
        const hwAssets = fs.readdirSync(hwAssetsDir).filter(f => f.endsWith(".png") || f.endsWith(".jpg"));
        for (const ha of hwAssets) {
          if (!assets.some(a => a.filename === ha)) {
            assets.push({
              filename: ha,
              localPath: path.join(hwAssetsDir, ha),
              remotePath: `blogs/${slug}/assets/${ha}`,
              contentType: getMimeType(ha),
            });
          }
        }
      }
    }

    console.log(`   Discovered ${assets.length} structured asset file(s):`);
    assets.forEach(a => console.log(`    • ${a.filename} -> ${a.remotePath}`));

    // Prepare local mirror directory: content/storage_mirror/blogs/<slug>/
    const postMirrorDir = path.join(mirrorBaseDir, slug);
    const assetsMirrorDir = path.join(postMirrorDir, "assets");
    fs.mkdirSync(assetsMirrorDir, { recursive: true });

    // Copy assets to structured mirror
    for (const asset of assets) {
      const destPath = path.join(assetsMirrorDir, asset.filename);
      fs.copyFileSync(asset.localPath, destPath);
      asset.publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_BLOGS}/${asset.remotePath}`;
    }

    // Save markdown file in structured mirror
    fs.writeFileSync(path.join(postMirrorDir, "post.md"), rawContent, "utf-8");

    // Calculate reading time
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const minuteRead = Math.max(1, Math.ceil(wordCount / 200));

    // Compile comprehensive metadata
    const metadata: BlogMetadata = {
      slug,
      title: frontmatter.title || slug,
      summary: frontmatter.summary || "",
      date: frontmatter.date ? String(frontmatter.date) : new Date().toISOString(),
      displayDate: frontmatter.displayDate || "",
      author: frontmatter.author || "@yahyaoncloud",
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      categories: Array.isArray(frontmatter.categories) ? frontmatter.categories : [],
      minuteRead,
      featured: Boolean(frontmatter.featured),
      order: Number(frontmatter.order) || 99,
      assets: assets.map(a => ({
        filename: a.filename,
        remotePath: a.remotePath,
        url: a.publicUrl || `/images/blog/${a.filename}`,
      })),
      syncedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(postMirrorDir, "metadata.json"),
      JSON.stringify(metadata, null, 2),
      "utf-8"
    );
    console.log(`   Structured local mirror staged at: content/storage_mirror/blogs/${slug}/`);

    // Upload to Supabase if connected
    if (remoteAvailable && supabase) {
      console.log(`   Uploading to Supabase bucket '${BUCKET_BLOGS}'...`);

      // 1. Upload assets
      for (const asset of assets) {
        const fileBuffer = fs.readFileSync(asset.localPath);
        const { error } = await supabase.storage
          .from(BUCKET_BLOGS)
          .upload(asset.remotePath, fileBuffer, {
            contentType: asset.contentType,
            upsert: true,
          });

        if (error) {
          console.error(`   ❌ Failed uploading asset ${asset.filename}:`, error.message);
        } else {
          console.log(`   Uploaded asset: ${asset.remotePath}`);
        }
      }

      // 2. Upload post.md
      const postBuffer = Buffer.from(rawContent, "utf-8");
      const postRemotePath = `blogs/${slug}/post.md`;
      const { error: postErr } = await supabase.storage
        .from(BUCKET_BLOGS)
        .upload(postRemotePath, postBuffer, {
          contentType: "text/markdown; charset=utf-8",
          upsert: true,
        });
      if (postErr) {
        console.error(`   ❌ Failed uploading ${postRemotePath}:`, postErr.message);
      } else {
        console.log(`   Uploaded post: ${postRemotePath}`);
      }

      // 3. Upload metadata.json
      const metaBuffer = Buffer.from(JSON.stringify(metadata, null, 2), "utf-8");
      const metaRemotePath = `blogs/${slug}/metadata.json`;
      const { error: metaErr } = await supabase.storage
        .from(BUCKET_BLOGS)
        .upload(metaRemotePath, metaBuffer, {
          contentType: "application/json; charset=utf-8",
          upsert: true,
        });
      if (metaErr) {
        console.error(`   ❌ Failed uploading ${metaRemotePath}:`, metaErr.message);
      } else {
        console.log(`   Uploaded metadata: ${metaRemotePath}`);
      }
    }
  }

  console.log("\n=================================================");
  console.log("  🏁 Blog & Structured Assets Staging Completed   ");
  console.log("=================================================");
  console.log(`Storage Mirror Location: content/storage_mirror/blogs/`);
  console.log(`Supabase Remote Status:  ${remoteAvailable ? "Active & Uploaded" : "Staged locally (Ready for Sync)"}`);
}

main().catch(console.error);
