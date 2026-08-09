import * as assert from "node:assert/strict";
import { test } from "node:test";
import { resolveRateLimitClientIp } from "../domain/security/request-ip.ts";

test("Produktion verweigert IP-Limits ohne explizit vertrauten Proxy", () => {
  assert.throws(() => resolveRateLimitClientIp({
    nodeEnv: "production",
    trustProxy: "false",
    forwardedFor: "198.51.100.10",
    realIp: null
  }), /TRUST_PROXY/);
});

test("Rate-Limit verwendet nur die vom direkten Proxy zuletzt ergänzte XFF-Adresse", () => {
  assert.equal(resolveRateLimitClientIp({
    nodeEnv: "production",
    trustProxy: "true",
    forwardedFor: "203.0.113.77, 198.51.100.10",
    realIp: null
  }), "198.51.100.10");
});

test("Rate-Limit lehnt ungültige Proxy-IP-Header ab", () => {
  assert.throws(() => resolveRateLimitClientIp({
    nodeEnv: "production",
    trustProxy: "true",
    forwardedFor: "frei-waehlbar",
    realIp: null
  }), /client IP/);
});
