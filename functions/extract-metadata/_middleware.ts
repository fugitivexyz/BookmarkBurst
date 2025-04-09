export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

// Handle CORS preflight requests
export const onRequest = async ({ request, next }) => {
  if (request.method === 'OPTIONS') {
    return onRequestOptions();
  }
  
  // Add CORS headers to all responses
  const response = await next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}; 