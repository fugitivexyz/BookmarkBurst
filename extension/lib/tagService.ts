import { getSupabase } from './supabase';
import { Database } from "./database.types";

type PublicSchema = Database['public'];
type Tag = PublicSchema['Tables']['tags']['Row'];
type BookmarkTag = PublicSchema['Tables']['bookmark_tags']['Row'];

// Get all available tags
export async function getAllTags(): Promise<Tag[]> {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Supabase client not available");
  
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
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .rpc('get_bookmark_tags', { bookmark_id: bookmarkId });
  
  if (error) {
    console.error(`Error fetching tags for bookmark ${bookmarkId}:`, error);
    return [];
  }
  
  return data ? data.map((row: { tag_name: string }) => row.tag_name) : [];
}

// Add tags to a bookmark
export async function addTagsToBookmark(bookmarkId: number, tagNames: string[]): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Supabase client not available");

  if (!tagNames || tagNames.length === 0) {
    return true;
  }
  
  const normalizedTags = tagNames.map(name => name.trim().toLowerCase()).filter(Boolean);
  if (normalizedTags.length === 0) {
    return true;
  }

  // 1. Find existing tags
  const { data: existingTagsData, error: fetchExistingError } = await supabase
    .from('tags')
    .select('*')
    .in('name', normalizedTags);

  if (fetchExistingError) {
    console.error('Error fetching existing tags:', fetchExistingError);
    return false;
  }
  
  const existingTagNames = existingTagsData?.map((tag: any) => tag.name) || [];
  const tagsToCreate = normalizedTags.filter(name => !existingTagNames.includes(name));

  // 2. Create non-existent tags
  let newTagsData: Tag[] = [];
  if (tagsToCreate.length > 0) {
    const tagInsertions = tagsToCreate.map(name => ({ name }));
    const { data: insertedTags, error: insertTagsError } = await supabase
      .from('tags')
      .insert(tagInsertions)
      .select('*');

    if (insertTagsError) {
      console.warn('Error inserting new tags (might be a conflict):', insertTagsError);
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

  // 3. Combine tag IDs
  const allRelevantTags = [...(existingTagsData || []), ...newTagsData];
  const tagIdsToLink = allRelevantTags.map((tag: any) => tag.id);

  if (tagIdsToLink.length === 0) {
      console.warn("No valid tag IDs found to link.")
      return true;
  }
  
  // 4. Create connections
  const tagConnections = tagIdsToLink.map(tagId => ({
    bookmark_id: bookmarkId,
    tag_id: tagId
  }));
  
  const { error: linkTagsError } = await supabase
    .from('bookmark_tags')
    .insert(tagConnections);

  if (linkTagsError) {
    if (linkTagsError.code === '23505') {
        console.log("Ignoring unique violation error during bookmark_tags insert.");
    } else {
        console.error('Error linking tags to bookmark:', linkTagsError);
        return false;
    }
  }
  
  return true;
}

// Remove tags from a bookmark
export async function removeTagsFromBookmark(bookmarkId: number, tagNames: string[]): Promise<boolean> {
    const supabase = await getSupabase();
    if (!supabase) throw new Error("Supabase client not available");

    if (!tagNames || tagNames.length === 0) {
      return true;
    }

    const normalizedTags = tagNames.map(name => name.trim().toLowerCase()).filter(Boolean);
    if (normalizedTags.length === 0) {
      return true;
    }

    // Find tag IDs
    const { data: tagData, error: fetchTagsError } = await supabase
      .from('tags')
      .select('id')
      .in('name', normalizedTags);

    if (fetchTagsError || !tagData || tagData.length === 0) {
      console.error('Error fetching tag IDs for removal or tags not found:', fetchTagsError);
      return !fetchTagsError;
    }

    const tagIdsToRemove = tagData.map((tag: any) => tag.id);

    // Remove connections
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

// Update all tags for a bookmark
export async function updateBookmarkTags(bookmarkId: number, tagNames: string[]): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Supabase client not available");

  // Remove existing connections
  const { error: deleteError } = await supabase
    .from('bookmark_tags')
    .delete()
    .eq('bookmark_id', bookmarkId);

  if (deleteError) {
    console.error('Error clearing existing tags for bookmark:', deleteError);
    return false;
  }
  
  // Add new tags
  if (tagNames && tagNames.length > 0) {
    return await addTagsToBookmark(bookmarkId, tagNames);
  }
  
  return true;
}

// Get most recently used tags
export async function getRecentTags(limit: number = 5): Promise<string[]> {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .from('tags')
    .select('name')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching recent tags:', error);
    return [];
  }
  
  return data ? data.map((tag: { name: string }) => tag.name) : [];
} 