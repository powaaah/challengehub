import assert from "node:assert/strict";
import test from "node:test";
import {
  createRetentionUnsubscribeToken,
  verifyRetentionUnsubscribeToken
} from "../lib/retention-unsubscribe.ts";

test("signierter Abmeldelink bindet Nutzer und Teilnahme ohne rohe Datenbanktokens", () => {
  const token = createRetentionUnsubscribeToken(
    { userId: "u1", participationId: "p1" },
    "test-secret-with-enough-entropy"
  );

  assert.deepEqual(
    verifyRetentionUnsubscribeToken(token, "test-secret-with-enough-entropy"),
    { userId: "u1", participationId: "p1" }
  );
  assert.equal(verifyRetentionUnsubscribeToken(`${token}x`, "test-secret-with-enough-entropy"), null);
});
