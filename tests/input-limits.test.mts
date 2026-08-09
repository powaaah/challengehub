import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  INPUT_LIMITS,
  hasUtf8ByteLengthAtMost,
  isEmailRawWithinLimits,
  isEmailWithinLimits,
  isPasswordWithinLimits,
  isRawChallengeInputWithinLimits,
  isResetTokenRawWithinLimits,
  isUsernameRawWithinLimits,
  validateChallengeInput
} from "../domain/security/input-limits.ts";

test("Passwörter werden vor der KDF auf 128 UTF-8-Bytes begrenzt", () => {
  assert.equal(isPasswordWithinLimits("acht-zeichen"), true);
  assert.equal(isPasswordWithinLimits("kurz"), false);
  assert.equal(isPasswordWithinLimits("a".repeat(INPUT_LIMITS.passwordBytes)), true);
  assert.equal(isPasswordWithinLimits("ä".repeat(INPUT_LIMITS.passwordBytes)), false);
});

test("E-Mail-Adressen werden vor Datenbankarbeit auf 254 UTF-8-Bytes begrenzt", () => {
  assert.equal(isEmailWithinLimits("stefan@example.com"), true);
  assert.equal(isEmailWithinLimits(`${"a".repeat(242)}@example.com`), true);
  assert.equal(isEmailWithinLimits(`${"a".repeat(243)}@example.com`), false);
  assert.equal(isEmailWithinLimits("kein-at-zeichen"), false);
});

test("UTF-8-Grenzen zählen Bytes statt nur JavaScript-Zeichen", () => {
  assert.equal(hasUtf8ByteLengthAtMost("ä", 2), true);
  assert.equal(hasUtf8ByteLengthAtMost("ä", 1), false);
});

test("Challenge-Inhalte besitzen zentrale Grenzen für Text und Listen", () => {
  const valid = {
    title: "30 Tage laufen",
    category: "Fitness",
    goal: "Jeden Tag laufen",
    description: "Eine klare Beschreibung",
    rules: ["Mindestens zehn Minuten"],
    tips: ["Langsam starten"]
  };

  assert.deepEqual(validateChallengeInput(valid), { valid: true });
  assert.deepEqual(validateChallengeInput({ ...valid, title: "x".repeat(INPUT_LIMITS.challengeTitleChars + 1) }), {
    valid: false,
    field: "title"
  });
  assert.deepEqual(validateChallengeInput({
    ...valid,
    rules: Array.from({ length: INPUT_LIMITS.challengeListItems + 1 }, () => "Regel")
  }), { valid: false, field: "rules" });
  assert.deepEqual(validateChallengeInput({
    ...valid,
    description: "ä".repeat(INPUT_LIMITS.challengeDescriptionBytes)
  }), { valid: false, field: "description" });
});

test("Rohgrenzen greifen vor Normalisierung, Listenaufteilung und HMAC", () => {
  assert.equal(isEmailRawWithinLimits("stefan@example.com"), true);
  assert.equal(isEmailRawWithinLimits("a".repeat(INPUT_LIMITS.emailBytes + 1)), false);
  assert.equal(isUsernameRawWithinLimits("Ｓtefan"), true);
  assert.equal(isUsernameRawWithinLimits("ä".repeat(61)), false);
  assert.equal(isResetTokenRawWithinLimits("a".repeat(43)), true);
  assert.equal(isResetTokenRawWithinLimits("a".repeat(65)), false);
  assert.equal(isRawChallengeInputWithinLimits({
    title: "Titel",
    category: "Fitness",
    goal: "Ziel",
    description: "Beschreibung",
    rules: "Regel eins\nRegel zwei",
    tips: "Tipp"
  }), true);
  assert.equal(isRawChallengeInputWithinLimits({
    title: "Titel",
    category: "Fitness",
    goal: "Ziel",
    description: "Beschreibung",
    rules: "x".repeat(INPUT_LIMITS.challengeListRawBytes + 1),
    tips: ""
  }), false);
});
