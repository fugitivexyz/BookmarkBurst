export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    try {
      // Try to serve the requested asset directly
      let response = await env.ASSETS.fetch(request);
      
      // If the page is not found, return the index.html for client-side routing
      if (response.status === 404) {
        response = await env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
        // If we still can't find the index.html, log it
        if (response.status === 404) {
          console.error("Cannot find index.html. Check asset paths.");
        }
      }
      
      return response;
    } catch (e) {
      // Log the error properly
      console.error(`Worker error: ${e.message}`);
      console.error(e.stack);
      
      // Return a more helpful error response
      return new Response("Internal Server Error. Please try again later.", {
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }
}; 