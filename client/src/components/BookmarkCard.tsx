import { useState, useEffect } from "react";
import { ExternalLink, Pencil, Trash2, X, Save, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { BaseBookmark } from "@/hooks/useBookmarks";
import { getTagsForBookmark } from "@/lib/services/tagService";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface BookmarkCardProps {
  bookmark: BaseBookmark;
  onUpdate: (id: number, data: { title: string; description: string | null; tags: string[] | null }) => void;
  onDelete: (id: number) => void;
}

export default function BookmarkCard({ bookmark, onUpdate, onDelete }: BookmarkCardProps) {
  // Fetch tags for this specific bookmark
  const { data: bookmarkTags = [], isLoading: tagsLoading, error: tagsError } = useQuery({
    queryKey: ['bookmark-tags', bookmark.id],
    queryFn: async () => {
      console.log(`Fetching tags for bookmark ID: ${bookmark.id}`);
      const tags = await getTagsForBookmark(bookmark.id);
      console.log(`Tags fetched for bookmark ID ${bookmark.id}:`, tags);
      return tags;
    },
    enabled: !!bookmark.id, // Only run if bookmark.id is available
    staleTime: 5 * 60 * 1000, // Cache tags for 5 minutes
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(bookmark.title);
  const [editDescription, setEditDescription] = useState(bookmark.description || "");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (bookmarkTags && bookmarkTags.length > 0) {
      setEditTags(bookmarkTags);
    }
  }, [bookmarkTags]);

  const randomColorClass = () => {
    const colors = ["bg-primary", "bg-secondary", "bg-accent text-white"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleSaveEdit = () => {
    onUpdate(bookmark.id, {
      title: editTitle,
      description: editDescription || null,
      tags: editTags.length > 0 ? editTags : null
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(bookmark.title);
    setEditDescription(bookmark.description || "");
    setEditTags(bookmarkTags);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(bookmark.id);
    setIsDeleteDialogOpen(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === " " || e.key === ",") && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch (e) {
      return url;
    }
  };

  if (isEditing) {
    return (
      <div className="neo-brutal-box bg-white p-4 shadow-lg relative">
        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-1 text-sm">Title</label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full neo-brutal-box"
            />
          </div>
          
          <div>
            <label className="block font-bold mb-1 text-sm">Description</label>
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full neo-brutal-box"
            />
          </div>
          
          <div>
            <label className="block font-bold mb-1 text-sm">Tags</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {editTags.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-gray-200 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  <span>{tag}</span>
                  <button onClick={() => removeTag(tag)} className="ml-1 text-gray-500 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagInput}
                placeholder="Add tags (press Enter)"
                className="flex-1 neo-brutal-box"
              />
              <Button 
                onClick={handleAddTag} 
                disabled={!newTag.trim()}
                variant="ghost"
                className="ml-2"
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              onClick={handleCancelEdit} 
              variant="outline"
              className="neo-brutal-box"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              className="neo-brutal-box bg-secondary hover:bg-secondary/90"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-brutal-box bg-white p-4 shadow-lg flex flex-col h-full">
      <div className="flex items-start mb-2">
        {bookmark.favicon ? (
          <img 
            src={bookmark.favicon} 
            alt="Site favicon" 
            className="w-6 h-6 mr-2 border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-6 h-6 mr-2 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-xs font-bold text-gray-500">
              {getDomain(bookmark.url).charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <h3 className="font-bold line-clamp-2 flex-1 text-lg">
          {bookmark.title}
        </h3>
      </div>
      
      <a 
        href={bookmark.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-sm text-primary mb-2 flex items-center hover:underline"
      >
        <ExternalLink className="h-3 w-3 mr-1 inline" /> 
        {getDomain(bookmark.url)}
      </a>
      
      {bookmark.description && (
        <p className="text-gray-700 mb-4 line-clamp-3 flex-grow">
          {bookmark.description}
        </p>
      )}
      
      {tagsLoading ? (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <span className="mr-1">|</span>
          <Tag className="h-3 w-3 mr-1" />
          <span className="text-xs">Tags:</span>
          <span className="text-xs text-gray-500 italic">Loading tags...</span>
        </div>
      ) : tagsError ? (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <span className="mr-1">|</span>
          <Tag className="h-3 w-3 mr-1" />
          <span className="text-xs">Tags:</span>
          <span className="text-xs text-red-500 italic">Error loading tags</span>
        </div>
      ) : bookmarkTags.length > 0 ? (
        <div className="flex items-center space-x-1 text-xs text-gray-500 mb-3"> 
          <span className="mr-1">|</span>
          <Tag className="h-3 w-3 mr-1" />
          <span className="text-xs">Tags:</span>
          <div className="flex flex-wrap gap-1 ml-1">
            {bookmarkTags.map((tag, index) => (
              <span key={index} className="bg-gray-100 px-2 py-0.5 rounded-md text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      
      <div className="flex justify-between items-center mt-auto pt-2 text-xs text-gray-500">
        <span className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {formatDate(bookmark.created_at)}
        </span>
        
        <div className="flex space-x-1">
          <Button 
            onClick={() => setIsEditing(true)} 
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleDeleteClick} 
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="neo-brutal-box no-transitions">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-base sm:text-lg">Delete Bookmark</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm">
              Are you sure you want to delete "{bookmark.title.length > 30 ? bookmark.title.substring(0, 30) + '...' : bookmark.title}"?
              <br />This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="neo-brutal-box no-transitions w-full h-10 sm:h-12 text-base"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteConfirm();
              }}
              className="neo-brutal-box no-transitions bg-red-500 text-white w-full h-10 sm:h-12 text-base"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
