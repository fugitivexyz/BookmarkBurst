import React, { useState, useEffect, useRef } from 'react';
import { getAllTags, getRecentTags } from '../lib/tagService';
import { X, Tag as TagIcon } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, setTags, className = '' }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);
  
  // Get recent tags on component mount
  useEffect(() => {
    async function fetchRecentTags() {
      try {
        const tags = await getRecentTags(10);
        setRecentTags(tags);
      } catch (error) {
        console.error('Error fetching recent tags:', error);
      }
    }
    
    fetchRecentTags();
  }, []);
  
  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = recentTags.filter(tag => 
        !tags.includes(tag) && // Don't suggest already added tags
        tag.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, tags, recentTags]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter, comma, or space
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    }
  };
  
  const addTag = (value: string) => {
    const trimmedValue = value.trim().toLowerCase();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      setTags([...tags, trimmedValue]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSuggestionClick = (tag: string) => {
    addTag(tag);
  };
  
  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium mb-1">Tags</label>
      <div className="neo-brutal-box p-2 bg-white min-h-[64px]">
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-sm text-sm">
              {tag}
              <button 
                type="button"
                onClick={() => removeTag(tag)} 
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          
          <div className="relative flex-1 min-w-[120px]" ref={inputRef}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue.trim() && setSuggestions(recentTags.filter(tag => !tags.includes(tag)).slice(0, 5))}
              placeholder="Add tag (press Enter)"
              className="w-full py-1 px-2 bg-transparent outline-none border border-gray-200 focus:border-primary rounded text-sm"
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 shadow-md rounded">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center"
                  >
                    <TagIcon size={12} className="mr-1" />
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 