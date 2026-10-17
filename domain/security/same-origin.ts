// Reverse proxies may terminate TLS. Compare Origin to the actual Host header,
// not the internal http://localhost URL reconstructed by the application server.
export function isSameOriginRequest(request: Request) {
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    return (
      ["http:", "https:"].includes(origin.protocol) &&
      origin.host === (request.headers.get("host") ?? new URL(request.url).host)
    );
  } catch {
    return false;
  }
}
