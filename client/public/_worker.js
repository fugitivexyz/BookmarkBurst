export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    try {
      // Try to serve the requested asset
      const response = await env.ASSETS.fetch(request);
      
      // If the page is not found, return the index.html for client-side routing
      if (response.status === 404) {
        return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
      }
      
      return response;
    } catch (e) {
      return new Response(`Worker error: ${e.message}`, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
}; 