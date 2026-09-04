import { getSupabase } from './supabase-storage.client';

export { getSupabase, uploadFile, deleteFile, validateFileType, validateFileSize } from './supabase-storage.client';

/**
 * Get public URL for a file in Supabase storage
 */
export function getPublicUrl(bucket: string, path: string): string | null {
  const client = getSupabase();
  if (!client) return null;

  const { data: { publicUrl } } = client.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}

