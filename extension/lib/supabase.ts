import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import { getSession } from './auth';

// Create a Supabase client
export async function getSupabaseClient() {
  try {
    // Create a Supabase client with the anonymous key
    const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Try to get the current session
    const session = await getSession();
    
    // If we have a session, set it on the client
    if (session) {
      console.log('Setting existing session on Supabase client');
      const { error } = await client.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
      
      if (error) {
        console.error('Error setting session on Supabase client:', error.message);
      }
    }
    
    return client;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
}

// Get lazy-loaded Supabase client
let supabaseClientPromise: Promise<any> | null = null;

// We should not cache the client anymore since we need a fresh session each time
export function getSupabase() {
  // Clear previous client if any
  supabaseClientPromise = null;
  // Get a fresh client with the latest session
  supabaseClientPromise = getSupabaseClient();
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