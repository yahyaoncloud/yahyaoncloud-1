import { ActionFunctionArgs, json, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "@remix-run/node";
import { requireAdmin } from "~/utils/admin-auth.server";
import { uploadImage } from "~/utils/cloudinary.server";

export async function action({ request }: ActionFunctionArgs) {
  // 1. Ensure Admin
  await requireAdmin(request);

  // 2. Parse FormData
  // Use a memory upload handler (files are small enough usually, or specific cloudinary handler if preferred, 
  // but here we just need the File object to pass to our utility)
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 5_000_000, // 5MB
  });
  
  try {
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    
    const file = formData.get("file") as File;
    const slug = formData.get("slug") as string;
    const type = formData.get("type") as string || "gallery"; // 'cover' or 'gallery'

    if (!file || !slug) {
        return json({ error: "Missing file or slug" }, { status: 400 });
    }

    // 3. Construct Public ID
    // Standardize folder structure: posts/[slug]/[type]/[filename]
    // or posts/[slug]/gallery/[filename_timestamp]
    const timestamp = Date.now();
    const cleanFileName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
    const publicId = type === 'cover' 
        ? `posts/${slug}/${slug}-cover` // Fixed name for cover
        : `posts/${slug}/gallery/${cleanFileName}-${timestamp}`;

    // 4. Upload
    const result = await uploadImage(file, publicId);

    return json({ 
        success: true, 
        url: result.url, 
        publicId: result.publicId 
    });

  } catch (error) {
    console.error("Upload API Error:", error);
    return json({ error: "Upload failed" }, { status: 500 });
  }
}
