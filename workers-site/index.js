import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

/**
 * The DEBUG flag will do two things:
 * 1. we will skip caching on the edge, which makes it easier to debug
 * 2. we will return an error message on exception in your Response
 */
const DEBUG = false;

/**
 * Handle incoming requests
 */
addEventListener('fetch', (event) => {
  try {
    event.respondWith(handleEvent(event));
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      );
    }
    event.respondWith(new Response('Internal Error', { status: 500 }));
  }
});

async function handleEvent(event) {
  const url = new URL(event.request.url);
  let options = {};

  /**
   * Try to get the asset from KV, falling back to the origin if not found
   */
  try {
    const page = await getAssetFromKV(event, options);
    // Allow headers to be altered
    const response = new Response(page.body, page);
    return response;
  } catch (e) {
    // If an error is thrown serve the asset at the root
    if (!DEBUG) {
      // Serve index.html for all routes (SPA)
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: (req) => new Request(`${new URL(req.url).origin}/index.html`, req),
        });
        return new Response(notFoundResponse.body, { ...notFoundResponse, status: 200 });
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 });
  }
} 