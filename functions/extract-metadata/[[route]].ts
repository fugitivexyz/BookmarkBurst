interface Metadata {
  title?: string;
  description?: string;
  favicon?: string;
  [key: string]: any;
}

async function extractMetadata(url: string): Promise<Metadata> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBurst/1.0)'
      },
    });
    
    if (!response.ok) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
    
    const html = await response.text();
    const metadata: Metadata = {};
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      metadata.title = titleMatch[1].trim();
    }
    
    // Extract description
    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["'][^>]*>/i) || 
                             html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["'][^>]*>/i) ||
                             html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["'][^>]*>/i);
    
    if (descriptionMatch && descriptionMatch[1]) {
      metadata.description = descriptionMatch[1].trim();
    }
    
    // Extract favicon
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["'](.*?)["'][^>]*>/i) ||
                         html.match(/<link[^>]*href=["'](.*?)["'][^>]*rel=["'](?:shortcut )?icon["'][^>]*>/i);
    
    if (faviconMatch && faviconMatch[1]) {
      let faviconUrl = faviconMatch[1].trim();
      
      // Handle relative URLs
      if (faviconUrl.startsWith('/')) {
        const parsedUrl = new URL(url);
        faviconUrl = `${parsedUrl.protocol}//${parsedUrl.host}${faviconUrl}`;
      } else if (!faviconUrl.startsWith('http')) {
        const parsedUrl = new URL(url);
        faviconUrl = `${parsedUrl.protocol}//${parsedUrl.host}/${faviconUrl}`;
      }
      
      metadata.favicon = faviconUrl;
    } else {
      // Default to domain/favicon.ico if no favicon is specified
      const parsedUrl = new URL(url);
      metadata.favicon = `${parsedUrl.protocol}//${parsedUrl.host}/favicon.ico`;
    }
    
    // Extract OpenGraph metadata
    const ogMatches = html.matchAll(/<meta[^>]*property=["']og:([^"']+)["'][^>]*content=["'](.*?)["'][^>]*>/ig);
    for (const match of Array.from(ogMatches)) {
      const property = match[1];
      const content = match[2];
      if (property && content) {
        metadata[`og_${property}`] = content.trim();
      }
    }
    
    // Extract Twitter card metadata
    const twitterMatches = html.matchAll(/<meta[^>]*name=["']twitter:([^"']+)["'][^>]*content=["'](.*?)["'][^>]*>/ig);
    for (const match of Array.from(twitterMatches)) {
      const property = match[1];
      const content = match[2];
      if (property && content) {
        metadata[`twitter_${property}`] = content.trim();
      }
    }
    
    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {};
  }
}

export async function onRequest(context) {
  const { request } = context;
  
  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
  
  try {
    const requestData = await request.json();
    const { url } = requestData;
    
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }
    
    const metadata = await extractMetadata(url);
    
    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
} 