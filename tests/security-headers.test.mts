import * as assert from "node:assert/strict";
import { test } from "node:test";
import { buildSecurityHeaders } from "../lib/security-headers.mjs";

function asMap(production: boolean) {
  return new Map(buildSecurityHeaders(production).map(({ key, value }) => [key, value]));
}

test("Produktions-Header aktivieren HSTS, Clickjacking-Schutz und eine restriktive CSP", () => {
  const headers = asMap(true);

  assert.equal(headers.get("Strict-Transport-Security"), "max-age=63072000; includeSubDomains; preload");
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.equal(headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.match(headers.get("Permissions-Policy") ?? "", /camera=\(\)/);
  assert.match(headers.get("Content-Security-Policy") ?? "", /object-src 'none'/);
  assert.match(headers.get("Content-Security-Policy") ?? "", /frame-ancestors 'none'/);
  assert.match(headers.get("Content-Security-Policy") ?? "", /upgrade-insecure-requests/);
  assert.doesNotMatch(headers.get("Content-Security-Policy") ?? "", /unsafe-eval/);
});

test("Entwicklung erlaubt nur die für Next.js nötigen Lockerungen und setzt kein HSTS", () => {
  const headers = asMap(false);

  assert.equal(headers.has("Strict-Transport-Security"), false);
  assert.match(headers.get("Content-Security-Policy") ?? "", /script-src 'self' 'unsafe-inline' 'unsafe-eval'/);
  assert.doesNotMatch(headers.get("Content-Security-Policy") ?? "", /upgrade-insecure-requests/);
});
