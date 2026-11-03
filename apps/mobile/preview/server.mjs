import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist-web/', import.meta.url));
const preview = fileURLToPath(new URL('./index.html', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const filename = pathname === '/simulator' ? preview : path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (filename !== preview && !filename.startsWith(root)) {
      response.writeHead(403).end();
      return;
    }
    const data = await readFile(filename);
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(data);
  } catch {
    response.writeHead(404).end('Nicht gefunden');
  }
});
server.on('error', error => {
  console.error(`Vorschau konnte nicht starten: ${error.message}`);
  process.exitCode = 1;
});
server.listen(8096, '127.0.0.1', () => console.log('\nHandy-Vorschau öffnen: http://localhost:8096/simulator\nBeenden mit Strg+C.'));
