// API endpoint for resume PDF upload to Supabase (Server-side authenticated)
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { requireAdmin } from "~/utils/admin-auth.server";
import { uploadToSupabase } from "~/utils/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return json({ success: false, message: "No file provided" }, { status: 400 });
    }
    
    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return json({ success: false, message: "Only PDF files are allowed" }, { status: 400 });
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return json({ success: false, message: "File size must be less than 5MB" }, { status: 400 });
    }
    
    // Generate sanitized unique filename
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${cleanName}`;
    
    // Upload via server-side Supabase admin client
    const { url, error } = await uploadToSupabase('resumes', fileName, file);
    
    if (error || !url) {
      console.error('Supabase upload error:', error);
      return json({ success: false, message: error || "Upload failed" }, { status: 500 });
    }
    
    return json({ 
      success: true, 
      url,
      fileName: file.name,
      fileSize: file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    return json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Upload failed' 
    });
  }
};
