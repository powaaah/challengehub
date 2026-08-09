import * as assert from "node:assert/strict";
import { test } from "node:test";
import { verifyLoginAttempt } from "../domain/security/login-verification.ts";

test("unbekannte Login-Identifier durchlaufen denselben Passwort-Prüfpfad", () => {
  const calls: Array<{ password: string; hash: string }> = [];
  const result = verifyLoginAttempt({
    password: "falsches-passwort",
    passwordHash: null,
    dummyPasswordHash: "dummy-hash",
    verifyPassword: (password, hash) => {
      calls.push({ password, hash });
      return false;
    }
  });

  assert.equal(result, false);
  assert.deepEqual(calls, [{ password: "falsches-passwort", hash: "dummy-hash" }]);
});

test("bekannte Accounts werden ausschließlich gegen ihren gespeicherten Hash geprüft", () => {
  const calls: string[] = [];
  const result = verifyLoginAttempt({
    password: "richtiges-passwort",
    passwordHash: "account-hash",
    dummyPasswordHash: "dummy-hash",
    verifyPassword: (_password, hash) => {
      calls.push(hash);
      return hash === "account-hash";
    }
  });

  assert.equal(result, true);
  assert.deepEqual(calls, ["account-hash"]);
});
