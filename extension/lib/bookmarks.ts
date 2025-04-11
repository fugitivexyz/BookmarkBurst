import { getSupabase } from './supabase';
import { Bookmark, InsertBookmark, Metadata } from './types';
import { getUser } from './auth';

// Save a bookmark to Supabase
export async function saveBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
  const user = await getUser();
  
  if (!user) {
    console.error('User not authenticated when attempting to save bookmark');
    throw new Error('User not authenticated');
  }
  
  const supabase = await getSupabase();
  if (!supabase) {
    console.error('Supabase client not initialized when attempting to save bookmark');
    throw new Error('Supabase client not initialized');
  }
  
  console.log('Saving bookmark for user:', user.id);
  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      ...bookmark,
      user_id: user.id,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving bookmark:', error.message, 'Details:', error.details, 'Hint:', error.hint, 'Code:', error.code);
    throw error;
  }
  
  console.log('Bookmark saved successfully:', data);
  return data;
}

// Get recent bookmarks
export async function getRecentBookmarks(limit: number = 5): Promise<Bookmark[]> {
  const user = await getUser();
  
  if (!user) {
    console.log('User not authenticated, returning empty bookmark list');
    return [];
  }
  
  const supabase = await getSupabase();
  if (!supabase) {
    console.log('Supabase client not initialized, returning empty bookmark list');
    return [];
  }
  
  console.log('Fetching recent bookmarks for user:', user.id);
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching recent bookmarks:', error.message, 'Details:', error.details, 'Hint:', error.hint, 'Code:', error.code);
    return [];
  }
  
  console.log('Fetched bookmarks:', data?.length || 0, 'items');
  return data || [];
}

// Check if a URL is already bookmarked
export async function isUrlBookmarked(url: string): Promise<boolean> {
  const user = await getUser();
  
  if (!user) {
    console.log('User not authenticated, URL bookmark check returning false');
    return false;
  }
  
  const supabase = await getSupabase();
  if (!supabase) {
    console.log('Supabase client not initialized, URL bookmark check returning false');
    return false;
  }
  
  console.log('Checking if URL is bookmarked for user:', user.id, 'URL:', url);
  const { count, error } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('url', url);
  
  if (error) {
    console.error('Error checking if URL is bookmarked:', error.message, 'Details:', error.details, 'Hint:', error.hint, 'Code:', error.code);
    return false;
  }
  
  const isBookmarked = count !== null && count > 0;
  console.log('URL bookmark check result:', isBookmarked);
  return isBookmarked;
}

// Prepare bookmark data from metadata
export function prepareBookmarkFromMetadata(metadata: Metadata): InsertBookmark {
  return {
    url: metadata.metadata?.url || '',
    title: metadata.title || 'Untitled Bookmark',
    description: metadata.description,
    favicon: metadata.favicon,
    tags: null,
    metadata: metadata.metadata || {}
  };
}

// Delete a bookmark
export async function deleteBookmark(bookmarkId: string): Promise<void> {
  const user = await getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const supabase = await getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)
    .eq('user_id', user.id);
  
  if (error) {
    throw error;
  }
}

// Update a bookmark
export async function updateBookmark(bookmarkId: string, updates: Partial<InsertBookmark>): Promise<Bookmark> {
  const user = await getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const supabase = await getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  const { data, error } = await supabase
    .from('bookmarks')
    .update(updates)
    .eq('id', bookmarkId)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
} 