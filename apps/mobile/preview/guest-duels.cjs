/* global __dirname */
const { pathToFileURL } = require("node:url");
const { Buffer } = require("node:buffer");
const path = require("node:path");
let service;
module.exports = async function guestDuels(request, response, options = {}) {
  if (!/^\/api\/v1\/guest-duels(?:\/|\?|$)/.test(request.url)) return false;
  if (!service)
    service = (async () => {
      const root = path.resolve(__dirname, "../../..");
      const { DatabaseSync } = require("node:sqlite");
      const filename = options.databasePath || path.join(root, ".data/guest-duels.sqlite");
      require("node:fs").mkdirSync(path.dirname(filename), {
        recursive: true,
      });
      const { GuestDuels } = await import(
        pathToFileURL(path.join(root, "lib/guest-duels.ts"))
      );
      const { guestDuelHttp } = await import(
        pathToFileURL(path.join(root, "lib/guest-duel-http.ts"))
      );
      return {
        api: guestDuelHttp,
        db: new GuestDuels(
          new DatabaseSync(filename),
        ),
      };
    })();
  const { api, db } = await service;
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16384) {
      response.writeHead(413).end();
      return true;
    }
    chunks.push(chunk);
  }
  const result = await api(
    new Request(`${options.origin || `http://${request.headers.host}`}${request.url}`, {
      method: request.method,
      headers: request.headers,
      ...(request.method === "POST" ? { body: Buffer.concat(chunks) } : {}),
    }),
    db,
    options.clientAddress || request.socket.remoteAddress,
  );
  response.writeHead(result.status, Object.fromEntries(result.headers));
  response.end(await result.text());
  return true;
};
