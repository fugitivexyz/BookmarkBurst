import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import type { Bookmark } from "@shared/schema";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onUpdate: (id: number, data: { title: string; description: string; tags: string[] }) => void;
  onDelete: (id: number) => void;
}

export default function BookmarkCard({ bookmark, onUpdate, onDelete }: BookmarkCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState(bookmark.title);
  const [editDescription, setEditDescription] = useState(bookmark.description || "");
  const [editTags, setEditTags] = useState<string[]>(bookmark.tags || []);
  const [newTag, setNewTag] = useState("");
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      
      if (!editTags.includes(newTag.trim())) {
        setEditTags([...editTags, newTag.trim()]);
      }
      
      setNewTag("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSaveEdit = () => {
    onUpdate(bookmark.id, {
      title: editTitle,
      description: editDescription,
      tags: editTags
    });
    setShowEditDialog(false);
  };
  
  const handleDelete = () => {
    onDelete(bookmark.id);
    setShowDeleteDialog(false);
  };
  
  // Calculate time ago
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    
    return `${Math.floor(seconds)} seconds ago`;
  };
  
  // Generate a random shape for decoration
  const shapeIndex = bookmark.id % 3;
  const shapes = [
    "w-6 h-6", // Square
    "w-6 h-6 rounded-full", // Circle
    "w-6 h-6 transform rotate-45" // Diamond
  ];
  
  const colorIndex = bookmark.id % 3;
  const colors = ["bg-accent", "bg-secondary", "bg-primary"];
  
  return (
    <>
      <div className="bookmark-card neo-brutal-box bg-white p-4 relative">
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <div className={`${colors[colorIndex]} ${shapes[shapeIndex]}`}></div>
        </div>
        <div className="flex mb-4">
          <div className="w-10 h-10 mr-3 bg-gray-100 border border-black flex items-center justify-center">
            {bookmark.favicon ? (
              <img 
                src={bookmark.favicon} 
                alt="Site favicon" 
                className="max-w-full max-h-full p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-xs text-gray-400">icon</span>
            )}
          </div>
          <h3 className="font-space font-bold text-lg truncate">
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {bookmark.title}
            </a>
          </h3>
        </div>
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{bookmark.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {bookmark.tags && bookmark.tags.map((tag, index) => (
            <span 
              key={index} 
              className={`tag-pill text-xs px-2 py-0.5 ${
                index % 3 === 0 ? 'bg-secondary' : 
                index % 3 === 1 ? 'bg-primary' : 'bg-accent text-white'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {bookmark.createdAt ? getTimeAgo(bookmark.createdAt) : "Just now"}
          </span>
          <div className="flex space-x-1">
            <button className="p-1 neo-brutal-box" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4" />
            </button>
            <button className="p-1 neo-brutal-box" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="neo-brutal-box-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-space">Edit Bookmark</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="font-semibold">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="neo-brutal-box border-2 border-black"
              />
            </div>
            <div className="space-y-2">
              <label className="font-semibold">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="neo-brutal-box border-2 border-black"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="font-semibold">Tags</label>
              <div className="flex flex-wrap items-center gap-2 p-3 neo-brutal-box bg-white">
                {editTags.map((tag, index) => (
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
                  type="text" 
                  className="flex-1 py-1 px-2 border-b-2 border-black focus:outline-none" 
                  placeholder="Add tags and press Enter" 
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagInput}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              className="neo-brutal-box"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              className="neo-brutal-box bg-accent text-white hover:bg-accent/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="neo-brutal-box-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-space">Delete Bookmark</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this bookmark? This action cannot be undone.</p>
            <p className="font-semibold mt-2">{bookmark.title}</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="neo-brutal-box"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              className="neo-brutal-box bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
