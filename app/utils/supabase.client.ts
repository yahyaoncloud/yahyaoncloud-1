import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client for client-side usage
 * Uses window.ENV for environment variables
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  // Get environment variables from window.ENV (set in root.tsx)
  const supabaseId = (window as any).ENV?.SUPABASE_ID;
  const supabaseAnonKey = (window as any).ENV?.SUPABASE_ANON;

  if (!supabaseId || !supabaseAnonKey) {
    console.warn('Supabase client environment variables not set');
    return null;
  }

  const supabaseUrl = `https://${supabaseId}.supabase.co`;
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

/**
 * Get public URL for a file in storage
 */
export function getPublicUrl(bucket: string, path: string): string | null {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data: { publicUrl } } = client.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}
