import React from 'react';
import { Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Bookmark } from '@shared/schema';

interface TagFilterProps {
  bookmarks: Bookmark[];
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
  onClearAllTags 
}: TagFilterProps) {
  // Extract all unique tags from bookmarks
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    bookmarks.forEach(bookmark => {
      if (bookmark.tags) {
        bookmark.tags.forEach(tag => {
          tags.add(tag);
        });
      }
    });
    return Array.from(tags).sort();
  }, [bookmarks]);

  if (allTags.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          <h3 className="font-semibold">Filter by Tags</h3>
        </div>
        {selectedTags.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAllTags}
            className="text-xs py-1 h-auto"
          >
            Clear All
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => selectedTags.includes(tag) ? onTagClear(tag) : onTagSelect(tag)}
            className={`tag-pill px-3 py-1 flex items-center text-sm ${
              selectedTags.includes(tag) 
                ? 'bg-accent text-white' 
                : 'bg-muted text-gray-600'
            }`}
          >
            <span>{tag}</span>
            {selectedTags.includes(tag) && (
              <X className="h-3 w-3 ml-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}