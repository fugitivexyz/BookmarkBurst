import { Metadata } from './types';

// Extract metadata from the current page DOM
export function extractMetadataFromPage(): Metadata {
  const metadata: Metadata = {};
  
  // Extract title
  metadata.title = document.title || '';
  
  // Extract description
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') ||
                          document.querySelector('meta[property="og:description"]')?.getAttribute('content');
  if (metaDescription) {
    metadata.description = metaDescription;
  }
  
  // Extract favicon
  const faviconLink = document.querySelector('link[rel="icon"]') || 
                      document.querySelector('link[rel="shortcut icon"]');
  if (faviconLink) {
    const faviconHref = faviconLink.getAttribute('href');
    if (faviconHref) {
      metadata.favicon = faviconHref.startsWith('http') 
        ? faviconHref 
        : new URL(faviconHref, window.location.origin).href;
    }
  } else {
    metadata.favicon = new URL('/favicon.ico', window.location.origin).href;
  }
  
  // Extract OpenGraph metadata
  document.querySelectorAll('meta[property^="og:"]').forEach(meta => {
    const property = meta.getAttribute('property');
    const content = meta.getAttribute('content');
    if (property && content) {
      const key = property.replace('og:', 'og_');
      metadata[key] = content;
    }
  });
  
  // Extract Twitter card metadata
  document.querySelectorAll('meta[name^="twitter:"]').forEach(meta => {
    const name = meta.getAttribute('name');
    const content = meta.getAttribute('content');
    if (name && content) {
      const key = name.replace('twitter:', 'twitter_');
      metadata[key] = content;
    }
  });
  
  // Add additional metadata
  metadata.metadata = {
    source: 'extension',
    url: window.location.href,
    domain: window.location.hostname,
    extracted_at: new Date().toISOString()
  };
  
  return metadata;
}

// Extract metadata from a given URL
export async function extractMetadataFromUrl(url: string): Promise<Metadata> {
  try {
    // Try to use the Supabase Edge Function
    const response = await fetch(`https://mktyuvhhsiuuminlolxa.supabase.co/functions/v1/extract-metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to extract metadata: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      ...data,
      metadata: {
        ...data.metadata,
        source: 'supabase-function',
        url: url
      }
    };
  } catch (error) {
    console.error('Error extracting metadata from URL:', error);
    
    // Fallback to basic metadata
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.replace('www.', '');
      
      return {
        title: domain,
        description: `Bookmark from ${domain}`,
        favicon: `${parsedUrl.protocol}//${parsedUrl.host}/favicon.ico`,
        metadata: {
          source: 'extension-fallback',
          domain: domain,
          url: url
        }
      };
    } catch (fallbackError) {
      console.error('Fallback metadata extraction failed:', fallbackError);
      return {
        title: url,
        description: undefined,
        favicon: undefined,
        metadata: { 
          source: 'extension-fallback-minimal',
          url: url
        }
      };
    }
  }
} 