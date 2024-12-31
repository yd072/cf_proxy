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
    // 使用缓存避免频繁请求
    const cache = caches.default;
    const cacheKey = new Request(targetUrl, request);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    // 发送请求到目标站点
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Authorization': 'token YOUR_PERSONAL_ACCESS_TOKEN', // 替换为你的 GitHub Token
      },
    });

    if (!response.ok) {
      return new Response(`Error fetching target URL: ${response.statusText}`, { status: response.status });
    }

    const finalResponse = new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });

    // 将响应写入缓存
    await cache.put(cacheKey, finalResponse.clone());
    return finalResponse;
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
