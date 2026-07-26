import * as assert from "node:assert/strict";
import { test } from "node:test";
import { getSafeRelativeRedirect } from "../lib/safe-redirect.ts";

test("Login akzeptiert ausschließlich lokale Redirect-Pfade", () => {
  assert.equal(getSafeRelativeRedirect("/meine-challenges?filter=aktiv"), "/meine-challenges?filter=aktiv");
  for (const unsafe of ["https://evil.example", "//evil.example", "/\\evil.example", "\\evil.example"]) {
    assert.equal(getSafeRelativeRedirect(unsafe), "/");
  }
});
