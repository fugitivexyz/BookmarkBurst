import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { areCredentialsConfigured, saveCredentials } from '../lib/supabase';

interface SettingsProps {
  onSave?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onSave }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing credentials if they exist
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const { supabaseUrl, supabaseAnonKey } = await chrome.storage.sync.get([
          'supabaseUrl',
          'supabaseAnonKey'
        ]);
        
        if (supabaseUrl) setSupabaseUrl(supabaseUrl);
        if (supabaseAnonKey) setSupabaseKey(supabaseAnonKey);
      } catch (err) {
        console.error('Error loading credentials:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCredentials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabaseUrl || !supabaseKey) {
      setError('Both Supabase URL and API Key are required');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await saveCredentials(supabaseUrl, supabaseKey);
      setSuccessMessage('Settings saved successfully!');
      
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error('Error saving credentials:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-6 w-6 border-3 border-primary border-t-transparent rounded-full mr-2"></div>
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 font-space">Bookmarko Settings</h1>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <p className="mb-2 font-medium">You need to provide your Supabase project details to use this extension:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Go to your Supabase project dashboard</li>
          <li>Click on "Settings" → "API"</li>
          <li>Copy the "Project URL" and "anon public" key</li>
          <li>Paste them below</li>
        </ol>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Supabase Project URL"
          type="url"
          value={supabaseUrl}
          onChange={(e) => setSupabaseUrl(e.target.value)}
          placeholder="https://your-project.supabase.co"
          required
        />
        
        <Input
          label="Supabase Anonymous Key"
          type="password"
          value={supabaseKey}
          onChange={(e) => setSupabaseKey(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
          required
        />
        
        <Button
          type="submit"
          className="w-full mt-4"
          disabled={isSaving}
          variant="primary"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </div>
  );
}; 