import { supabase } from '@/lib/supabase';

// Get all available tags
export async function getAllTags() {
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
export async function getTagsForBookmark(bookmarkId: number) {
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
export async function addTagsToBookmark(bookmarkId: number, tagNames: string[]) {
  if (!tagNames.length) return true;
  
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
  const tagConnections = tagData.map(tag => ({
    bookmark_id: bookmarkId,
    tag_id: tag.id
  }));
  
  // Insert the connections one by one to avoid conflicts
  for (const connection of tagConnections) {
    await supabase
      .from('bookmark_tags')
      .upsert(connection, { onConflict: 'bookmark_id,tag_id' });
  }
  
  return true;
}

// Remove all tags from a bookmark
export async function removeAllTagsFromBookmark(bookmarkId: number) {
  const { error } = await supabase
    .from('bookmark_tags')
    .delete()
    .eq('bookmark_id', bookmarkId);
  
  return !error;
}

// Remove specific tags from a bookmark
export async function removeTagsFromBookmark(bookmarkId: number, tagIds: number[]) {
  if (!tagIds.length) return true;
  
  const { error } = await supabase
    .from('bookmark_tags')
    .delete()
    .eq('bookmark_id', bookmarkId)
    .in('tag_id', tagIds);
  
  return !error;
}

// Update all tags for a bookmark (replace existing tags)
export async function updateBookmarkTags(bookmarkId: number, tagNames: string[]) {
  // First remove all existing tag connections
  await removeAllTagsFromBookmark(bookmarkId);
  
  // Then add the new tags if there are any
  if (tagNames && tagNames.length > 0) {
    return await addTagsToBookmark(bookmarkId, tagNames);
  }
  
  return true;
}

// Get tag counts (for display in tag filter)
export async function getTagsWithCounts() {
  const { data, error } = await supabase.rpc('get_tags_with_counts');
  
  if (error) {
    console.error('Error fetching tag counts:', error);
    return [];
  }
  
  return data || [];
} 