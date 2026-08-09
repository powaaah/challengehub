import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  areChallengeMateProfilesCompatible,
  parseChallengeMateProfileInput
} from "../domain/challenge-mates/challenge-mate.ts";

const remoteProfile = {
  userId: "alice",
  participationId: "alice-steps",
  challengeId: "steps",
  challengeSlug: "10000-schritte-am-tag",
  challengeTitle: "10.000 Schritte am Tag",
  userName: "Alice",
  goal: "Nach der Arbeit gemeinsam einchecken",
  availableFrom: "2026-08-10",
  availableUntil: "2026-09-10",
  mode: "remote" as const,
  location: null,
  active: true,
  updatedAt: "2026-08-09T12:00:00.000Z"
};

test("ChallengeMate-Profil validiert Ziel, Zeitraum und grobe Ortsangabe", () => {
  assert.deepEqual(parseChallengeMateProfileInput({
    participationId: "alice-steps",
    goal: "  Gemeinsam jeden Abend einchecken  ",
    availableFrom: "2026-08-10",
    availableUntil: "2026-09-10",
    mode: "local",
    location: "  Berlin  "
  }), {
    participationId: "alice-steps",
    goal: "Gemeinsam jeden Abend einchecken",
    availableFrom: "2026-08-10",
    availableUntil: "2026-09-10",
    mode: "local",
    location: "Berlin"
  });

  assert.equal(parseChallengeMateProfileInput({
    participationId: "alice-steps",
    goal: "Zu kurz",
    availableFrom: "2026-09-10",
    availableUntil: "2026-08-10",
    mode: "remote",
    location: ""
  }), null);
  assert.equal(parseChallengeMateProfileInput({
    participationId: "alice-steps",
    goal: "Gemeinsam jeden Abend einchecken",
    availableFrom: "2026-08-10",
    availableUntil: "2026-09-10",
    mode: "local",
    location: ""
  }), null);
});

test("Matching verlangt dieselbe Challenge, überlappenden Zeitraum und kompatibles Remote-/Ort-Modell", () => {
  assert.equal(areChallengeMateProfilesCompatible(remoteProfile, {
    ...remoteProfile,
    userId: "bob",
    participationId: "bob-steps",
    userName: "Bob",
    availableFrom: "2026-09-01",
    availableUntil: "2026-10-01"
  }), true);
  assert.equal(areChallengeMateProfilesCompatible(remoteProfile, {
    ...remoteProfile,
    userId: "bob",
    participationId: "bob-reading",
    challengeId: "reading"
  }), false);
  assert.equal(areChallengeMateProfilesCompatible(remoteProfile, {
    ...remoteProfile,
    userId: "bob",
    participationId: "bob-steps",
    availableFrom: "2026-09-11",
    availableUntil: "2026-10-01"
  }), false);
  assert.equal(areChallengeMateProfilesCompatible({
    ...remoteProfile,
    mode: "local",
    location: "Berlin"
  }, {
    ...remoteProfile,
    userId: "bob",
    participationId: "bob-steps",
    mode: "local",
    location: " berlin "
  }), true);
  assert.equal(areChallengeMateProfilesCompatible({
    ...remoteProfile,
    mode: "local",
    location: "Berlin"
  }, {
    ...remoteProfile,
    userId: "bob",
    participationId: "bob-steps",
    mode: "local",
    location: "Hamburg"
  }), false);
});
