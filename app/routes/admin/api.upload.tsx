import { ActionFunctionArgs, json, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "@remix-run/node";
import { requireAdmin } from "~/utils/admin-auth.server";
import { uploadImage } from "~/utils/cloudinary.server";

export async function action({ request }: ActionFunctionArgs) {
  // 1. Ensure Admin
  const user = await requireAdmin(request);
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse FormData directly
  // Note: For this to work with files, the Remix adapter must support standard Request.formData() parsing of files
  // which is standard in Remix v2+ with Node.
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const slug = formData.get("slug") as string;
    const type = formData.get("type") as string || "gallery";

    if (!file || !slug) {
        return json({ error: "Missing file or slug" }, { status: 400 });
    }

    // 3. Construct Public ID
    const timestamp = Date.now();
    const cleanFileName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
    const publicId = type === 'cover' 
        ? `posts/${slug}/${slug}-cover` 
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
    return json({ error: "Upload failed: " + (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
