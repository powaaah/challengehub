import * as assert from "node:assert/strict";
import { test } from "node:test";
import { updateProfileName } from "../lib/profile-name.ts";

test("Profilname wird validiert und getrimmt gespeichert", () => {
  let storedName = "";
  const result = updateProfileName({
    userId: "u1",
    name: " Neuer Name ",
    updateName: (_userId, name) => {
      storedName = name;
      return { status: "updated" };
    }
  });

  assert.deepEqual(result, { status: "updated", name: "Neuer Name" });
  assert.equal(storedName, "Neuer Name");
});

test("ungültige Profilnamen werden ohne Schreibzugriff abgelehnt", () => {
  for (const name of [
    "x",
    "name@example.com",
    "a".repeat(31),
    "ab\ncd",
    "ab\u202Ecd",
    "\u200B\u200B",
    "----"
  ]) {
    let writes = 0;
    const result = updateProfileName({
      userId: "u1",
      name,
      updateName: () => {
        writes += 1;
        return { status: "updated" };
      }
    });

    assert.deepEqual(result, { status: "invalid_name" });
    assert.equal(writes, 0);
  }
});
