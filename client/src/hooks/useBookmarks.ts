import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { Bookmark, InsertBookmark, UpdateBookmark } from "@shared/schema";

const BOOKMARKS_QUERY_KEY = "/api/bookmarks";

export function useBookmarks() {
  const {
    data: bookmarks = [],
    isLoading,
    error,
  } = useQuery<Bookmark[]>({
    queryKey: [BOOKMARKS_QUERY_KEY],
  });

  const extractMetadata = async (url: string) => {
    try {
      const response = await apiRequest("POST", "/api/extract-metadata", { url });
      return await response.json();
    } catch (error) {
      console.error("Error extracting metadata:", error);
      throw error;
    }
  };

  const addBookmarkMutation = useMutation({
    mutationFn: async (newBookmark: InsertBookmark) => {
      const response = await apiRequest("POST", BOOKMARKS_QUERY_KEY, newBookmark);
      return await response.json();
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
      const response = await apiRequest("PUT", `${BOOKMARKS_QUERY_KEY}/${id}`, data);
      return await response.json();
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
      await apiRequest("DELETE", `${BOOKMARKS_QUERY_KEY}/${id}`);
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
    queryClient, // Expose queryClient for invalidation
  };
}
