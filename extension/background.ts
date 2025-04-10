import { initAuth } from './lib/auth';

// Chrome API type declarations for TypeScript
declare const chrome: {
  runtime: {
    onStartup: { addListener: (callback: () => void) => void };
    onInstalled: { addListener: (callback: () => void) => void };
    onMessage: { 
      addListener: (
        callback: (
          message: any, 
          sender: chrome.runtime.MessageSender, 
          sendResponse: (response?: any) => void
        ) => boolean | void
      ) => void 
    };
    lastError?: { message: string };
  };
  tabs: {
    query: (
      queryInfo: { active: boolean; currentWindow: boolean },
      callback: (tabs: { id?: number; url?: string }[]) => void
    ) => void;
    sendMessage: (
      tabId: number,
      message: any,
      callback?: (response: any) => void
    ) => void;
  };
  scripting: {
    executeScript: (params: {
      target: { tabId: number };
      files?: string[];
      func?: Function;
    }) => Promise<any>;
  };
};

interface PageInfoMessage {
  type: 'GET_PAGE_INFO';
}

interface ExtractMetadataMessage {
  type: 'EXTRACT_METADATA';
}

type Message = PageInfoMessage | ExtractMetadataMessage;

// Function to ensure content script is injected
async function ensureContentScriptInjected(tabId: number): Promise<boolean> {
  try {
    console.log('Ensuring content script is injected in tab:', tabId);
    // Try sending a test message to see if the content script is already running
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { type: 'PING' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          console.log('Content script not detected, injecting it');
          // Content script not running, inject it
          chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
          }).then(() => {
            console.log('Content script injected successfully');
            // Give it a moment to initialize
            setTimeout(() => resolve(true), 200);
          }).catch(err => {
            console.error('Failed to inject content script:', err);
            resolve(false);
          });
        } else {
          console.log('Content script already running');
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Error checking/injecting content script:', error);
    return false;
  }
}

// Initialize authentication on extension startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('Extension started up');
  await initAuth();
});

// Initialize authentication when installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed or updated');
  await initAuth();
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((
  message: Message, 
  sender: chrome.runtime.MessageSender, 
  sendResponse: (response: any) => void
) => {
  console.log('Background script received message:', message, 'from sender:', sender);
  
  // Handle different message types
  if (message.type === 'GET_PAGE_INFO') {
    console.log('Processing GET_PAGE_INFO message');
    
    // Request page info from the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeTab = tabs[0];
      console.log('Active tab:', activeTab);
      
      if (activeTab && activeTab.id) {
        console.log('Detected active tab ID:', activeTab.id);
        
        // Make sure content script is injected
        const isInjected = await ensureContentScriptInjected(activeTab.id);
        if (!isInjected) {
          console.error('Failed to inject content script');
          sendResponse({ error: true, message: 'Could not inject content script' });
          return;
        }
        
        console.log('Sending EXTRACT_METADATA message to tab:', activeTab.id);
        
        // Send a message to the content script to extract metadata
        chrome.tabs.sendMessage(
          activeTab.id,
          { type: 'EXTRACT_METADATA' },
          (response: any) => {
            if (chrome.runtime.lastError) {
              // If content script is not ready or there's an error, handle it
              console.error('Error communicating with content script:', chrome.runtime.lastError);
              sendResponse({ error: true, message: 'Could not extract page information' });
            } else {
              // Return the metadata
              console.log('Received response from content script:', response);
              sendResponse(response);
            }
          }
        );
      } else {
        console.error('No active tab found or tab id is undefined');
        sendResponse({ error: true, message: 'No active tab found' });
      }
    });
    
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
  
  // Add more message handlers here as needed
  
  return false;
}); 