import { getSupabase } from './supabase';
import { Bookmark, InsertBookmark, UpdateBookmark, Metadata } from './types';
import { getUser } from './auth';
import { addTagsToBookmark, updateBookmarkTags, getTagsForBookmark } from './tagService';

// Define input types similar to client
type InsertBookmarkInput = InsertBookmark & { tags?: string[] | null };
type UpdateBookmarkInput = UpdateBookmark & { tags?: string[] | null };

// DB types without tags
type InsertBookmarkDb = Omit<InsertBookmark, 'tags'>;
type UpdateBookmarkDb = Omit<UpdateBookmark, 'tags'>;

// Define BookmarkWithTags type
export type BookmarkWithTags = Bookmark & {
  fetchedTags?: string[];
};

// Save a bookmark to Supabase
export async function saveBookmark(bookmarkInput: InsertBookmarkInput): Promise<Bookmark> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');
  
  const supabase = await getSupabase();
  if (!supabase) throw new Error('Supabase client not initialized');
  
  const { tags, ...bookmarkData } = bookmarkInput;
  
  // 1. Insert bookmark - add user_id directly to the insert operation
  const { data: newBookmark, error: insertError } = await supabase
    .from('bookmarks')
    .insert({
      ...bookmarkData,
      user_id: user.id
    })
    .select()
    .single();
  
  if (insertError || !newBookmark) {
    console.error('Error saving bookmark:', insertError);
    throw insertError || new Error('Failed to save bookmark');
  }
  
  // 2. Add tags
  if (tags && tags.length > 0) {
    const tagsAdded = await addTagsToBookmark(parseInt(newBookmark.id), tags);
    if (!tagsAdded) {
      console.warn(`Bookmark ${newBookmark.id} saved, but failed to add tags.`);
    }
  }
  
  console.log('Bookmark saved successfully:', newBookmark);
  return newBookmark;
}

// Get recent bookmarks with tags
export async function getRecentBookmarks(limit: number = 5): Promise<BookmarkWithTags[]> {
  const user = await getUser();
  if (!user) return [];
  
  const supabase = await getSupabase();
  if (!supabase) return [];
  
  const { data: bookmarksData, error: bookmarksError } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (bookmarksError) {
    console.error('Error fetching recent bookmarks:', bookmarksError);
    return [];
  }
  
  if (!bookmarksData) return [];

  // Fetch tags for each bookmark
  const bookmarksWithTags = await Promise.all(
    bookmarksData.map(async (bookmark: Bookmark) => {
      const tags = await getTagsForBookmark(parseInt(bookmark.id));
      return { ...bookmark, fetchedTags: tags };
    })
  );
  
  console.log('Fetched bookmarks:', bookmarksWithTags?.length || 0, 'items');
  return bookmarksWithTags || [];
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
export function prepareBookmarkFromMetadata(metadata: Metadata): InsertBookmarkInput {
  return {
    url: metadata.metadata?.url || '',
    title: metadata.title || 'Untitled Bookmark',
    description: metadata.description,
    favicon: metadata.favicon,
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
export async function updateBookmark(bookmarkId: string, updates: UpdateBookmarkInput): Promise<Bookmark> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');
  
  const supabase = await getSupabase();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { tags, ...bookmarkData } = updates;
  const bookmarkToUpdate: UpdateBookmarkDb = bookmarkData;

  // 1. Update core data
  let updateError: Error | null = null;
  let updatedBookmark: Bookmark | null = null;
  if (Object.keys(bookmarkToUpdate).length > 0) {
    const { data, error } = await supabase
      .from('bookmarks')
      .update(bookmarkToUpdate)
      .eq('id', bookmarkId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating bookmark data:', error);
      updateError = error;
    } else {
      updatedBookmark = data;
    }
  }

  // 2. Update tags
  let tagsUpdateError = false;
  if (tags !== undefined) { 
    const tagsUpdated = await updateBookmarkTags(parseInt(bookmarkId), tags || []);
    if (!tagsUpdated) {
      console.warn(`Failed to update tags for bookmark ${bookmarkId}.`);
      tagsUpdateError = true;
    }
  }

  // Handle errors
  if (updateError || tagsUpdateError) {
    throw updateError || new Error('Failed to fully update bookmark, tags might be inconsistent.');
  }
  
  // If only tags were updated, fetch the bookmark data to return it
  if (!updatedBookmark) {
     const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('id', bookmarkId)
      .eq('user_id', user.id)
      .single();
      if (error || !data) {
          console.error("Failed to fetch bookmark after tag update:", error);
          throw new Error("Bookmark tag update succeeded, but failed to fetch the updated bookmark data.") 
      }
      updatedBookmark = data;
  }

  // Type is now guaranteed non-null
  // Add an explicit assertion or check, although logic flow ensures it
  if (!updatedBookmark) { 
      throw new Error("Unexpected null bookmark after update.");
  }
  return updatedBookmark;
} 