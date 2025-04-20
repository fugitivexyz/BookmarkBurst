import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";
import { Database } from "@/lib/database.types";
import { 
  addTagsToBookmark, 
  updateBookmarkTags, 
  getTagsForBookmark,
  getRecentTags, 
  getAllTags 
} from "@/lib/services/tagService";

type BookmarkRow = Database['public']['Tables']['bookmarks']['Row'];
type InsertBookmarkDb = Database['public']['Tables']['bookmarks']['Insert'];
type UpdateBookmarkDb = Database['public']['Tables']['bookmarks']['Update'];

export type BaseBookmark = Omit<BookmarkRow, 'tags'>;

export type InsertBookmarkInput = Omit<InsertBookmarkDb, 'user_id'> & {
  tags?: string[];
};
export type UpdateBookmarkInput = UpdateBookmarkDb & {
  tags?: string[] | null;
};

const BOOKMARKS_QUERY_KEY = "bookmarks";

export function useBookmarks() {
  const { user } = useAuth();
  
  const {
    data: bookmarks = [],
    isLoading,
    error,
  } = useQuery<BaseBookmark[]>({
    queryKey: [BOOKMARKS_QUERY_KEY],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('id, user_id, url, title, description, favicon, created_at, metadata')
        .order('created_at', { ascending: false });
      
      if (bookmarksError) throw bookmarksError;
      
      return bookmarksData || [];
    },
    enabled: !!user,
  });

  const extractMetadata = async (url: string) => {
    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('extract-metadata', {
        body: { url },
      });
      
      if (supabaseError) throw supabaseError;
      return data;
    } catch (error) {
      console.error("Error extracting metadata from Supabase:", error);
      
      try {
        console.log("Using local fallback for metadata extraction");
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname.replace('www.', '');
        
        let title = domain;
        const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment);
        if (pathSegments.length > 0) {
          const lastSegment = pathSegments[pathSegments.length - 1];
          if (lastSegment.includes('-') || lastSegment.includes('_')) {
            const formattedTitle = lastSegment
              .replace(/[-_]/g, ' ')
              .replace(/\.\w+$/, '')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            
            if (formattedTitle.length > 0) {
              title = formattedTitle;
            }
          }
        }
        
        return {
          title: title,
          description: `Bookmark from ${domain}${pathSegments.length > 0 ? ' - ' + pathSegments.join('/') : ''}`,
          favicon: `${parsedUrl.protocol}//${parsedUrl.host}/favicon.ico`,
          metadata: { 
            source: 'local-fallback',
            domain: domain,
            url: url,
            path: parsedUrl.pathname
          }
        };
      } catch (fallbackError) {
        console.error("Fallback metadata extraction failed:", fallbackError);
        return {
          title: url,
          description: null,
          favicon: null,
          metadata: { source: 'local-fallback-minimal' }
        };
      }
    }
  };

  const addBookmarkMutation = useMutation({
    mutationFn: async (newBookmarkInput: InsertBookmarkInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { tags, ...bookmarkData } = newBookmarkInput;
      const bookmarkToInsert: InsertBookmarkDb = {
        ...bookmarkData,
        user_id: user.id,
      };

      const { data: newBookmark, error: insertError } = await supabase
        .from('bookmarks')
        .insert(bookmarkToInsert)
        .select()
        .single();

      if (insertError || !newBookmark) {
        console.error("Error inserting bookmark:", insertError);
        throw insertError || new Error('Failed to insert bookmark');
      }

      if (tags && tags.length > 0) {
        // Pass user.id to addTagsToBookmark
        const tagsAdded = await addTagsToBookmark(user.id, newBookmark.id, tags);
        if (!tagsAdded) {
          console.warn(`Bookmark ${newBookmark.id} created, but failed to add tags.`);
        }
      }
      
      return newBookmark;
    },
    onSuccess: (newBookmark) => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] });
      toast({
        title: "Bookmark added",
        description: `"${newBookmark.title}" has been successfully added.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add bookmark",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const updateBookmarkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateBookmarkInput }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { tags, ...bookmarkData } = data;
      const bookmarkToUpdate: UpdateBookmarkDb = bookmarkData;

      let updateError: Error | null = null;
      if (Object.keys(bookmarkToUpdate).length > 0) {
        const { error } = await supabase
          .from('bookmarks')
          .update(bookmarkToUpdate)
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error updating bookmark data:", error);
          updateError = error;
        }
      }

      let tagsUpdateError = false;
      if (tags !== undefined) {
        // Pass user.id to updateBookmarkTags
        const tagsUpdated = await updateBookmarkTags(user.id, id, tags || []);
        if (!tagsUpdated) {
          console.warn(`Failed to update tags for bookmark ${id}.`);
          tagsUpdateError = true;
        }
      }

      if (updateError || tagsUpdateError) {
        throw updateError || new Error('Failed to fully update bookmark, tags might be inconsistent.');
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] });
      toast({
        title: "Bookmark updated",
        description: "Your bookmark has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update bookmark",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] });
      toast({
        title: "Bookmark deleted",
        description: "Your bookmark has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete bookmark",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Add a query for tag suggestions
  const {
    data: recentTags = [],
    isLoading: isLoadingTags,
  } = useQuery<string[]>({
    queryKey: ['recent-tags'],
    queryFn: async () => {
      if (!user) return [];
      console.log('[useBookmarks] Fetching recent tags for user:', user.id);
      // Pass user.id first, then the limit
      const tags = await getRecentTags(user.id, 10);
      console.log('[useBookmarks] Recent tags fetched:', tags);
      return tags;
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return {
    bookmarks,
    isLoading,
    error,
    extractMetadata,
    addBookmark: addBookmarkMutation.mutate,
    updateBookmark: updateBookmarkMutation.mutate,
    deleteBookmark: deleteBookmarkMutation.mutate,
    isAdding: addBookmarkMutation.isPending,
    isUpdating: updateBookmarkMutation.isPending,
    isDeleting: deleteBookmarkMutation.isPending,
    recentTags,
    isLoadingTags
  };
}
