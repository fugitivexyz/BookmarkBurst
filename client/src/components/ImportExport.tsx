import React, { useState } from 'react';
import { Download, Upload, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bookmark, InsertBookmark } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface ImportExportProps {
  bookmarks: Bookmark[];
  onImport: (bookmarks: InsertBookmark[]) => Promise<void>;
}

export function ImportExport({ bookmarks, onImport }: ImportExportProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = () => {
    // Prepare bookmarks data for export
    const exportData = bookmarks.map(bookmark => ({
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description,
      favicon: bookmark.favicon,
      tags: bookmark.tags,
      metadata: bookmark.metadata
    }));

    // Create a downloadable file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    // Create and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookmarks-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Bookmarks exported successfully",
      description: `Exported ${exportData.length} bookmarks`,
    });
  };

  const handleImportClick = () => {
    setIsImportOpen(true);
    setImportStatus('idle');
    setImportMessage('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('processing');
      setImportMessage('Processing import file...');
      
      const fileContent = await file.text();
      const importData = JSON.parse(fileContent);
      
      // Validate the data structure
      if (!Array.isArray(importData)) {
        throw new Error('Invalid import format: expected an array of bookmarks');
      }
      
      // Basic validation of each item
      const validBookmarks = importData.filter((item: any) => 
        typeof item === 'object' && item !== null && typeof item.url === 'string'
      );
      
      if (validBookmarks.length === 0) {
        throw new Error('No valid bookmarks found in the import file');
      }
      
      // Process the import
      await onImport(validBookmarks);
      
      setImportStatus('success');
      setImportMessage(`Successfully imported ${validBookmarks.length} bookmarks`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Close dialog after a short delay
      setTimeout(() => {
        setIsImportOpen(false);
      }, 1500);
      
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        <Button 
          onClick={handleExport} 
          variant="outline" 
          size="sm"
          className="neo-brutal-box flex items-center"
          disabled={bookmarks.length === 0}
        >
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Button 
          onClick={handleImportClick} 
          variant="outline" 
          size="sm"
          className="neo-brutal-box flex items-center"
        >
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>
      </div>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="neo-brutal-box-lg">
          <DialogHeader>
            <DialogTitle>Import Bookmarks</DialogTitle>
            <DialogDescription>
              Upload a JSON file with your bookmarks.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {importStatus === 'idle' && (
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-4">Click to browse or drag and drop</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  Select File
                </Button>
              </div>
            )}
            
            {importStatus === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-spin mb-3 h-8 w-8 border-2 border-gray-500 border-t-accent rounded-full mx-auto"></div>
                <p>{importMessage}</p>
              </div>
            )}
            
            {importStatus === 'success' && (
              <div className="text-center py-8 text-green-600">
                <Check className="h-10 w-10 mx-auto mb-2" />
                <p>{importMessage}</p>
              </div>
            )}
            
            {importStatus === 'error' && (
              <div className="text-center py-8 text-red-600">
                <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                <p>{importMessage}</p>
                <Button 
                  onClick={() => setImportStatus('idle')} 
                  variant="outline" 
                  size="sm"
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsImportOpen(false)}
              className="neo-brutal-box"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}