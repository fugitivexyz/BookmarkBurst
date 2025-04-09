export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    try {
      // Check if ASSETS binding exists
      if (!env.ASSETS) {
        return new Response('ASSETS binding is undefined. Check your wrangler.toml configuration.', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Try to serve the requested asset
      let response = await env.ASSETS.fetch(request);
      
      // Log the response status for debugging
      console.log(`Requested: ${url.pathname}, Status: ${response.status}`);
      
      // If the page is not found, return the index.html for client-side routing
      if (response.status === 404) {
        console.log(`Falling back to index.html for: ${url.pathname}`);
        response = await env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
      }
      
      return response;
    } catch (e) {
      console.error(`Worker error: ${e.message}`);
      console.error(e.stack);
      return new Response(`Worker error: ${e.message}\n\nCheck logs for more details.`, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
}; 