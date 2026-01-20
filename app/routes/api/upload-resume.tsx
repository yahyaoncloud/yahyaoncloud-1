// API endpoint for resume PDF upload to Supabase
import { json, type ActionFunction } from "@remix-run/node";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = `https://${process.env.SUPABASE_ID}.supabase.co` || '';
const supabaseKey = process.env.SUPABASE_ANON || '';

// Only create client if env vars are set
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const action: ActionFunction = async ({ request }) => {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return json({ 
        success: false, 
        message: "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file." 
      });
    }
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return json({ success: false, message: "No file provided" });
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      return json({ success: false, message: "Only PDF files are allowed" });
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return json({ success: false, message: "File size must be less than 5MB" });
    }
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      return json({ success: false, message: error.message });
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);
    
    return json({ 
      success: true, 
      url: publicUrl,
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
