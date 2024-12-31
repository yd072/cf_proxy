export async function onRequest({ request }) {
  const url = new URL(request.url);

  let targetUrl;
  if (url.pathname.startsWith('/proxy')) {
    targetUrl = 'https://raw.githubusercontent.com/yd072/tv/refs/heads/main/itvlist.txt';
  } else if (url.pathname.startsWith('/iptvs')) {
    targetUrl = 'https://raw.githubusercontent.com/yd072/iptv-api/refs/heads/master/output/result.txt';
  } else {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const cache = caches.default;
    const cacheKey = new Request(targetUrl, request);
    let cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      console.log('Cache hit');
      return cachedResponse;
    }

    console.log('Cache miss, fetching from origin');
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const finalResponse = new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });

    await cache.put(cacheKey, finalResponse.clone());
    return finalResponse;
  } catch (error) {
    return new Response(`Error fetching target URL: ${error.message}`, { status: 500 });
  }
}
