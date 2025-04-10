import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// Create a Supabase client
export async function getSupabaseClient() {
  try {
    // Create and return the Supabase client with the credentials from config.ts
    return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
}

// Get lazy-loaded Supabase client
let supabaseClientPromise: Promise<any> | null = null;

export function getSupabase() {
  if (!supabaseClientPromise) {
    supabaseClientPromise = getSupabaseClient();
  }
  return supabaseClientPromise;
}

// Helper to check if credentials are configured - always returns true now
export async function areCredentialsConfigured(): Promise<boolean> {
  return true;
}

// Helper to save credentials - this is now a no-op since we're using credentials from config
export async function saveCredentials(url: string, key: string): Promise<void> {
  console.log('Using credentials from config.ts instead of the provided ones');
  return;
} 