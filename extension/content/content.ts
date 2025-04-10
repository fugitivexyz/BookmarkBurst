import { extractMetadataFromPage } from '../lib/metadata';

// Chrome API type declarations for TypeScript
declare const chrome: {
  runtime: {
    onMessage: { 
      addListener: (
        callback: (
          message: any, 
          sender: chrome.runtime.MessageSender, 
          sendResponse: (response?: any) => void
        ) => boolean | void
      ) => void 
    };
  };
};

// Define interface for MessageSender since we can't import it directly
declare namespace chrome.runtime {
  interface MessageSender {
    tab?: {
      id?: number;
      url?: string;
    };
    frameId?: number;
    id?: string;
    url?: string;
    origin?: string;
  }
}

// Define interfaces for type safety
interface ExtractMetadataMessage {
  type: 'EXTRACT_METADATA';
}

interface PingMessage {
  type: 'PING';
}

type Message = ExtractMetadataMessage | PingMessage;

console.log('Content script loaded and running');

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) => {
  console.log('Content script received message:', message);
  
  if (message.type === 'PING') {
    console.log('Received PING, replying with PONG');
    sendResponse({ success: true, message: 'PONG' });
    return true;
  }
  
  if (message.type === 'EXTRACT_METADATA') {
    try {
      // Extract metadata from the current page
      const metadata = extractMetadataFromPage();
      console.log('Extracted metadata:', metadata);
      sendResponse({ success: true, metadata });
    } catch (error) {
      console.error('Error extracting metadata:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  // Return true to indicate that the response will be sent asynchronously
  return true;
}); 