import * as assert from "node:assert/strict";
import { test } from "node:test";
import { getLoginIdentifierKey } from "../domain/accounts/username.ts";

test("Login-Rate-Limit kanonisiert Benutzername exakt wie der Account-Lookup", () => {
  assert.equal(getLoginIdentifierKey("Ｓtefan"), getLoginIdentifierKey("stefan"));
  assert.equal(getLoginIdentifierKey(" Stefan "), getLoginIdentifierKey("STEFAN"));
});

test("Login-Rate-Limit kanonisiert E-Mail-Adressen unabhängig von Großschreibung", () => {
  assert.equal(getLoginIdentifierKey(" Stefan@Example.COM "), "email:stefan@example.com");
});
