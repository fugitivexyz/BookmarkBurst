import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Initialize Supabase client with correct site URL
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'bookmarkburst-auth',
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    // Set a default site URL for auth redirects
    headers: {
      'X-Site-URL': siteUrl,
    },
  },
});

export default supabase;

export type SupabaseClient = typeof supabase; 