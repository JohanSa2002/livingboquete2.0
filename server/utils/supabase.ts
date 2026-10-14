import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

// Server-only client using the service_role key. RLS is enabled with no
// policies on every table, so this is the only way anything reads or writes
// content — the anon key has no access at all.
export function getSupabase(): SupabaseClient {
  if (!_client) {
    const config = useRuntimeConfig()
    if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    }
    _client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  }
  return _client
}
