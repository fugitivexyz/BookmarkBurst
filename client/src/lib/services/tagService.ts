import { supabase } from '@/lib/supabase';
import { Database } from "@/lib/database.types";

type PublicSchema = Database['public'];
type Tag = PublicSchema['Tables']['tags']['Row'];
type BookmarkTag = PublicSchema['Tables']['bookmark_tags']['Row'];

// Get all available tags
export async function getAllTags(): Promise<Tag[]> {
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
export async function getTagsForBookmark(bookmarkId: number): Promise<string[]> {
  const { data, error } = await supabase
    .rpc('get_bookmark_tags', { bookmark_id: bookmarkId });
  
  if (error) {
    console.error(`Error fetching tags for bookmark ${bookmarkId}:`, error);
    return [];
  }
  
  // The function returns an array of objects like { tag_name: 'sometag' }
  return data ? data.map((row: { tag_name: string }) => row.tag_name) : [];
}

// Add tags to a bookmark
export async function addTagsToBookmark(bookmarkId: number, tagNames: string[]): Promise<boolean> {
  if (!tagNames || tagNames.length === 0) {
    return true; // Nothing to add
  }
  
  const normalizedTags = tagNames.map(name => name.trim().toLowerCase()).filter(Boolean);
  if (normalizedTags.length === 0) {
    return true;
  }

  // 1. Find which tags already exist
  const { data: existingTagsData, error: fetchExistingError } = await supabase
    .from('tags')
    .select('*')
    .in('name', normalizedTags);

  if (fetchExistingError) {
    console.error('Error fetching existing tags:', fetchExistingError);
    return false;
  }
  
  const existingTagNames = existingTagsData?.map(tag => tag.name) || [];
  const tagsToCreate = normalizedTags.filter(name => !existingTagNames.includes(name));

  // 2. Create tags that don't exist
  let newTagsData: Tag[] = [];
  if (tagsToCreate.length > 0) {
    const tagInsertions = tagsToCreate.map(name => ({ name }));
    const { data: insertedTags, error: insertTagsError } = await supabase
      .from('tags')
      .insert(tagInsertions)
      .select('*');

    if (insertTagsError) {
      // It's possible another process inserted the tag between our check and insert
      // We might fetch again or just proceed cautiously
      console.warn('Error inserting new tags (might be a conflict):', insertTagsError);
      // Attempt to fetch again to include potentially conflicted tags
      const { data: allTagsData, error: fetchAllError } = await supabase
        .from('tags')
        .select('*')
        .in('name', normalizedTags);
      if (fetchAllError || !allTagsData) {
          console.error('Failed to fetch tag IDs after potential conflict', fetchAllError)
          return false;
      }
      newTagsData = allTagsData || [];
    } else {
        newTagsData = insertedTags || [];
    }
  }

  // 3. Combine existing and newly created tag IDs
  const allRelevantTags = [...(existingTagsData || []), ...newTagsData];
  const tagIdsToLink = allRelevantTags.map(tag => tag.id);

  if (tagIdsToLink.length === 0) {
      console.warn("No valid tag IDs found to link.")
      return true; // Or false depending on desired strictness
  }
  
  // 4. Create the bookmark-tag connections, ignoring conflicts
  const tagConnections = tagIdsToLink.map(tagId => ({
    bookmark_id: bookmarkId,
    tag_id: tagId
  }));
  
  // Insert connections - database UNIQUE constraint handles conflicts
  const { error: linkTagsError } = await supabase
    .from('bookmark_tags')
    .insert(tagConnections)
    // We removed .onConflict() - let DB handle it.
    // This might throw an error if a conflict occurs, which we might want to catch depending on requirements.

  if (linkTagsError) {
    // Error 23505 is unique_violation - we can ignore this specific error
    if (linkTagsError.code === '23505') {
        console.log("Ignoring unique violation error during bookmark_tags insert.");
    } else {
        console.error('Error linking tags to bookmark:', linkTagsError);
        return false;
    }
  }
  
  return true;
}

// Remove tags from a bookmark (by tag name)
export async function removeTagsFromBookmark(bookmarkId: number, tagNames: string[]): Promise<boolean> {
    if (!tagNames || tagNames.length === 0) {
      return true; // Nothing to remove
    }

    const normalizedTags = tagNames.map(name => name.trim().toLowerCase()).filter(Boolean);
    if (normalizedTags.length === 0) {
      return true;
    }

    // Find the tag IDs to remove
    const { data: tagData, error: fetchTagsError } = await supabase
      .from('tags')
      .select('id')
      .in('name', normalizedTags);

    if (fetchTagsError || !tagData || tagData.length === 0) {
      console.error('Error fetching tag IDs for removal or tags not found:', fetchTagsError);
      // If tags don't exist, consider the removal successful for those tags
      return !fetchTagsError; 
    }

    const tagIdsToRemove = tagData.map(tag => tag.id);

    // Remove the connections
    const { error: deleteError } = await supabase
      .from('bookmark_tags')
      .delete()
      .eq('bookmark_id', bookmarkId)
      .in('tag_id', tagIdsToRemove);

    if (deleteError) {
      console.error('Error removing tags from bookmark:', deleteError);
      return false;
    }

    return true;
}

// Get most recently used tags
export async function getRecentTags(limit: number = 5): Promise<string[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('name')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching recent tags:', error);
    return [];
  }
  
  return data ? data.map(tag => tag.name) : [];
}

// Update all tags for a bookmark (replace existing tags)
export async function updateBookmarkTags(bookmarkId: number, tagNames: string[]): Promise<boolean> {
  // First remove all existing tag connections for this bookmark
  const { error: deleteError } = await supabase
    .from('bookmark_tags')
    .delete()
    .eq('bookmark_id', bookmarkId);

  if (deleteError) {
    console.error('Error clearing existing tags for bookmark:', deleteError);
    return false;
  }
  
  // Then add the new tags
  if (tagNames && tagNames.length > 0) {
    return await addTagsToBookmark(bookmarkId, tagNames);
  }
  
  // If tagNames is empty or null, we just cleared them, so return true
  return true;
} 