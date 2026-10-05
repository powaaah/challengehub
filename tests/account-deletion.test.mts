import assert from "node:assert/strict";
import test from "node:test";
import { confirmAccountDeletion } from "../domain/accounts/account-deletion.ts";

test("Kontolöschung verlangt das aktuelle Passwort vor jedem Schreibzugriff", async () => {
  let deleted = false;
  const result = await confirmAccountDeletion({
    userId: "u1",
    password: "falsch",
    findAccount: () => ({ id: "u1", passwordHash: "stored" }),
    verifyPassword: () => false,
    deleteAccount: () => { deleted = true; return { status: "deleted" as const }; }
  });

  assert.deepEqual(result, { status: "invalid_password" });
  assert.equal(deleted, false);
});

test("gültige Re-Authentifizierung löscht genau das eigene Konto", async () => {
  let deletedUserId = "";
  const result = await confirmAccountDeletion({
    userId: "u1",
    password: "richtig",
    findAccount: () => ({ id: "u1", passwordHash: "stored" }),
    verifyPassword: (password, hash) => password === "richtig" && hash === "stored",
    deleteAccount: (userId) => { deletedUserId = userId; return { status: "deleted" as const }; }
  });

  assert.deepEqual(result, { status: "deleted" });
  assert.equal(deletedUserId, "u1");
});
