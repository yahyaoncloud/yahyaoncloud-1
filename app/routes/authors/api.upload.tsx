import { ActionFunctionArgs, json } from "@remix-run/node";
import { requireAuthor } from "~/utils/author-auth.server";
import { uploadImage } from "~/utils/cloudinary.server";

export async function action({ request }: ActionFunctionArgs) {
  // 1. Ensure Author is authenticated
  const author = await requireAuthor(request);
  if (!author) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const slug = formData.get("slug") as string;
    const type = formData.get("type") as string || "gallery";

    if (!file || !slug) {
      return json({ error: "Missing file or slug" }, { status: 400 });
    }

    // 2. Construct Public ID with author namespace
    const timestamp = Date.now();
    const cleanFileName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
    const publicId = type === 'cover' 
      ? `posts/${slug}/${slug}-cover` 
      : `posts/${slug}/gallery/${cleanFileName}-${timestamp}`;

    // 3. Upload to Cloudinary
    const result = await uploadImage(file, publicId);

    return json({ 
      success: true, 
      url: result.url, 
      publicId: result.publicId 
    });

  } catch (error) {
    console.error("Author Upload API Error:", error);
    return json({ error: "Upload failed: " + (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
