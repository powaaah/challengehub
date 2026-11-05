// Separate mobile test service. No Next app or production database is started.
import http from 'node:http';
import { isIP } from 'node:net';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import guestDuels from '../preview/guest-duels.cjs';
import proxyCatalog from '../preview/catalog-proxy.cjs';

const origin = process.env.MOBILE_TEST_ORIGIN;
if (!origin || new URL(origin).origin !== origin || !origin.startsWith('https://')) throw Error('MOBILE_TEST_ORIGIN must be an HTTPS origin without a trailing slash.');
const databasePath = process.env.MOBILE_TEST_DATABASE;
if (!databasePath || !path.isAbsolute(databasePath)) throw Error('MOBILE_TEST_DATABASE must be an absolute path to the separate test database.');
const port = Number(process.env.MOBILE_TEST_PORT || 8097);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Invalid test port.');
const root = fileURLToPath(new URL('../dist-web/', import.meta.url));
await stat(path.join(root, 'index.html'));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer({ maxHeaderSize: 16384, requestTimeout: 15000, headersTimeout: 10000 }, async (request, response) => {
  response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', 'no-store');
  try {
    // Only a local TLS proxy may reach this loopback listener. The proxy must
    // overwrite X-Real-IP; never trust client-supplied X-Forwarded-For chains.
    const clientAddress = request.headers['x-real-ip'];
    if (request.headers.host !== new URL(origin).host || typeof clientAddress !== 'string' || !isIP(clientAddress)) { response.writeHead(400).end('Invalid proxy request'); return; }
    if (await guestDuels(request, response, { origin, databasePath, clientAddress })) return;
    if (await proxyCatalog(request, response)) return;
    if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405, {Allow:'GET, HEAD'}).end(); return; }
    const pathname = decodeURIComponent(new URL(request.url, origin).pathname);
    if (pathname === '/healthz') { response.writeHead(200, {'Content-Type':'application/json'}).end('{"status":"ok"}'); return; }
    const filename = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!filename.startsWith(root) || pathname === '/simulator') { response.writeHead(404).end(); return; }
    const data = await readFile(filename);
    response.writeHead(200, {'Content-Type':types[path.extname(filename)] || 'application/octet-stream'});
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'EISDIR') { response.writeHead(404).end(); return; }
    if (!response.headersSent) response.writeHead(500, {'Content-Type':'application/json'});
    response.end('{"error":"Testdienst vorübergehend nicht erreichbar."}');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Mobile test service listening on loopback port ${port}`));
for (const signal of ['SIGTERM','SIGINT']) process.on(signal, () => { server.close(); server.closeIdleConnections(); });
