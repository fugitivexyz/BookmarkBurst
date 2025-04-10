import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { TagInput } from './TagInput';
import { saveBookmark, prepareBookmarkFromMetadata, isUrlBookmarked, updateBookmark } from '../lib/bookmarks';
import { Metadata } from '../lib/types';
import { extractMetadataFromUrl } from '../lib/metadata';

interface BookmarkFormProps {
  initialUrl?: string;
  initialMetadata?: Metadata;
  initialTags?: string[];
  onSuccess?: () => void;
  isEditing?: boolean;
  bookmarkId?: string;
}

export const BookmarkForm: React.FC<BookmarkFormProps> = ({
  initialUrl = '',
  initialMetadata,
  initialTags = [],
  onSuccess,
  isEditing = false,
  bookmarkId,
}) => {
  // Initialize form state from props
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialMetadata?.title || '');
  const [description, setDescription] = useState(initialMetadata?.description || '');
  const [favicon, setFavicon] = useState(initialMetadata?.favicon || '');
  const [tags, setTags] = useState<string[]>(initialTags);
  const [metadata, setMetadata] = useState<any>(initialMetadata?.metadata || {});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAlreadyBookmarked, setIsAlreadyBookmarked] = useState(false);
  
  // Update state when initialUrl, initialMetadata, or initialTags changes
  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
    
    if (initialMetadata) {
      setTitle(initialMetadata.title || '');
      setDescription(initialMetadata.description || '');
      setFavicon(initialMetadata.favicon || '');
      setMetadata(initialMetadata.metadata || {});
    }

    if (initialTags) {
      setTags(initialTags);
    }
  }, [initialUrl, initialMetadata, initialTags]);
  
  // Extract metadata when URL changes
  useEffect(() => {
    if (!initialMetadata && url && url !== '') {
      fetchMetadata();
    }
  }, [url, initialMetadata]);
  
  // Check if URL is already bookmarked
  useEffect(() => {
    if (url) {
      checkIfBookmarked();
    }
  }, [url]);
  
  const fetchMetadata = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newMetadata = await extractMetadataFromUrl(url);
      
      setTitle(newMetadata.title || '');
      setDescription(newMetadata.description || '');
      setFavicon(newMetadata.favicon || '');
      setMetadata(newMetadata.metadata || {});
    } catch (err) {
      console.error('Error fetching metadata:', err);
      setError('Could not fetch page metadata. Please enter details manually.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkIfBookmarked = async () => {
    try {
      const bookmarked = await isUrlBookmarked(url);
      setIsAlreadyBookmarked(bookmarked);
    } catch (err) {
      console.error('Error checking if URL is bookmarked:', err);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !title) {
      setError('URL and title are required');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const bookmarkData = {
        url,
        title,
        description: description || undefined,
        favicon: favicon || undefined,
        tags: tags.length > 0 ? tags : null,
        metadata: {
          ...metadata,
          saved_from: 'extension',
          updated_at: new Date().toISOString()
        }
      };

      if (isEditing && bookmarkId) {
        // Update existing bookmark
        await updateBookmark(bookmarkId, bookmarkData);
        setSuccessMessage('Bookmark updated successfully!');
      } else {
        // Create new bookmark
        await saveBookmark({
          ...bookmarkData,
          metadata: {
            ...bookmarkData.metadata,
            saved_at: new Date().toISOString()
          }
        });
        setSuccessMessage('Bookmark saved successfully!');
      }
      
      // Reset form after success if there's no onSuccess handler
      if (!onSuccess) {
        setTimeout(() => {
          setUrl('');
          setTitle('');
          setDescription('');
          setFavicon('');
          setTags([]);
          setMetadata({});
          setSuccessMessage(null);
        }, 2000);
      } else {
        onSuccess();
      }
    } catch (err) {
      console.error('Error saving bookmark:', err);
      setError(err instanceof Error ? err.message : 'Failed to save bookmark.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="p-3">
      <h1 className="text-lg font-bold mb-3 font-space">
        {isEditing ? 'Edit Bookmark' : 'Save to Bookmarko'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-3 text-sm">
          {successMessage}
        </div>
      )}
      
      {isAlreadyBookmarked && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded mb-3 text-sm">
          This URL is already in your bookmarks.
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Input
          label="URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
          disabled={isLoading}
          className="mb-3"
        />
        
        {isLoading && (
          <div className="flex items-center justify-center my-2">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
            <span className="text-sm">Loading metadata...</span>
          </div>
        )}
        
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title"
          required
          className="mb-3"
        />
        
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Page description"
            className="w-full p-2 neo-brutal-box"
            rows={2}
          />
        </div>
        
        <TagInput
          tags={tags}
          setTags={setTags}
          className="mb-3"
        />
        
        <Button
          type="submit"
          className="w-full mt-3"
          disabled={isSaving}
          variant="primary"
          size="md"
        >
          {isSaving ? 'Saving...' : isEditing ? 'Update Bookmark' : 'Save Bookmark'}
        </Button>
      </form>
    </div>
  );
}; 