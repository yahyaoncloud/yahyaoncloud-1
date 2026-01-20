import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { keepSupabaseAlive } from '~/utils/supabase-keepalive.server';

// Secret key to protect the endpoint
const CRON_SECRET = process.env.CRON_SECRET || '';

export async function loader({ request }: LoaderFunctionArgs) {
  // Verify the request is from authorized source
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');

  // Check if secret is configured and matches
  if (!CRON_SECRET) {
    return json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  if (secret !== CRON_SECRET) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await keepSupabaseAlive();

  return json(result, { status: result.success ? 200 : 500 });
}
