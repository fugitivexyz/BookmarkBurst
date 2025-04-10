import React, { useState } from 'react';
import { Input } from './Input';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  className?: string;
  label?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  setTags,
  className = '',
  label = 'Tags',
}) => {
  const [newTag, setNewTag] = useState('');

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Create tag on Enter key, space or comma
    if ((e.key === 'Enter' || e.key === ' ' || e.key === ',') && newTag.trim()) {
      e.preventDefault();
      
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-300 rounded mb-2">
        {tags.map((tag, index) => (
          <span key={index} className="tag-pill">
            {tag}
            <button 
              type="button" 
              onClick={() => removeTag(tag)} 
              className="ml-1 text-xs font-bold"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder="Add tags (press Enter, space or comma to add)"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={handleTagInput}
      />
    </div>
  );
}; 