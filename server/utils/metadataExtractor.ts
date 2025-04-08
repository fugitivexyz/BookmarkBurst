import https from 'https';
import http from 'http';
import { URL } from 'url';

interface Metadata {
  title?: string;
  description?: string;
  favicon?: string;
  [key: string]: any;
}

export async function extractMetadata(url: string): Promise<Metadata> {
  try {
    const html = await fetchHtml(url);
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
    for (const match of ogMatches) {
      const property = match[1];
      const content = match[2];
      if (property && content) {
        metadata[`og_${property}`] = content.trim();
      }
    }
    
    // Extract Twitter card metadata
    const twitterMatches = html.matchAll(/<meta[^>]*name=["']twitter:([^"']+)["'][^>]*content=["'](.*?)["'][^>]*>/ig);
    for (const match of twitterMatches) {
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

async function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookmarkoBot/1.0; +https://bookmarko.app)',
      },
      timeout: 10000
    };
    
    const req = client.request(options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Request failed with status code ${res.statusCode}`));
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    
    req.end();
  });
}
