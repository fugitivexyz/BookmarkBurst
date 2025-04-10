import { getSupabase } from './supabase';
import { Bookmark, InsertBookmark, Metadata } from './types';
import { getUser } from './auth';

// Save a bookmark to Supabase
export async function saveBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
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
    .insert({
      ...bookmark,
      user_id: user.id,
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Get recent bookmarks
export async function getRecentBookmarks(limit: number = 5): Promise<Bookmark[]> {
  const user = await getUser();
  
  if (!user) {
    return [];
  }
  
  const supabase = await getSupabase();
  if (!supabase) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching recent bookmarks:', error);
    return [];
  }
  
  return data || [];
}

// Check if a URL is already bookmarked
export async function isUrlBookmarked(url: string): Promise<boolean> {
  const user = await getUser();
  
  if (!user) {
    return false;
  }
  
  const supabase = await getSupabase();
  if (!supabase) {
    return false;
  }
  
  const { count, error } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('url', url);
  
  if (error) {
    console.error('Error checking if URL is bookmarked:', error);
    return false;
  }
  
  return count !== null && count > 0;
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