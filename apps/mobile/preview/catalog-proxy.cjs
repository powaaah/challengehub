// Only the public catalog is exposed. Never forward cookies or authorization.
module.exports = async function proxyCatalog(request, response) {
  const incoming = new URL(request.url, 'http://localhost');
  if (!/^\/api\/v1\/challenges(?:\/[^/]+)?$/.test(incoming.pathname)) return false;
  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET' }).end();
    return true;
  }
  try {
    const upstream = new URL(incoming.pathname + incoming.search, 'https://theovina.de');
    const result = await fetch(upstream, {
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    });
    const payload = await result.json();
    response.writeHead(result.status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify(payload));
  } catch {
    response.writeHead(502, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ apiVersion: 'v1', error: { code: 'catalog_unavailable', message: 'Der Katalog ist gerade nicht erreichbar.' } }));
  }
  return true;
};
