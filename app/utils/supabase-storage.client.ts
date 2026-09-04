// Supabase storage utility for file uploads
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getSupabaseConfig(): { url: string; key: string } {
  if (typeof window !== "undefined") {
    const env = (window as unknown as { ENV?: Record<string, string> })?.ENV;
    const url = env?.SUPABASE_URL || (env?.SUPABASE_ID ? `https://${env.SUPABASE_ID}.supabase.co` : "");
    const key = env?.SUPABASE_ANON || "";
    return { url, key };
  }
  const id = typeof process !== "undefined" && process?.env ? process.env.SUPABASE_ID || "" : "";
  const key = typeof process !== "undefined" && process?.env ? process.env.SUPABASE_ANON || "" : "";
  const url = id ? `https://${id}.supabase.co` : "";
  return { url, key };
}

let _supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_supabaseInstance) return _supabaseInstance;
  const { url, key } = getSupabaseConfig();
  if (url && key) {
    _supabaseInstance = createClient(url, key);
  }
  return _supabaseInstance;
}

export const supabase: SupabaseClient | null = typeof window !== "undefined" ? getSupabase() : null;

/**
 * Upload file to Supabase storage
 * @param file - File to upload
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @returns Public URL of uploaded file
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<string> {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase client is not initialized. Please ensure SUPABASE_ID and SUPABASE_ANON are configured.');
  }

  const { data, error } = await client.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = client.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}

/**
 * Delete file from Supabase storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase client is not initialized. Please ensure SUPABASE_ID and SUPABASE_ANON are configured.');
  }

  const { error } = await client.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get file size from File object
 * @param file - File object
 * @returns File size in bytes
 */
export function getFileSize(file: File): number {
  return file.size;
}

/**
 * Validate file type
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns true if valid, false otherwise
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSizeInMB - Maximum file size in MB
 * @returns true if valid, false otherwise
 */
export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}
