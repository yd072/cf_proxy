export async function onRequest({ request }) {
  const url = new URL(request.url);

  // 根据路径选择目标 URL
  let targetUrl;
  if (url.pathname.startsWith('/proxy')) {
    targetUrl = 'https://raw.githubusercontent.com/yd072/tv/refs/heads/main/itvlist.txt';
  } else if (url.pathname.startsWith('/iptvs')) {
    targetUrl = 'https://raw.githubusercontent.com/yd072/iptv-api/refs/heads/master/output/result.txt';
  } else {
    // 如果路径不匹配，返回 404
    return new Response('Not Found', { status: 404 });
  }

  try {
    // 使用缓存来减轻目标服务器的负载
    const cache = caches.default;
    const cacheKey = new Request(targetUrl, request);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      console.log('Cache hit');
      return cachedResponse;
    }

    console.log('Cache miss, fetching from origin:', targetUrl);

    // 发起请求到目标 URL
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    // 如果目标返回 404 或其他错误状态码
    if (!response.ok) {
      console.error(`Error fetching target URL: ${response.statusText}`);
      return new Response(`Error fetching target URL: ${response.statusText}`, { status: response.status });
    }

    // 构建响应并缓存
    const finalResponse = new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        'Access-Control-Allow-Origin': '*', // 跨域支持
        'Cache-Control': 'max-age=3600',   // 可选：设置缓存时间
      },
    });

    await cache.put(cacheKey, finalResponse.clone()); // 缓存响应
    return finalResponse;
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
