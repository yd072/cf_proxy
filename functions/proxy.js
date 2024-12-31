export async function onRequest({ request }) {
  const url = new URL(request.url);

  // 根据路径决定代理目标
  let targetUrl;
  if (url.pathname.startsWith('/proxy')) {
    targetUrl = 'https://raw.githubusercontent.com/yd072/tv/refs/heads/main/itvlist.txt';
  } else if (url.pathname.startsWith('/iptvs')) {
    targetUrl = 'https://raw.githubusercontent.com/yd072/iptv-api/refs/heads/master/output/result.txt';
  } else {
    return new Response('Not Found', { status: 404 });
  }

  try {
    // 设置请求头模拟浏览器
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...request.headers,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    // 返回目标站点的响应
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        'Access-Control-Allow-Origin': '*', // 添加 CORS 支持
      },
    });
  } catch (error) {
    // 捕获错误并返回调试信息
    return new Response(`Error fetching target URL: ${error.message}`, { status: 500 });
  }
}
