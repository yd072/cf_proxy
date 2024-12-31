export async function onRequest({ request }) {
  const url = new URL(request.url);
  
  // 根据路径代理到不同的目标站点
  let targetUrl;
  if (url.pathname.startsWith('/proxy')) {
    targetUrl = 'https://raw.githubusercontent.com/yd072/tv/refs/heads/main/itvlist.txt';
  } else if (url.pathname.startsWith('/iptvs')) {
    targetUrl = 'https://raw.githubusercontent.com/yd072/iptv-api/refs/heads/master/output/result.txt';
  
  } else {
    return new Response('Not Found', { status: 404 });
  }

  // 转发请求到目标站点
  const response = await fetch(targetUrl, { method: request.method });
  return new Response(await response.text(), {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'text/plain',
    },
  });
}
