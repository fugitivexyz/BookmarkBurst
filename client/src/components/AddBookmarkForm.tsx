import { useState, useEffect, useRef } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Tag as TagIcon } from "lucide-react";

export default function AddBookmarkForm() {
  const { extractMetadata, addBookmark, isAdding, recentTags } = useBookmarks();
  
  const [url, setUrl] = useState("");
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  
  // Create filtered suggestions based on user input
  const tagSuggestions = recentTags.filter(tag => 
    !tags.includes(tag) && // Don't suggest already selected tags
    (!newTag || tag.toLowerCase().includes(newTag.toLowerCase())) // Filter by current input
  ).slice(0, 5); // Limit to 5 suggestions
  
  // Close suggestions when clicking outside
  const tagInputRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tagInputRef.current && !tagInputRef.current.contains(event.target as Node)) {
        setShowTagSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const [bookmarkData, setBookmarkData] = useState({
    title: "",
    description: "",
    favicon: "",
    metadata: {}
  });
  
  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    
    if (value.trim() === "") {
      setShowPreview(false);
    }
  };
  
  const handleExtractMetadata = async () => {
    if (!url.trim()) return;
    
    setIsExtracting(true);
    setExtractError(null);
    
    try {
      const metadata = await extractMetadata(url);
      
      setBookmarkData({
        title: metadata.title || "",
        description: metadata.description || "",
        favicon: metadata.favicon || "",
        metadata: metadata
      });
      
      setShowPreview(true);
      
      // Show a message if fallback was used
      if (metadata.metadata && metadata.metadata.source && metadata.metadata.source.includes('fallback')) {
        setExtractError("Note: Using local metadata extraction. Edge function could not be reached.");
      }
    } catch (error) {
      console.error("Error extracting metadata:", error);
      setExtractError("Could not extract metadata. Please enter details manually.");
      
      // Still show preview with empty data
      setBookmarkData({
        title: new URL(url).hostname.replace('www.', '') || "",
        description: "",
        favicon: "",
        metadata: {}
      });
      
      setShowPreview(true);
    } finally {
      setIsExtracting(false);
    }
  };
  
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Show suggestions when typing
    if (newTag.trim()) {
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
    
    // Create tag on Enter key
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      
      setNewTag("");
      setShowTagSuggestions(false);
    }
    
    // Create tag on space or comma
    if ((e.key === " " || e.key === ",") && newTag.trim()) {
      e.preventDefault();
      
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      
      setNewTag("");
      setShowTagSuggestions(false);
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Add function to handle tag suggestion click
  const handleTagSuggestionClick = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setNewTag("");
    setShowTagSuggestions(false);
  };
  
  const handleSaveBookmark = async () => {
    if (!url.trim()) return;
    
    try {
      // Extract metadata first if not already done
      if (!showPreview) {
        await handleExtractMetadata();
      }
      
      // Ensure we have a title either from metadata or from the URL domain
      let finalTitle = bookmarkData.title;
      if (!finalTitle) {
        try {
          const parsedUrl = new URL(url);
          finalTitle = parsedUrl.hostname.replace('www.', '');
        } catch (e) {
          finalTitle = "Untitled Bookmark";
        }
      }
      
      // Create a minimal metadata object if none exists
      let finalMetadata = bookmarkData.metadata;
      if (!finalMetadata || Object.keys(finalMetadata).length === 0) {
        try {
          const parsedUrl = new URL(url);
          finalMetadata = {
            source: 'minimal-fallback',
            domain: parsedUrl.hostname,
            url: url
          };
        } catch (e) {
          finalMetadata = { source: 'minimal-fallback', url: url };
        }
      }
      
      await addBookmark({
        url,
        title: finalTitle,
        description: bookmarkData.description || null,
        favicon: bookmarkData.favicon || null,
        tags: tags.length > 0 ? tags : undefined,
        metadata: finalMetadata
      });
      
      // Reset form
      setUrl("");
      setTags([]);
      setBookmarkData({
        title: "",
        description: "",
        favicon: "",
        metadata: {}
      });
      setShowPreview(false);
      setExtractError(null);
    } catch (error) {
      console.error("Error saving bookmark:", error);
    }
  };
  
  return (
    <div className="mb-12 neo-brutal-box bg-white p-6 md:p-8 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 bg-accent w-32 h-32 rounded-full opacity-70"></div>
      <div className="absolute top-0 right-0 bg-secondary w-16 h-16"></div>

      <h2 className="text-2xl md:text-3xl font-space font-bold mb-6 relative z-10">Add New Bookmark</h2>
      
      <div className="space-y-4 relative z-10">
        <div>
          <label className="block text-lg font-semibold mb-2" htmlFor="url">Paste URL</label>
          <div className="flex">
            <Input 
              id="url" 
              type="url" 
              className="w-full p-3 border-3 border-black neo-brutal-box focus:outline-none focus:ring-2 focus:ring-accent" 
              placeholder="https://example.com"
              value={url}
              onChange={handleUrlChange}
              onBlur={handleExtractMetadata}
              disabled={isExtracting}
            />
          </div>
          {isExtracting && (
            <div className="text-sm text-primary mt-1 flex items-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Extracting metadata...
            </div>
          )}
          {extractError && (
            <div className="text-sm text-red-500 mt-1">
              {extractError}
            </div>
          )}
        </div>
        
        {/* Preview section (shows after URL input) */}
        {showPreview && (
          <div className="p-4 border-2 border-dashed border-black mt-4 bg-gray-50">
            <div className="flex items-start">
              <div className="w-16 h-16 bg-gray-200 border border-black mr-4 flex-shrink-0 flex items-center justify-center">
                {bookmarkData.favicon ? (
                  <img 
                    src={bookmarkData.favicon} 
                    alt="Site favicon" 
                    className="max-w-full max-h-full p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-gray-400">icon</span>
                )}
              </div>
              <div className="flex-1">
                <Input 
                  type="text" 
                  className="w-full p-2 mb-2 neo-brutal-box border-2 border-black"
                  placeholder="Title will appear here"
                  value={bookmarkData.title}
                  onChange={(e) => setBookmarkData({...bookmarkData, title: e.target.value})}
                />
                <Textarea 
                  className="w-full p-2 neo-brutal-box border-2 border-black"
                  rows={2}
                  placeholder="Description will appear here"
                  value={bookmarkData.description}
                  onChange={(e) => setBookmarkData({...bookmarkData, description: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-lg font-semibold mb-2" htmlFor="tags">Tags</label>
          <div className="flex flex-wrap items-center gap-2 p-3 neo-brutal-box bg-white">
            {tags.map((tag, index) => (
              <span 
                key={index} 
                className={`tag-pill px-3 py-1 ${
                  index % 3 === 0 ? 'bg-secondary' : 
                  index % 3 === 1 ? 'bg-primary' : 'bg-accent text-white'
                } inline-flex items-center`}
              >
                <span>{tag}</span>
                <button className="ml-2" onClick={() => removeTag(tag)}>
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}

            <div className="flex-1 relative" ref={tagInputRef}>
              <Input 
                id="tag-input"
                type="text" 
                className="flex-1 neo-brutal-box" 
                placeholder="Add tags (Enter, space or comma to separate)" 
                value={newTag}
                onChange={(e) => {
                  setNewTag(e.target.value);
                  setShowTagSuggestions(e.target.value.trim().length > 0);
                }}
                onKeyDown={handleTagInput}
                onFocus={() => newTag.trim() && setShowTagSuggestions(true)}
              />
              
              {/* Tag suggestions dropdown */}
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg neo-brutal-box overflow-hidden">
                  {tagSuggestions.map((tag, index) => (
                    <div 
                      key={index}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                      onClick={() => handleTagSuggestionClick(tag)}
                    >
                      <TagIcon className="h-3 w-3 mr-2" />
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSaveBookmark}
            disabled={isAdding || !url.trim()}
            className="neo-brutal-box bg-accent text-white px-5 py-3 font-space font-bold text-lg hover:bg-accent/90 transition-colors"
          >
            {isAdding ? "Saving..." : "Save Bookmark"}
          </Button>
        </div>
      </div>
    </div>
  );
}
