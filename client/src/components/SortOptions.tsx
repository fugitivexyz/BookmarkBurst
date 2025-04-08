import React from 'react';
import { SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SortField = 'createdAt' | 'title' | 'url';
export type SortOrder = 'asc' | 'desc';

interface SortOptionsProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField, order: SortOrder) => void;
}

export function SortOptions({ sortField, sortOrder, onSort }: SortOptionsProps) {
  return (
    <div className="flex items-center space-x-2 mb-6">
      <span className="text-sm font-medium mr-2">Sort by:</span>
      <Select
        value={sortField}
        onValueChange={(value) => onSort(value as SortField, sortOrder)}
      >
        <SelectTrigger className="neo-brutal-box border-2 border-black w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Date Added</SelectItem>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="url">URL</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        variant="ghost"
        size="icon"
        className="neo-brutal-box p-2 h-9 w-9"
        onClick={() => onSort(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        {sortOrder === 'asc' ? (
          <SortAsc className="h-4 w-4" />
        ) : (
          <SortDesc className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}