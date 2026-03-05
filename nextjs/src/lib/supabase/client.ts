import { createBrowserClient as _createBrowserClient } from '@supabase/ssr';
import { ClientType, SassClient } from '@/lib/supabase/unified';
import { Database } from '@/lib/types';

// Re-export createBrowserClient for compatibility
export { _createBrowserClient as createBrowserClient };

export function createSPAClient() {
  return _createBrowserClient<Database, 'public', Database['public']>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function createSPASassClient() {
  const client = createSPAClient();
  // This must be some bug that SupabaseClient is not properly recognized, so must be ignored

  return new SassClient(client as any, ClientType.SPA);
}

export async function createSPASassClientAuthenticated() {
  const client = createSPAClient();
  const user = await client.auth.getSession();
  if (!user.data || !user.data.session) {
    window.location.href = '/auth/login';
  }
  // This must be some bug that SupabaseClient is not properly recognized, so must be ignored

  return new SassClient(client as any, ClientType.SPA);
}
