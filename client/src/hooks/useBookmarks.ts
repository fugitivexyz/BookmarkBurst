import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";
import { Database } from "@/lib/database.types";

type Bookmark = Database['public']['Tables']['bookmarks']['Row'];
type InsertBookmark = Database['public']['Tables']['bookmarks']['Insert'];
type UpdateBookmark = Database['public']['Tables']['bookmarks']['Update'];

const BOOKMARKS_QUERY_KEY = "bookmarks";

export function useBookmarks() {
  const { user } = useAuth();
  
  const {
    data: bookmarks = [],
    isLoading,
    error,
  } = useQuery<Bookmark[]>({
    queryKey: [BOOKMARKS_QUERY_KEY],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const extractMetadata = async (url: string) => {
    try {
      console.log("Attempting to extract metadata via Cloudflare Function");
      
      // The URL will depend on the environment
      const functionUrl = import.meta.env.DEV 
        ? 'http://localhost:8788/extract-metadata' // Local Wrangler development URL
        : '/extract-metadata'; // Production Cloudflare Pages URL (relative to origin)
      
      // Call the Cloudflare Function for metadata extraction
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        throw new Error(`Function returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Cloudflare Function successfully returned metadata", data);
      return data;
    } catch (error) {
      console.error("Error extracting metadata from Cloudflare Function:", error);
      
      // Fallback: Try using Supabase Edge Function as backup
      try {
        console.log("Attempting to use Supabase Edge Function as fallback");
        const { data, error: supabaseError } = await supabase.functions.invoke('extract-metadata', {
          body: { url },
        });
        
        if (supabaseError) throw supabaseError;
        console.log("Supabase Edge Function successfully returned metadata", data);
        return data;
      } catch (supabaseError) {
        console.error("Error extracting metadata from Supabase:", supabaseError);
        
        // Local fallback as last resort
        try {
          console.log("Using local fallback for metadata extraction");
          const parsedUrl = new URL(url);
          const domain = parsedUrl.hostname.replace('www.', '');
          
          // Try to get the title from the URL path, where the last part might be the page name
          let title = domain;
          const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment);
          if (pathSegments.length > 0) {
            const lastSegment = pathSegments[pathSegments.length - 1];
            // If the last segment contains hyphens or underscores, it might be a formatted title
            if (lastSegment.includes('-') || lastSegment.includes('_')) {
              const formattedTitle = lastSegment
                .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
                .replace(/\.\w+$/, '') // Remove file extension if present
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
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
    }
  };

  const addBookmarkMutation = useMutation({
    mutationFn: async (newBookmark: Omit<InsertBookmark, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          ...newBookmark,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] });
      toast({
        title: "Bookmark added",
        description: "Your bookmark has been successfully added.",
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
    mutationFn: async ({ id, data }: { id: number; data: UpdateBookmark }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: updatedData, error } = await supabase
        .from('bookmarks')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedData;
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
  };
}
