import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BookmarkCard from "./BookmarkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookmarks } from "@/hooks/useBookmarks";

export default function BookmarkManager() {
  const { bookmarks, isLoading, updateBookmark, deleteBookmark } = useBookmarks();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("newest");
  const [showFilter, setShowFilter] = useState(false);
  
  const ITEMS_PER_PAGE = 6;
  
  // Get unique tags from all bookmarks
  const uniqueTags = useMemo(() => {
    const allTags = bookmarks.flatMap(bookmark => bookmark.tags || []);
    return [...new Set(allTags)];
  }, [bookmarks]);
  
  // Filter and sort bookmarks
  const filteredBookmarks = useMemo(() => {
    let result = [...bookmarks];
    
    // Filter by tag
    if (activeTag !== "All") {
      result = result.filter(bookmark => 
        bookmark.tags && bookmark.tags.includes(activeTag)
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query) || 
        (bookmark.description && bookmark.description.toLowerCase().includes(query)) ||
        (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Sort bookmarks
    switch (sortOption) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "az":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    
    return result;
  }, [bookmarks, activeTag, searchQuery, sortOption]);
  
  // Pagination
  const totalPages = Math.ceil(filteredBookmarks.length / ITEMS_PER_PAGE);
  const paginatedBookmarks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookmarks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBookmarks, currentPage]);
  
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const handleFilterByTag = (tag: string) => {
    setActiveTag(tag);
    setCurrentPage(1); // Reset to first page on tag change
  };
  
  const handleUpdateBookmark = (id: number, data: { title: string; description: string; tags: string[] }) => {
    updateBookmark({ id, data });
  };
  
  const handleDeleteBookmark = (id: number) => {
    deleteBookmark(id);
  };
  
  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h2 className="text-2xl md:text-3xl font-space font-bold">Your Bookmarks</h2>
        
        {/* Search & Filter Bar */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="neo-brutal-box bg-white overflow-hidden flex">
            <Input
              type="text" 
              className="p-2 w-40 sm:w-60 focus:outline-none border-none" 
              placeholder="Search bookmarks" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              className="bg-black text-white px-3 rounded-none hover:bg-black/90"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Filter dropdown */}
          <div className="relative neo-brutal-box">
            <Button 
              className="flex items-center px-3 py-2 bg-secondary font-medium hover:bg-secondary/90 rounded-none"
              onClick={() => setShowFilter(!showFilter)}
            >
              <span>Filter</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
            {showFilter && (
              <div className="absolute right-0 mt-2 w-48 bg-white neo-brutal-box z-10">
                <div className="py-1">
                  <a 
                    href="#" 
                    className={`block px-4 py-2 hover:bg-gray-100 ${sortOption === 'newest' ? 'font-bold' : ''}`}
                    onClick={(e) => { e.preventDefault(); setSortOption('newest'); setShowFilter(false); }}
                  >
                    Newest First
                  </a>
                  <a 
                    href="#" 
                    className={`block px-4 py-2 hover:bg-gray-100 ${sortOption === 'oldest' ? 'font-bold' : ''}`}
                    onClick={(e) => { e.preventDefault(); setSortOption('oldest'); setShowFilter(false); }}
                  >
                    Oldest First
                  </a>
                  <a 
                    href="#" 
                    className={`block px-4 py-2 hover:bg-gray-100 ${sortOption === 'az' ? 'font-bold' : ''}`}
                    onClick={(e) => { e.preventDefault(); setSortOption('az'); setShowFilter(false); }}
                  >
                    Alphabetical (A-Z)
                  </a>
                  <a 
                    href="#" 
                    className={`block px-4 py-2 hover:bg-gray-100 ${sortOption === 'za' ? 'font-bold' : ''}`}
                    onClick={(e) => { e.preventDefault(); setSortOption('za'); setShowFilter(false); }}
                  >
                    Alphabetical (Z-A)
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tags Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button 
          className={`tag-pill px-4 py-1 ${activeTag === 'All' ? 'active-tag' : 'bg-white'}`}
          onClick={() => handleFilterByTag('All')}
        >
          All
        </button>
        {uniqueTags.map((tag, index) => (
          <button 
            key={index} 
            className={`tag-pill px-4 py-1 ${activeTag === tag ? 'active-tag' : 'bg-white'}`}
            onClick={() => handleFilterByTag(tag)}
          >
            {tag}
          </button>
        ))}
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
            {searchQuery || activeTag !== 'All' 
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
