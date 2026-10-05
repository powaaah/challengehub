import * as assert from "node:assert/strict";
import { test } from "node:test";
import { privacyDataInventory } from "../data/privacy-data-inventory.ts";

test("Dateninventur deckt alle implementierten personenbezogenen Datenbereiche ab", () => {
  assert.deepEqual(
    privacyDataInventory.map((entry) => entry.id),
    [
      "account",
      "account-tokens",
      "challenges",
      "invitations",
      "challenge-mate",
      "notifications",
      "abuse-prevention",
      "operations"
    ]
  );
  assert.equal(new Set(privacyDataInventory.map((entry) => entry.id)).size, privacyDataInventory.length);
  for (const entry of privacyDataInventory) {
    assert.ok(entry.data.length > 20, `${entry.id}: Daten fehlen`);
    assert.ok(entry.purpose.length > 20, `${entry.id}: Zweck fehlt`);
    assert.ok(entry.recipients.length > 20, `${entry.id}: Empfänger fehlen`);
    assert.ok(entry.implementedLifecycle.length > 40, `${entry.id}: Lebenszyklus fehlt`);
  }
});

test("Dateninventur trennt implementierte Abläufe von offenen Freigabefristen", () => {
  const tokens = privacyDataInventory.find((entry) => entry.id === "account-tokens");
  const limits = privacyDataInventory.find((entry) => entry.id === "abuse-prevention");
  const operations = privacyDataInventory.find((entry) => entry.id === "operations");

  assert.match(tokens?.implementedLifecycle ?? "", /30 Minuten/);
  assert.match(tokens?.implementedLifecycle ?? "", /bis zur Kontolöschung/);
  assert.match(limits?.implementedLifecycle ?? "", /24 Stunden/);
  assert.match(limits?.implementedLifecycle ?? "", /Ein-Stunden-Fenster/);
  assert.equal(limits?.reviewRequired, true);
  assert.equal(operations?.reviewRequired, true);
  assert.match(operations?.implementedLifecycle ?? "", /keine automatische Löschfrist/);
});