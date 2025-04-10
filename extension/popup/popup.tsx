import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { LoginForm } from '../components/LoginForm';
import { BookmarkForm } from '../components/BookmarkForm';
import { BookmarksList } from '../components/BookmarksList';
import { isAuthenticated, signOut } from '../lib/auth';
import { isUrlBookmarked } from '../lib/bookmarks';
import { Metadata } from '../lib/types';
import './popup.css';

// Chrome API type declarations for TypeScript
declare const chrome: {
  tabs: {
    query: (
      queryInfo: { active: boolean; currentWindow: true },
      callback: (tabs: { id?: number; url?: string }[]) => void
    ) => void;
  };
  runtime: {
    sendMessage: (
      message: any,
      callback?: (response: any) => void
    ) => void;
    lastError?: { message: string };
  };
};

interface GetPageInfoResponse {
  success?: boolean;
  metadata?: Metadata;
  error?: boolean;
  message?: string;
}

// Popup view states
type ViewState = 'form' | 'list';

const Popup: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const [pageMetadata, setPageMetadata] = useState<Metadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [viewState, setViewState] = useState<ViewState>('form');
  const [isUrlAlreadyBookmarked, setIsUrlAlreadyBookmarked] = useState(false);
  const [isCheckingBookmarked, setIsCheckingBookmarked] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const initialize = async () => {
      // Check authentication
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);
      setIsCheckingAuth(false);
    };
    
    initialize();
  }, []);

  // Get current tab URL and fetch metadata
  useEffect(() => {
    const getCurrentTab = async () => {
      try {
        console.log('Getting current tab info');
        // Query the current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          const activeTab = tabs[0];
          console.log('Active tab:', activeTab);
          
          if (activeTab?.url) {
            // Immediately set the current URL so it's displayed in the form
            setCurrentUrl(activeTab.url);
            console.log('Set current URL:', activeTab.url);
            
            // Check if URL is already bookmarked
            if (isLoggedIn) {
              try {
                const isBookmarked = await isUrlBookmarked(activeTab.url);
                console.log('URL already bookmarked:', isBookmarked);
                setIsUrlAlreadyBookmarked(isBookmarked);
                
                // If URL is not bookmarked, show the form, otherwise show the list
                setViewState(isBookmarked ? 'list' : 'form');
              } catch (error) {
                console.error('Error checking if URL is bookmarked:', error);
              } finally {
                setIsCheckingBookmarked(false);
              }
            }
            
            // Send message to background script to get page metadata
            console.log('Sending GET_PAGE_INFO message to background script');
            chrome.runtime.sendMessage(
              { type: 'GET_PAGE_INFO' },
              (response: GetPageInfoResponse) => {
                console.log('Received response from background script:', response);
                if (chrome.runtime.lastError) {
                  console.error('Error getting page info:', chrome.runtime.lastError);
                } else if (response?.success && response?.metadata) {
                  console.log('Setting page metadata:', response.metadata);
                  setPageMetadata(response.metadata);
                } else {
                  console.warn('No metadata in response or response not successful');
                }
                
                setIsLoadingMetadata(false);
              }
            );
          } else {
            console.warn('No URL found in active tab');
            setIsLoadingMetadata(false);
            setIsCheckingBookmarked(false);
            setViewState('list'); // Default to list if no URL
          }
        });
      } catch (error) {
        console.error('Error getting current tab:', error);
        setIsLoadingMetadata(false);
        setIsCheckingBookmarked(false);
      }
    };
    
    // Run getCurrentTab regardless of login status to at least populate the URL
    if (isLoggedIn && !isCheckingAuth) {
      getCurrentTab();
    } else if (!isCheckingAuth) {
      setIsLoadingMetadata(false);
      setIsCheckingBookmarked(false);
    }
  }, [isLoggedIn, isCheckingAuth]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // Don't set a default view state here, let the URL check determine it
    setIsCheckingBookmarked(true); // Trigger URL check
  };

  const handleLogout = async () => {
    await signOut();
    setIsLoggedIn(false);
  };

  const handleBookmarkSaved = () => {
    // Switch to bookmarks list view after successfully saving
    setViewState('list');
    setIsUrlAlreadyBookmarked(true);
  };

  const handleAddNew = () => {
    // Switch to form view when user wants to add a new bookmark
    setViewState('form');
  };

  // Show loading state
  if (isCheckingAuth || (isLoggedIn && isCheckingBookmarked)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[550px] w-[350px] overflow-hidden bg-gray-50">
      {isLoggedIn ? (
        <>
          <header className="flex justify-between items-center p-3 bg-primary text-white border-b-2 border-black">
            <h1 className="text-lg font-bold font-space">Bookmarko</h1>
            <div className="flex space-x-2">
              <button 
                onClick={() => setViewState(viewState === 'form' ? 'list' : 'form')}
                className="px-2 py-1 text-xs font-medium bg-white text-primary rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all"
              >
                {viewState === 'form' ? 'View List' : 'Add New'}
              </button>
              <button 
                onClick={handleLogout}
                className="px-2 py-1 text-xs font-medium bg-white text-primary rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all"
              >
                Logout
              </button>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto max-w-full">
            {viewState === 'form' ? (
              isLoadingMetadata ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <BookmarkForm 
                  initialUrl={currentUrl} 
                  initialMetadata={pageMetadata || undefined}
                  onSuccess={handleBookmarkSaved}
                />
              )
            ) : (
              <BookmarksList 
                onNewBookmark={handleAddNew} 
                highlightUrl={isUrlAlreadyBookmarked ? currentUrl : undefined}
              />
            )}
          </main>
          
          <footer className="bg-gray-100 p-2 text-center text-xs text-gray-500 border-t-2 border-black">
            Bookmarko Extension v1.0.0
          </footer>
        </>
      ) : (
        <>
          <header className="p-3 bg-primary text-white border-b-2 border-black">
            <h1 className="text-lg font-bold font-space">Bookmarko</h1>
          </header>
          
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </>
      )}
    </div>
  );
};

// Create root element and render the app
const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
); 