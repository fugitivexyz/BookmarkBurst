// Follow this setup guide to integrate the Deno runtime into your project:
// https://deno.com/manual/getting_started/setup_your_environment
// This enables autocomplete, linting, etc.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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

serve(async (req) => {
  // Handle CORS if needed
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const { url } = await req.json();
    
    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        {
          status: 400,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
          },
        },
      );
    }
    
    const metadata = await extractMetadata(url);
    
    return new Response(
      JSON.stringify(metadata),
      {
        status: 200,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}); 