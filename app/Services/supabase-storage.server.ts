import matter from "gray-matter";
import { 
  supabaseAdmin, 
  uploadToSupabase, 
  deleteFromSupabase, 
  getSupabasePublicUrl, 
  listSupabaseFiles 
} from "~/utils/supabase.server";

export const BUCKET_BLOGS = "blog-content";
export const BUCKET_ASSETS = "portfolio-assets";
export const BUCKET_RESUMES = "resumes";

export interface BlogPostFile {
  slug: string;
  title: string;
  summary?: string;
  content: string;
  coverImage?: string;
  date: string;
  tags?: string[];
  categories?: string[];
  featured?: boolean;
  status?: "draft" | "published" | "archived";
  minuteRead?: number;
}

/**
 * Upload a raw buffer / string to Supabase Storage with automatic bucket creation
 */
export async function uploadBufferToSupabase(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string = "text/plain; charset=utf-8"
): Promise<{ url: string; error?: string }> {
  if (!supabaseAdmin) {
    return { url: "", error: "Supabase not configured" };
  }

  const supabaseId = process.env.SUPABASE_ID;
  const supabaseUrl = supabaseId ? `https://${supabaseId}.supabase.co` : null;

  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      if (error.message.includes("Bucket not found") || error.message.includes("not found")) {
        await supabaseAdmin.storage.createBucket(bucket, { public: true, fileSizeLimit: 52428800 });
        const retry = await supabaseAdmin.storage
          .from(bucket)
          .upload(path, buffer, { contentType, upsert: true });
        if (retry.error) return { url: "", error: retry.error.message };
      } else {
        return { url: "", error: error.message };
      }
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
    return { url: publicUrl };
  } catch (err) {
    return { url: "", error: err instanceof Error ? err.message : "Upload error" };
  }
}

/**
 * Save structured blog post to Supabase Storage
 * Structure: blogs/<slug>/post.md
 */
export async function saveBlogPostToSupabase(
  slug: string,
  post: BlogPostFile
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const frontmatterData = {
      title: post.title,
      slug: post.slug || slug,
      summary: post.summary || "",
      coverImage: post.coverImage || "",
      date: post.date || new Date().toISOString(),
      tags: post.tags || [],
      categories: post.categories || [],
      featured: post.featured || false,
      status: post.status || "published",
      minuteRead: post.minuteRead || Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200)),
    };

    const fileContent = matter.stringify(post.content || "", frontmatterData);
    const buffer = Buffer.from(fileContent, "utf-8");
    const filePath = `blogs/${slug}/post.md`;

    const { url, error } = await uploadBufferToSupabase(
      BUCKET_BLOGS,
      filePath,
      buffer,
      "text/markdown; charset=utf-8"
    );

    if (error) {
      console.error(`Failed to save blog to Supabase for ${slug}:`, error);
      return { success: false, error };
    }

    return { success: true, url };
  } catch (err) {
    console.error("saveBlogPostToSupabase error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}

/**
 * Read structured blog post from Supabase Storage
 */
export async function getBlogPostFromSupabase(
  slug: string
): Promise<BlogPostFile | null> {
  if (!supabaseAdmin) return null;

  try {
    const filePath = `blogs/${slug}/post.md`;
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_BLOGS)
      .download(filePath);

    if (error || !data) {
      return null;
    }

    const text = await data.text();
    const parsed = matter(text);

    return {
      slug,
      title: parsed.data.title || slug,
      summary: parsed.data.summary || "",
      content: parsed.content || "",
      coverImage: parsed.data.coverImage,
      date: parsed.data.date ? new Date(parsed.data.date).toISOString() : new Date().toISOString(),
      tags: parsed.data.tags || [],
      categories: parsed.data.categories || [],
      featured: Boolean(parsed.data.featured),
      status: parsed.data.status || "published",
      minuteRead: parsed.data.minuteRead || 1,
    };
  } catch (err) {
    console.warn(`Supabase getBlogPost notice for ${slug}:`, err);
    return null;
  }
}

/**
 * Upload an image or media asset embedded inside a blog post
 * Path: blogs/<slug>/media/<filename>
 */
export async function uploadBlogMediaToSupabase(
  slug: string,
  file: File
): Promise<{ url: string; error?: string }> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const path = `blogs/${slug}/media/${Date.now()}-${cleanName}`;
  return uploadToSupabase(BUCKET_BLOGS, path, file);
}

/**
 * Upload blog cover image directly to Supabase Storage
 * Path: blogs/<slug>/cover.<ext>
 */
export async function uploadBlogCoverToSupabase(
  slug: string,
  file: File
): Promise<{ url: string; error?: string }> {
  const ext = file.name.split(".").pop() || "webp";
  const path = `blogs/${slug}/cover.${ext}`;
  return uploadToSupabase(BUCKET_BLOGS, path, file);
}

/**
 * Delete a blog post and its associated media from Supabase Storage
 */
export async function deleteBlogPostFromSupabase(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAdmin) return { success: false, error: "Supabase not configured" };

  try {
    // List all files in the blog folder
    const blogFolder = `blogs/${slug}`;
    const { files } = await listSupabaseFiles(BUCKET_BLOGS, blogFolder);
    
    const pathsToDelete = [
      `${blogFolder}/post.md`,
      `${blogFolder}/cover.webp`,
      `${blogFolder}/cover.png`,
      `${blogFolder}/cover.jpg`,
      ...(files || []).map((f) => `${blogFolder}/${f.name}`),
    ];

    await supabaseAdmin.storage.from(BUCKET_BLOGS).remove(pathsToDelete);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Delete failed" };
  }
}

/**
 * Upload general media asset to Supabase Storage
 */
export async function uploadAssetToSupabase(
  folder: string,
  file: File
): Promise<{ url: string; error?: string }> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const path = `${folder}/${Date.now()}-${cleanName}`;
  return uploadToSupabase(BUCKET_ASSETS, path, file);
}
