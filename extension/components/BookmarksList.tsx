import React, { useState, useEffect } from 'react';
import { getRecentBookmarks, deleteBookmark, updateBookmark } from '../lib/bookmarks';
import { Bookmark } from '../lib/types';
import { BookmarkForm } from './BookmarkForm';

interface BookmarksListProps {
  onNewBookmark?: () => void;
  highlightUrl?: string;
}

export const BookmarksList: React.FC<BookmarksListProps> = ({ onNewBookmark, highlightUrl }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      const recentBookmarks = await getRecentBookmarks(10);
      setBookmarks(recentBookmarks);
      setError(null);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
      setError('Failed to load your bookmarks.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenBookmark = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDeleteBookmark = async (e: React.MouseEvent, bookmarkId: string) => {
    e.stopPropagation(); // Prevent opening the bookmark
    
    if (!window.confirm('Are you sure you want to delete this bookmark?')) {
      return;
    }
    
    try {
      await deleteBookmark(bookmarkId);
      // Remove bookmark from state
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      alert('Failed to delete bookmark.');
    }
  };

  const handleEditClick = (e: React.MouseEvent, bookmark: Bookmark) => {
    e.stopPropagation(); // Prevent opening the bookmark
    setEditingBookmark(bookmark);
  };

  const handleSaveEdit = async (updatedBookmark: Partial<Bookmark>) => {
    if (!editingBookmark) return;
    
    try {
      const updated = await updateBookmark(editingBookmark.id, updatedBookmark);
      // Update the bookmark in state
      setBookmarks(bookmarks.map(b => 
        b.id === editingBookmark.id ? updated : b
      ));
      setEditingBookmark(null);
    } catch (err) {
      console.error('Error updating bookmark:', err);
      alert('Failed to update bookmark.');
    }
  };

  const handleCancelEdit = () => {
    setEditingBookmark(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={loadBookmarks}
          className="text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // If we're editing a bookmark, show the form
  if (editingBookmark) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold font-space">Edit Bookmark</h1>
          <button 
            onClick={handleCancelEdit}
            className="text-sm text-gray-500 px-3 py-1 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
        
        <BookmarkForm 
          initialUrl={editingBookmark.url}
          initialMetadata={{
            title: editingBookmark.title,
            description: editingBookmark.description || '',
            favicon: editingBookmark.favicon || '',
            metadata: editingBookmark.metadata || {}
          }}
          initialTags={editingBookmark.tags || []}
          onSuccess={() => {
            setEditingBookmark(null);
            loadBookmarks();
          }}
          isEditing={true}
          bookmarkId={editingBookmark.id}
        />
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold font-space">Your Bookmarks</h1>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="mb-2">You don't have any bookmarks yet.</p>
        </div>
      ) : (
        <ul className="space-y-3 max-w-full">
          {bookmarks.map(bookmark => {
            const isHighlighted = highlightUrl && bookmark.url === highlightUrl;
            
            return (
              <li 
                key={bookmark.id} 
                className={`border-2 border-black rounded p-2 bg-white hover:bg-gray-50 w-full ${
                  isHighlighted 
                    ? 'border-primary bg-primary/5' 
                    : ''
                } shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]`}
              >
                <div className="flex justify-between items-start">
                  <div 
                    className="bookmark-content flex-1 cursor-pointer min-w-0"
                    onClick={() => handleOpenBookmark(bookmark.url)}
                  >
                    <div className="flex items-center max-w-full overflow-hidden">
                      {bookmark.favicon && (
                        <img 
                          src={bookmark.favicon} 
                          alt="" 
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <h3 className="font-medium text-primary text-ellipsis overflow-hidden whitespace-nowrap">
                        {bookmark.title}
                      </h3>
                    </div>
                    
                    <p className="text-xs text-gray-500 overflow-hidden whitespace-nowrap text-ellipsis mt-1 pr-1">
                      {bookmark.url}
                    </p>

                    {bookmark.tags && bookmark.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1 max-w-full overflow-hidden">
                        {bookmark.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 ml-1 mt-1 flex-shrink-0">
                    <button
                      onClick={(e) => handleEditClick(e, bookmark)}
                      className="p-1 text-gray-700 hover:text-primary bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                      title="Edit bookmark"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDeleteBookmark(e, bookmark.id)}
                      className="p-1 text-gray-700 hover:text-red-500 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                      title="Delete bookmark"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}; 