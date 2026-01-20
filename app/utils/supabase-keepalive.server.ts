import { supabaseAdmin } from './supabase.server';

const KEEPALIVE_BUCKET = 'resumes';
const KEEPALIVE_FILE_PATH = 'keepalive/heartbeat.json';

/**
 * Keep Supabase free tier active by uploading and deleting a small file.
 * Call this function periodically (e.g., every 5 days via cron job).
 * 
 * Supabase free tier pauses after 7 days of inactivity.
 */
export async function keepSupabaseAlive(): Promise<{
  success: boolean;
  message: string;
  timestamp: string;
}> {
  const timestamp = new Date().toISOString();

  if (!supabaseAdmin) {
    return {
      success: false,
      message: 'Supabase not configured',
      timestamp
    };
  }

  try {
    // Create a small heartbeat file (~100 bytes)
    const heartbeatContent = JSON.stringify({
      message: 'Supabase keep-alive heartbeat',
      timestamp,
      project: 'yahyaoncloud'
    });

    const buffer = Buffer.from(heartbeatContent, 'utf-8');

    // Upload the file
    const { error: uploadError } = await supabaseAdmin.storage
      .from(KEEPALIVE_BUCKET)
      .upload(KEEPALIVE_FILE_PATH, buffer, {
        contentType: 'application/json',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Small delay to ensure upload is registered
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Delete the file
    const { error: deleteError } = await supabaseAdmin.storage
      .from(KEEPALIVE_BUCKET)
      .remove([KEEPALIVE_FILE_PATH]);

    if (deleteError) {
      // Log but don't fail - file will be overwritten next time
      console.warn(`Delete warning: ${deleteError.message}`);
    }

    console.log(`[Supabase Keep-Alive] Success at ${timestamp}`);

    return {
      success: true,
      message: 'Supabase keep-alive successful',
      timestamp
    };

  } catch (error) {
    console.error(`[Supabase Keep-Alive] Failed:`, error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    };
  }
}

/**
 * Check when the last keep-alive was performed.
 * Returns null if no keepalive file exists.
 */
export async function getLastKeepAlive(): Promise<string | null> {
  if (!supabaseAdmin) {
    return null;
  }

  try {
    const { data } = await supabaseAdmin.storage
      .from(KEEPALIVE_BUCKET)
      .list('keepalive');

    if (data && data.length > 0) {
      return data[0].updated_at || data[0].created_at || null;
    }

    return null;
  } catch {
    return null;
  }
}
