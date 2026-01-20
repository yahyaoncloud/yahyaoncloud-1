import { createClient } from '@supabase/supabase-js';

// Build Supabase URL from ID
const supabaseId = process.env.SUPABASE_ID;
const supabaseUrl = supabaseId ? `https://${supabaseId}.supabase.co` : null;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl) {
  console.warn('SUPABASE_ID is not set - Supabase features will be disabled');
}
if (!supabaseServiceRole) {
  console.warn('SUPABASE_SERVICE_ROLE is not set - Supabase features will be disabled');
}

// Create Supabase admin client (server-side only)
export const supabaseAdmin = supabaseUrl && supabaseServiceRole
  ? createClient(supabaseUrl, supabaseServiceRole)
  : null;

// Helper to create bucket if it doesn't exist
async function ensureBucketExists(bucket: string) {
  if (!supabaseAdmin) return;
  
  // Try to create the bucket
  const { error } = await supabaseAdmin.storage.createBucket(bucket, {
    public: true, // Default to public for this app
    fileSizeLimit: 5242880, // 5MB limit
  });

  if (error) {
    // Ignore error if bucket already exists (some Supabase versions might return error code)
    if (!error.message.includes('already exists')) {
      console.warn(`Failed to create bucket ${bucket}:`, error.message);
    }
  }
}

export async function uploadToSupabase(
  bucket: string,
  path: string,
  file: File | Blob
): Promise<{ url: string; error?: string }> {
  if (!supabaseAdmin) {
    return { url: '', error: 'Supabase not configured' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer as ArrayBufferLike);

    let { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true
      });

    // Handle "Bucket not found" error by trying to create it
    if (error && (error.message.includes('Bucket not found') || error.message.includes('The resource was not found'))) {
       console.log(`Bucket '${bucket}' not found. Attempting to create...`);
       await ensureBucketExists(bucket);
       
       // Retry upload
       const retry = await supabaseAdmin.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true
        });
        
       data = retry.data;
       error = retry.error;
    }

    if (error) {
      return { url: '', error: error.message };
    }

    // Manually construct public URL to ensure it is always public (SDK check might be flaky with admin client)
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;

    return { url: publicUrl };
  } catch (err) {
    console.error('Supabase upload error:', err);
    return { url: '', error: err instanceof Error ? err.message : 'Upload failed' };
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromSupabase(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Supabase delete error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
  }
}

/**
 * List files in a bucket path
 */
export async function listSupabaseFiles(bucket: string, path: string = '') {
  if (!supabaseAdmin) {
    return { files: [], error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(path);

    return { files: data || [], error: error?.message };
  } catch (err) {
    console.error('Supabase list error:', err);
    return { files: [], error: err instanceof Error ? err.message : 'List failed' };
  }
}

/**
 * Get public URL for a file
 */
export function getSupabasePublicUrl(bucket: string, path: string): string | null {
  if (!supabaseAdmin) {
    return null;
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}
