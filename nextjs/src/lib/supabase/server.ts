import { createServerClient as _createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ClientType, SassClient } from '@/lib/supabase/unified';
import { Database } from '@/lib/types';

// Re-export createServerClient for compatibility
export { _createServerClient as createServerClient };

// Create SSR client for Server Components and API routes
export async function createSSRClient() {
  const cookieStore = await cookies();

  return _createServerClient<Database, 'public', Database['public']>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function createSSRSassClient() {
  const client = await createSSRClient();
  // This must be some bug that SupabaseClient is not properly recognized, so must be ignored
  return new SassClient(client as any, ClientType.SERVER);
}
