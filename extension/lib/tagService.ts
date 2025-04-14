import { getSupabase } from './supabase';
import { getUser } from './auth';
import { Database } from './database.types';

interface TagItem {
  id: number;
  name: string;
}

// Get all available tags
export async function getAllTags() {
  const user = await getUser();
  if (!user) {
    console.error('User not authenticated when attempting to get tags');
    return [];
  }
  
  const supabase = await getSupabase();
  if (!supabase) {
    console.error('Supabase client not initialized when attempting to get tags');
    return [];
  }
  
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
  
  return data || [];
}

// Get tags for a specific bookmark
export async function getTagsForBookmark(bookmarkId: string) {
  const user = await getUser();
  if (!user) {
    console.error('User not authenticated when attempting to get bookmark tags');
    return [];
  }
  
  const supabase = await getSupabase();
  if (!supabase) {
    console.error('Supabase client not initialized when attempting to get bookmark tags');
    return [];
  }
  
  const { data, error } = await supabase
    .from('tags')
    .select(`
      id,
      name,
      bookmark_tags!inner(bookmark_id)
    `)
    .eq('bookmark_tags.bookmark_id', bookmarkId);
  
  if (error) {
    console.error('Error fetching bookmark tags:', error);
    return [];
  }
  
  return data.map(tag => tag.name) || [];
}

// Add tags to a bookmark
export async function addTagsToBookmark(bookmarkId: string, tagNames: string[]) {
  if (!tagNames || !tagNames.length) return true;
  
  const user = await getUser();
  if (!user) {
    console.error('User not authenticated when attempting to add tags');
    return false;
  }
  
  const supabase = await getSupabase();
  if (!supabase) {
    console.error('Supabase client not initialized when attempting to add tags');
    return false;
  }
  
  const normalizedTagNames = tagNames.map(tag => tag.trim().toLowerCase()).filter(Boolean);
  if (!normalizedTagNames.length) return true;
  
  // First ensure all tags exist
  for (const tagName of normalizedTagNames) {
    // Insert the tag if it doesn't exist
    await supabase
      .from('tags')
      .upsert({ name: tagName }, { onConflict: 'name' });
  }
  
  // Get the IDs of the tags
  const { data: tagData } = await supabase
    .from('tags')
    .select('id, name')
    .in('name', normalizedTagNames);
  
  if (!tagData || !tagData.length) return false;
  
  // Create the bookmark-tag connections
  for (const tag of tagData as TagItem[]) {
    await supabase
      .from('bookmark_tags')
      .upsert({
        bookmark_id: bookmarkId,
        tag_id: tag.id
      }, { onConflict: 'bookmark_id,tag_id' });
  }
  
  return true;
}

// Remove all tags from a bookmark
export async function removeAllTagsFromBookmark(bookmarkId: string) {
  const user = await getUser();
  if (!user) {
    console.error('User not authenticated when attempting to remove tags');
    return false;
  }
  
  const supabase = await getSupabase();
  if (!supabase) {
    console.error('Supabase client not initialized when attempting to remove tags');
    return false;
  }
  
  const { error } = await supabase
    .from('bookmark_tags')
    .delete()
    .eq('bookmark_id', bookmarkId);
  
  return !error;
}

// Update all tags for a bookmark (replace existing tags)
export async function updateBookmarkTags(bookmarkId: string, tagNames: string[]) {
  // First remove all existing tag connections
  const removed = await removeAllTagsFromBookmark(bookmarkId);
  if (!removed) return false;
  
  // Then add the new tags if there are any
  if (tagNames && tagNames.length > 0) {
    return await addTagsToBookmark(bookmarkId, tagNames);
  }
  
  return true;
} 