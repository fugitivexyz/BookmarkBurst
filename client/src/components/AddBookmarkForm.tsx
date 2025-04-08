import { useState } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export default function AddBookmarkForm() {
  const { extractMetadata, addBookmark, isAdding } = useBookmarks();
  
  const [url, setUrl] = useState("");
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
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
    
    try {
      const metadata = await extractMetadata(url);
      
      setBookmarkData({
        title: metadata.title || "",
        description: metadata.description || "",
        favicon: metadata.favicon || "",
        metadata: metadata
      });
      
      setShowPreview(true);
    } catch (error) {
      console.error("Error extracting metadata:", error);
    }
  };
  
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      
      setNewTag("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSaveBookmark = async () => {
    if (!url.trim()) return;
    
    try {
      // Extract metadata first if not already done
      if (!showPreview) {
        await handleExtractMetadata();
      }
      
      await addBookmark({
        url,
        title: bookmarkData.title || "Untitled",
        description: bookmarkData.description || "",
        favicon: bookmarkData.favicon || "",
        tags,
        metadata: bookmarkData.metadata
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
            />
          </div>
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
            <Input 
              id="tag-input"
              type="text" 
              className="flex-1 py-1 px-2 border-b-2 border-black focus:outline-none" 
              placeholder="Add tags and press Enter" 
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagInput}
            />
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
