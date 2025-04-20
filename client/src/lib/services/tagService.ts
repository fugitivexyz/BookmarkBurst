import { supabase } from '@/lib/supabase';
import { Database } from "@/lib/database.types";

type PublicSchema = Database['public'];
type Tag = PublicSchema['Tables']['tags']['Row'];
type BookmarkTag = PublicSchema['Tables']['bookmark_tags']['Row'];

// Get all available tags for the current user
export async function getAllTags(userId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId) // Filter by user
    .order('name');
  
  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
  
  return data || [];
}

// Get tags for a specific bookmark (RLS handles user filtering implicitly)
export async function getTagsForBookmark(bookmarkId: number): Promise<string[]> {
  console.log(`[getTagsForBookmark] Starting fetch for bookmark ID: ${bookmarkId}`);
  
  // Rewritten to query tables directly instead of using RPC
  const { data, error } = await supabase
    .from('bookmark_tags')
    .select('tags ( id, name )') // Select name from the related tags table
    .eq('bookmark_id', bookmarkId);
  
  console.log(`[getTagsForBookmark] Raw data for bookmark ID ${bookmarkId}:`, data);
  
  if (error) {
    console.error(`Error fetching tags for bookmark ${bookmarkId}:`, error);
    return [];
  }
  
  // Data format is [{ tags: { name: 'tag1' } }, { tags: { name: 'tag2' } }]
  const tagNames = data ? data.map(item => item.tags?.name).filter((name): name is string => !!name) : [];
  console.log(`[getTagsForBookmark] Extracted tag names for bookmark ID ${bookmarkId}:`, tagNames);
  
  return tagNames;
}

// Add tags to a bookmark for a specific user
export async function addTagsToBookmark(userId: string, bookmarkId: number, tagNames: string[]): Promise<boolean> {
  console.log('Adding tags to bookmark', { userId, bookmarkId, tagNames });
  
  if (!tagNames || tagNames.length === 0) {
    console.log('No tags to add');
    return true; // Nothing to add
  }
  
  const normalizedTags = tagNames.map(name => name.trim().toLowerCase()).filter(Boolean);
  if (normalizedTags.length === 0) {
    console.log('No normalized tags to add');
    return true;
  }

  console.log('Normalized tags', normalizedTags);

  try {
    // 1. Find ALL existing tags for this user - not just the ones in normalizedTags
    // This prevents race conditions by getting a complete picture before any insertions
    const { data: allUserTags, error: fetchAllError } = await supabase
      .from('tags')
      .select('id, name')
      .eq('user_id', userId);
    
    if (fetchAllError) {
      console.error('Error fetching user tags:', fetchAllError);
      return false;
    }
    
    console.log('All user tags', allUserTags);
    
    // Create a case-insensitive map of existing tags
    const existingTagMap = new Map();
    (allUserTags || []).forEach(tag => {
      console.log(`Adding tag to map: ${tag.name.toLowerCase()} -> ${tag.id}`);
      existingTagMap.set(tag.name.toLowerCase(), tag.id);
    });
    
    console.log('Existing tag map', Object.fromEntries(existingTagMap));
    
    // 2. Determine which tags need to be created (don't exist for this user)
    // normalizedTags are already lowercase from earlier
    const tagsToCreate = [];
    const existingTagIds = [];
    
    // First separate existing tags from tags to create
    for (const name of normalizedTags) {
      console.log(`Checking if tag "${name}" exists in map with keys: ${Array.from(existingTagMap.keys()).join(', ')}`);
      
      if (existingTagMap.has(name)) {
        const id = existingTagMap.get(name);
        console.log(`Found existing tag: ${name} -> ID: ${id}`);
        existingTagIds.push(id);
      } else {
        console.log(`Tag "${name}" needs to be created`);
        tagsToCreate.push(name);
      }
    }
    
    console.log('Tags to create', tagsToCreate);
    console.log('Existing tag IDs collected', existingTagIds);
    
    // 3. Create new tags only if they don't already exist
    let allTagIds = [...existingTagIds]; // Start with existing tag IDs
    
    // Insert any new tags
    if (tagsToCreate.length > 0) {
      // Include userId in insertion
      const tagInsertions = tagsToCreate.map(name => ({ name, user_id: userId })); 
      console.log('Inserting new tags', tagInsertions);
      
      try {
        const { data: newTags, error: insertError } = await supabase
          .from('tags')
          .insert(tagInsertions)
          .select('id, name');
        
        console.log('Insert result', { newTags, insertError });
        
        if (insertError) {
          // If we still get a constraint error (very rare race condition), 
          // fetch the tags again to get their IDs
          if (insertError.code === '23505') {
            console.log('Constraint violation, fetching newly created tags');
            // Another session might have inserted these tags in the meantime
            // Fetch the newly created tags by name
            const { data: justCreatedTags, error: fetchNewError } = await supabase
              .from('tags')
              .select('id, name')
              .eq('user_id', userId)
              .in('name', tagsToCreate.map(t => t.toLowerCase()));
            
            console.log('Fetch after constraint', { justCreatedTags, fetchNewError });
            
            if (fetchNewError) {
              console.error('Error fetching newly created tags:', fetchNewError);
              return false;
            }
            
            if (justCreatedTags && justCreatedTags.length > 0) {
              // Add these tag IDs to our collection
              justCreatedTags.forEach(tag => {
                console.log(`Adding tag ID from constraint recovery: ${tag.id} (${tag.name})`);
                allTagIds.push(tag.id);
              });
            } else {
              console.warn('No tags returned after constraint recovery');
            }
          } else {
            console.error('Error inserting new tags:', insertError);
            return false;
          }
        } else if (newTags && newTags.length > 0) {
          // Add the new tag IDs to our collection
          console.log(`Adding ${newTags.length} new tag IDs`, newTags);
          newTags.forEach(tag => {
            console.log(`Adding new tag ID: ${tag.id} (${tag.name})`);
            allTagIds.push(tag.id);
          });
        } else {
          console.warn('No new tags returned from insert operation');
        }
      } catch (err) {
        console.error('Unexpected error during tag insertion:', err);
        return false;
      }
    }
    
    console.log('All tag IDs to link', allTagIds);
    
    if (allTagIds.length === 0) {
      console.warn("No valid tag IDs found to link.");
      return true; // Not necessarily a failure
    }
    
    // 4. Create the bookmark-tag connections
    const tagConnections = allTagIds.map(tagId => ({ 
      bookmark_id: bookmarkId,
      tag_id: tagId,
      user_id: userId
    }));
    
    console.log('Tag connections to create', tagConnections);
    
    // Insert connections with ON CONFLICT DO NOTHING approach
    try {
      const { error: linkError } = await supabase
        .from('bookmark_tags')
        .upsert(tagConnections, { 
          onConflict: 'bookmark_id,tag_id', 
          ignoreDuplicates: true 
        });
      
      console.log('Link result', { linkError });
      
      if (linkError && linkError.code !== '23505') { // Ignore unique constraint violations
        console.error('Error linking tags to bookmark:', linkError);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error linking tags to bookmark:', err);
      return false;
    }
  } catch (error) {
    console.error('Unexpected error in addTagsToBookmark:', error);
    return false;
  }
}

// Remove tags from a bookmark for a specific user
export async function removeTagsFromBookmark(userId: string, bookmarkId: number, tagNames: string[]): Promise<boolean> {
    if (!tagNames || tagNames.length === 0) {
      return true; // Nothing to remove
    }

    const normalizedTags = tagNames.map(name => name.trim().toLowerCase()).filter(Boolean);
    if (normalizedTags.length === 0) {
      return true;
    }

    // Find the tag IDs to remove for this user
    const { data: tagData, error: fetchTagsError } = await supabase
      .from('tags')
      .select('id')
      .eq('user_id', userId) // Filter by user
      .in('name', normalizedTags);

    if (fetchTagsError || !tagData || tagData.length === 0) {
      console.warn('Error fetching tag IDs for removal or tags not found for user:', fetchTagsError);
      // If tags don't exist for user, consider removal successful for those tags
      return !fetchTagsError; 
    }

    const tagIdsToRemove = tagData.map(tag => tag.id);

    // Remove the connections for this user
    const { error: deleteError } = await supabase
      .from('bookmark_tags')
      .delete()
      .eq('user_id', userId) // Filter by user
      .eq('bookmark_id', bookmarkId)
      .in('tag_id', tagIdsToRemove);

    if (deleteError) {
      console.error('Error removing tags from bookmark:', deleteError);
      return false;
    }

    return true;
}

// Get most recently used tags for the current user
export async function getRecentTags(userId: string, limit: number = 5): Promise<string[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('name')
    .eq('user_id', userId) // Filter by user
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching recent tags:', error);
    return [];
  }
  
  return data ? data.map(tag => tag.name) : [];
}

// Update all tags for a bookmark for a specific user
export async function updateBookmarkTags(userId: string, bookmarkId: number, tagNames: string[]): Promise<boolean> {
  // First remove all existing tag connections for this user and bookmark
  const { error: deleteError } = await supabase
    .from('bookmark_tags')
    .delete()
    .eq('user_id', userId) // Filter by user
    .eq('bookmark_id', bookmarkId);

  if (deleteError) {
    console.error('Error clearing existing tags for bookmark:', deleteError);
    return false;
  }
  
  // Then add the new tags (addTagsToBookmark already includes userId)
  if (tagNames && tagNames.length > 0) {
    return await addTagsToBookmark(userId, bookmarkId, tagNames);
  }
  
  // If tagNames is empty or null, we just cleared them, so return true
  return true;
}