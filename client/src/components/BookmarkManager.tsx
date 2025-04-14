import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookmarkCard from "./BookmarkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookmarks, type BookmarkWithTags, type InsertBookmarkInput } from "@/hooks/useBookmarks";
import { SearchBar } from "./SearchBar";
import { TagFilter } from "./TagFilter";
import { ImportExport } from "./ImportExport";
import { SortOptions, type SortField, type SortOrder } from "./SortOptions";
import { Bookmark, InsertBookmark } from "@/lib/types";
import { queryClient } from "@/lib/queryClient";

export default function BookmarkManager() {
  const { 
    bookmarks, 
    isLoading, 
    updateBookmark, 
    deleteBookmark, 
    addBookmark 
  } = useBookmarks();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  const ITEMS_PER_PAGE = 6;
  
  // Filter and sort bookmarks
  const filteredBookmarks = useMemo(() => {
    let result = [...bookmarks];
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      result = result.filter(bookmark => {
        // Get the tags from fetchedTags first, then fall back to legacy tags
        const bookmarkTags = bookmark.fetchedTags || bookmark.tags || [];
        return selectedTags.every(tag => bookmarkTags.includes(tag));
      });
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(bookmark => 
        bookmark.title.toLowerCase().includes(term) || 
        (bookmark.description && bookmark.description.toLowerCase().includes(term)) ||
        bookmark.url.toLowerCase().includes(term) ||
        // Search in fetchedTags first, then fall back to legacy tags
        ((bookmark.fetchedTags || bookmark.tags) && 
         (bookmark.fetchedTags || bookmark.tags || []).some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    // Sort bookmarks
    result.sort((a, b) => {
      let valueA, valueB;
      
      // Extract values based on sort field
      if (sortField === "createdAt") {
        valueA = new Date(a.created_at).getTime();
        valueB = new Date(b.created_at).getTime();
      } else if (sortField === "title") {
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
      } else {
        valueA = a.url.toLowerCase();
        valueB = b.url.toLowerCase();
      }
      
      // Apply sort order
      return sortOrder === "asc" 
        ? (valueA > valueB ? 1 : -1)
        : (valueA < valueB ? 1 : -1);
    });
    
    return result;
  }, [bookmarks, selectedTags, searchTerm, sortField, sortOrder]);
  
  // Pagination
  const totalPages = Math.ceil(filteredBookmarks.length / ITEMS_PER_PAGE);
  const paginatedBookmarks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookmarks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBookmarks, currentPage]);
  
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search change
  };
  
  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setCurrentPage(1); // Reset to first page on tag change
    }
  };
  
  const handleTagClear = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
    setCurrentPage(1);
  };
  
  const handleClearAllTags = () => {
    setSelectedTags([]);
    setCurrentPage(1);
  };
  
  const handleSort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };
  
  const handleUpdateBookmark = (id: number, data: { title: string; description: string | null; tags: string[] | null }) => {
    updateBookmark({ id, data });
  };
  
  const handleDeleteBookmark = (id: number) => {
    deleteBookmark(id);
  };
  
  const handleImportBookmarks = async (importedBookmarks: InsertBookmark[]) => {
    // Process the imported bookmarks one by one
    for (const bookmark of importedBookmarks) {
      // Convert null tags to undefined to match InsertBookmarkInput type
      const bookmarkInput: InsertBookmarkInput = {
        ...bookmark,
        tags: bookmark.tags || undefined
      };
      await addBookmark(bookmarkInput);
    }
    
    // Refresh the bookmarks list
    queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
  };
  
  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h2 className="text-2xl md:text-3xl font-space font-bold">Your Bookmarks</h2>
        
        {/* Import/Export controls */}
        <ImportExport 
          bookmarks={bookmarks} 
          onImport={handleImportBookmarks} 
        />
      </div>
      
      {/* Search bar */}
      <SearchBar 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange} 
      />
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Sort options */}
        <div className="flex-1">
          <SortOptions 
            sortField={sortField} 
            sortOrder={sortOrder} 
            onSort={handleSort} 
          />
        </div>
        
        {/* Tag filter */}
        <div className="flex-1">
          <TagFilter 
            bookmarks={bookmarks}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            onTagClear={handleTagClear}
            onClearAllTags={handleClearAllTags}
          />
        </div>
      </div>
      
      {/* Bookmarks Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="neo-brutal-box bg-white p-4">
              <div className="flex mb-4">
                <Skeleton className="w-10 h-10 mr-3" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <Skeleton className="w-full h-12 mb-4" />
              <div className="flex flex-wrap gap-1 mb-3">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <div className="flex space-x-1">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBookmarks.map(bookmark => (
            <BookmarkCard 
              key={bookmark.id} 
              bookmark={bookmark}
              onUpdate={handleUpdateBookmark}
              onDelete={handleDeleteBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 neo-brutal-box bg-white">
          <h3 className="text-xl font-space font-bold mb-2">No bookmarks found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedTags.length > 0
              ? "Try changing your search or filter settings" 
              : "Add your first bookmark using the form above"}
          </p>
        </div>
      )}
      
      {/* Pagination */}
      {filteredBookmarks.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <div className="flex neo-brutal-box overflow-hidden">
            <Button 
              className="px-4 py-2 border-r-2 border-black bg-white hover:bg-gray-100 rounded-none"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            {Array.from({ length: totalPages }).map((_, index) => (
              <Button 
                key={index}
                className={`px-4 py-2 border-r-2 border-black rounded-none ${
                  currentPage === index + 1 
                    ? 'bg-black text-white hover:bg-black/90' 
                    : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
            
            <Button 
              className="px-4 py-2 bg-white hover:bg-gray-100 rounded-none"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
