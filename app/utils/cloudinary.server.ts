import { v2 as cloudinary } from "cloudinary";
import matter from "gray-matter";
import { Readable } from "stream";
import { getRedis } from "./redis.server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Interface for Cloudinary upload result
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

// Interface for parsed Markdown data
interface ParsedMarkdown {
  slug: string;
  content: string;
  frontmatter: {
    title?: string;
    categories?: string[];
    tags?: string[];
    status?: "draft" | "published";
    [key: string]: any;
  };
}

// Utility to convert File to Readable stream
function fileToStream(file: File): Readable {
  return Readable.from(Buffer.from(new Uint8Array(file.arrayBuffer())));
}

// Utility to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Client Stamp Upload
export async function uploadStampToCloudinary(file: File, clientName: string, serial: string): Promise<CloudinaryUploadResult> {
  const safeName = clientName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9-_]/g, "");
  const publicId = `${safeName}_${serial}_stamp`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const ext = file.name.split(".").pop() || "svg";

    const result = await cloudinary.uploader.upload(
      `data:image/${ext};base64,${base64}`,
      {
        folder: "",
        public_id: publicId,
        resource_type: "auto",
        overwrite: true,
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err) {
    console.error("Cloudinary upload failed for stamp:", err);
    throw new Error("Failed to upload stamp to Cloudinary");
  }
}

// Parse Markdown and Process Images
export async function parseMarkdownWithCloudinary(slug: string, markdownFile: File, galleryImages: File[] = []): Promise<ParsedMarkdown> {
  try {
    const markdownBuffer = Buffer.from(await markdownFile.arrayBuffer());
    const raw = markdownBuffer.toString("utf-8");
    const { content, data } = matter(raw);

    // Replace local image refs inside Markdown
    const imgRegex = /!\[.*?\]\((.*?)\)/g;
    let newContent = content;
    const uploadedImages: Map<string, string> = new Map();

    // Upload gallery images and map their filenames to Cloudinary URLs
    if (galleryImages.length > 0) {
      for (let i = 0; i < galleryImages.length; i++) {
        const img = galleryImages[i];
        const ext = img.name.split(".").pop();
        const publicId = `${slug}-gallery${i + 1}`;
        const uploaded = await uploadImage(img, `posts/${slug}/gallery/${publicId}`);
        uploadedImages.set(img.name, uploaded.url);
      }

      // Replace local image paths with Cloudinary URLs
      newContent = content.replace(imgRegex, (match, localPath) => {
        const fileName = localPath.split("/").pop() || "";
        const cloudinaryUrl = uploadedImages.get(fileName);
        if (cloudinaryUrl) {
          return match.replace(localPath, cloudinaryUrl);
        }
        console.warn(`Image not found in gallery: ${localPath}`);
        return match; // Skip if no matching image
      });
    }

    return {
      slug,
      frontmatter: data,
      content: newContent, // Content with Cloudinary URLs
    };
  } catch (error) {
    console.error("Error parsing Markdown with Cloudinary:", error);
    throw new Error(`Failed to parse Markdown for slug: ${slug}`);
  }
}

// Create: Upload Markdown file, cover image, and gallery images to Cloudinary
export async function uploadPostResources(
  slug: string,
  markdownFile: File,
  coverImage?: File,
  galleryImages: File[] = []
): Promise<{
  contentUrl: string;
  coverImageUrl: string;
  galleryUrls: string[];
  parsedMarkdown: ParsedMarkdown;
}> {
  try {
    // Parse Markdown and process images
    const parsedMarkdown = await parseMarkdownWithCloudinary(slug, markdownFile, galleryImages);

    // Upload Markdown file with updated content
    const markdownBuffer = Buffer.from(parsedMarkdown.content);
    const markdownBase64 = markdownBuffer.toString("base64");
    const markdownResult = await cloudinary.uploader.upload(
      `data:text/markdown;base64,${markdownBase64}`,
      {
        folder: `posts/${slug}`,
        public_id: `${slug}-index`,
        resource_type: "raw",
        overwrite: true,
      }
    );

    // Upload cover image
    let coverImageUrl = "/default-cover.jpg";
    if (coverImage && coverImage.size > 0) {
      const uploaded = await uploadImage(coverImage, `posts/${slug}/${slug}-cover-image`);
      coverImageUrl = uploaded.url;
    }

    // Upload gallery images (already uploaded in parseMarkdownWithCloudinary)
    const galleryUrls: string[] = [];
    if (galleryImages.length > 0) {
      for (let i = 0; i < galleryImages.length; i++) {
        const publicId = `${slug}-gallery-${i + 1}`;
        const url = (await uploadImage(galleryImages[i], `posts/${slug}/gallery/${publicId}`)).url;
        galleryUrls.push(url);
      }
    }

    return {
      contentUrl: markdownResult.secure_url,
      coverImageUrl,
      galleryUrls,
      parsedMarkdown,
    };
  } catch (error) {
    console.error("Error uploading post resources:", error);
    throw new Error("Failed to upload post resources to Cloudinary");
  }
}

// Read: Retrieve resource URLs or metadata from Cloudinary
export async function getPostResources(slug: string): Promise<{
  contentUrl?: string;
  coverImageUrl?: string;
  galleryUrls?: string[];
}> {
  try {
    const result = await cloudinary.api.resources({
      resource_type: "raw",
      prefix: `posts/${slug}`,
      max_results: 100,
    });

    let contentUrl: string | undefined;
    let coverImageUrl: string | undefined;
    const galleryUrls: string[] = [];

    for (const resource of result.resources) {
      if (resource.public_id === `posts/${slug}/${slug}-index`) {
        contentUrl = resource.secure_url;
      } else if (resource.public_id === `posts/${slug}/${slug}-cover-image`) {
        coverImageUrl = resource.secure_url;
      } else if (resource.public_id.startsWith(`posts/${slug}/gallery/`)) {
        galleryUrls.push(resource.secure_url);
      }
    }

    return {
      contentUrl,
      coverImageUrl,
      galleryUrls: galleryUrls.sort((a, b) => {
        const indexA = parseInt(a.match(/gallery-(\d+)/)?.[1] || "0");
        const indexB = parseInt(b.match(/gallery-(\d+)/)?.[1] || "0");
        return indexA - indexB;
      }),
    };
  } catch (error) {
    console.error("Error retrieving post resources:", error);
    throw new Error("Failed to retrieve post resources from Cloudinary");
  }
}

// Read: Retrieve raw Markdown content from Cloudinary
export async function getMarkdownContent(slug: string, publicId?: string): Promise<string> {
  try {
    const redis = await getRedis();
    const cacheKey = `markdown:${slug}:${publicId || slug}`;
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    const path = publicId || `posts/${slug}/${slug}-index`;
    const response = await fetch(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Markdown content for ${path}`);
    }
    const content = await response.text();
    await redis.set(cacheKey, content, 'EX', 3600); // Cache for 1 hour
    return content;
  } catch (error) {
    console.error(`Error fetching Markdown content for slug ${slug}:`, error);
    throw new Error("Failed to fetch Markdown content from Cloudinary");
  }
}
// Update: Update Markdown file, cover image, or gallery images
export async function updatePostResources(
  slug: string,
  markdownFile?: File,
  coverImage?: File,
  galleryImages: File[] = [],
  deleteGalleryImages: string[] = []
): Promise<{
  contentUrl?: string;
  coverImageUrl?: string;
  galleryUrls: string[];
}> {
  try {
    let contentUrl: string | undefined;
    let coverImageUrl: string | undefined;
    const galleryUrls: string[] = [];

    // Get existing resources to preserve unchanged ones
    const existingResources = await getPostResources(slug);

    // Update Markdown file
    if (markdownFile && markdownFile.size > 0) {
      const parsedMarkdown = await parseMarkdownWithCloudinary(slug, markdownFile, galleryImages);
      const markdownBuffer = Buffer.from(parsedMarkdown.content);
      const markdownResult = await cloudinary.uploader.upload(
        `data:text/markdown;base64,${markdownBuffer.toString("base64")}`,
        {
          folder: `posts/${slug}`,
          public_id: `${slug}-index`,
          resource_type: "raw",
          overwrite: true,
        }
      );
      contentUrl = markdownResult.secure_url;
    } else {
      contentUrl = existingResources.contentUrl;
    }

    // Update cover image
    if (coverImage && coverImage.size > 0) {
      const uploaded = await uploadImage(coverImage, `posts/${slug}/${slug}-cover-image`);
      coverImageUrl = uploaded.url;
    } else {
      coverImageUrl = existingResources.coverImageUrl;
    }

    // Handle gallery images
    if (galleryImages.length > 0) {
      for (let i = 0; i < galleryImages.length; i++) {
        const publicId = `${slug}-gallery-${i + 1}`;
        const uploaded = await uploadImage(galleryImages[i], `posts/${slug}/gallery/${publicId}`);
        galleryUrls.push(uploaded.url);
      }
    } else {
      if (existingResources.galleryUrls) {
        galleryUrls.push(...existingResources.galleryUrls.filter(url => {
          const publicId = url.match(/\/posts\/[^/]+\/gallery\/(.+)$/i)?.[1];
          return !deleteGalleryImages.includes(publicId || "");
        }));
      }
    }

    // Delete specified gallery images
    if (deleteGalleryImages.length > 0) {
      for (const publicId of deleteGalleryImages) {
        await cloudinary.uploader.destroy(`posts/${slug}/gallery/${publicId}`);
      }
    }

    return {
      contentUrl,
      coverImageUrl,
      galleryUrls: galleryUrls.sort((a, b) => {
        const indexA = parseInt(a.match(/gallery-(\d+)/)?.[1] || "0");
        const indexB = parseInt(b.match(/gallery-(\d+)/)?.[1] || "0");
        return indexA - indexB;
      }),
    };
  } catch (error) {
    console.error("Error updating post resources:", error);
    throw new Error("Failed to update post resources on Cloudinary");
  }
}

// Delete: Delete all resources for a post
export async function deletePostResources(slug: string): Promise<void> {
  try {
    await cloudinary.api.delete_resources_by_prefix(`posts/${slug}`, {
      resource_type: "raw",
    });
    await cloudinary.api.delete_resources_by_prefix(`posts/${slug}`, {
      resource_type: "image",
    });
    await cloudinary.api.delete_folder(`posts/${slug}`);
  } catch (error) {
    console.error("Error deleting post resources:", error);
    throw new Error("Failed to delete post resources from Cloudinary");
  }
}

// Upload a single image to Cloudinary
export async function uploadImage(file: File, publicId: string): Promise<CloudinaryUploadResult> {
  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const ext = file.name.split(".").pop() || "png";

    const result = await cloudinary.uploader.upload(
      `data:image/${ext};base64,${base64}`,
      {
        folder: "posts",
        public_id: publicId,
        overwrite: true,
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

// Export Cloudinary instance
export { cloudinary };