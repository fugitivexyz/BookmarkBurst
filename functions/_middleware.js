export async function onRequest({ request, next, env }) {
  try {
    // Try to serve the requested asset using the default Pages asset handling
    const response = await next();
    
    // Return the response if it exists and is not a 404
    if (response.status !== 404) {
      return response;
    }
    
    // For any 404s, redirect to index.html for client-side routing
    const url = new URL(request.url);
    return Response.redirect(`${url.origin}/index.html`, 302);
  } catch (e) {
    console.error(`Middleware error: ${e.message}`);
    console.error(e.stack);
    
    return new Response(`Server error: ${e.message}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
} 