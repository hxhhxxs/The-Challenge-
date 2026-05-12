import { createClient } from '@supabase/supabase-js';

const fallbackSupabaseUrl = 'https://zolzkdjcjrmuzlxdeyrl.supabase.co';
const fallbackSupabaseAnonKey = 'sb_publishable_l3z5TwMxS6BVWGRa325vng_OYZqwGkv';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackSupabaseUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackSupabaseAnonKey;

export function hasSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function createSupabaseBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
