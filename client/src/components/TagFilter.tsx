import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkWithTags } from "@/hooks/useBookmarks";

interface TagFilterProps {
  bookmarks: BookmarkWithTags[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onTagClear: (tag: string) => void;
  onClearAllTags: () => void;
}

export function TagFilter({
  bookmarks,
  selectedTags,
  onTagSelect,
  onTagClear,
  onClearAllTags,
}: TagFilterProps) {
  // Extract unique tags from all bookmarks, preferring fetchedTags over legacy tags
  const allTags = bookmarks.reduce((tags: string[], bookmark) => {
    // Use fetchedTags if available, fall back to legacy tags
    const bookmarkTags = bookmark.fetchedTags || bookmark.tags || [];
    
    for (const tag of bookmarkTags) {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    return tags;
  }, []).sort();

  // Count bookmarks for each tag
  const tagCounts = allTags.reduce((counts: Record<string, number>, tag) => {
    counts[tag] = bookmarks.filter(bookmark => {
      // Use fetchedTags if available, fall back to legacy tags
      const bookmarkTags = bookmark.fetchedTags || bookmark.tags || [];
      return bookmarkTags.includes(tag);
    }).length;
    return counts;
  }, {});

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Filter by Tags</h3>
        {selectedTags.length > 0 && (
          <Button 
            onClick={onClearAllTags} 
            className="text-xs py-1 h-auto"
            variant="ghost"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="bg-secondary py-1 px-2 text-sm rounded-md flex items-center"
            >
              {tag}
              <button
                onClick={() => onTagClear(tag)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag list */}
      {allTags.length > 0 ? (
        <div className="neo-brutal-box bg-white p-2 max-h-40 overflow-y-auto">
          <div className="flex flex-wrap gap-1">
            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => (!isSelected ? onTagSelect(tag) : null)}
                  className={`py-1 px-2 text-xs rounded flex items-center ${
                    isSelected
                      ? "bg-gray-200 text-gray-500 cursor-default"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  disabled={isSelected}
                >
                  {tag} <span className="ml-1 text-gray-500">({tagCounts[tag]})</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="neo-brutal-box bg-white p-3 text-center text-gray-500 text-sm">
          No tags available. Add tags to your bookmarks first.
        </div>
      )}
    </div>
  );
}