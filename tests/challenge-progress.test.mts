import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildChallengeHistory,
  calculateChallengeProgress,
  rankChallengeParticipants,
  selectChallengeRankingWindow
} from "../lib/challenge-progress.ts";

test("berechnet erfüllte und verpasste Tage inklusive Starttag", () => {
  const progress = calculateChallengeProgress({
    startedAt: "2026-07-10T08:00:00.000Z",
    checkInDates: ["2026-07-10", "2026-07-12"],
    today: "2026-07-12"
  });

  assert.equal(progress.elapsedDays, 3);
  assert.equal(progress.fulfilledDays, 2);
  assert.equal(progress.missedDays, 1);
  assert.equal(progress.completionRate, 67);
});

test("zählt die aktuelle Serie bis gestern weiter wenn heute noch offen ist", () => {
  const progress = calculateChallengeProgress({
    startedAt: "2026-07-08T08:00:00.000Z",
    checkInDates: ["2026-07-09", "2026-07-10", "2026-07-11"],
    today: "2026-07-12"
  });

  assert.equal(progress.currentStreak, 3);
  assert.equal(progress.longestStreak, 3);
  assert.equal(progress.hasCheckedInToday, false);
});

test("beendet die aktuelle Serie nach einem verpassten gestrigen Tag", () => {
  const progress = calculateChallengeProgress({
    startedAt: "2026-07-08T08:00:00.000Z",
    checkInDates: ["2026-07-08", "2026-07-09", "2026-07-12"],
    today: "2026-07-12"
  });

  assert.equal(progress.currentStreak, 1);
  assert.equal(progress.longestStreak, 2);
});

test("ignoriert doppelte und zukünftige Check-ins", () => {
  const progress = calculateChallengeProgress({
    startedAt: "2026-07-10T08:00:00.000Z",
    checkInDates: ["2026-07-10", "2026-07-10", "2026-07-13"],
    today: "2026-07-12"
  });

  assert.equal(progress.fulfilledDays, 1);
  assert.equal(progress.missedDays, 2);
});

test("sortiert nach aktueller Serie, Quote, erfüllten Tagen und Startdatum", () => {
  const ranked = rankChallengeParticipants([
    { id: "b", name: "B", startedAt: "2026-07-01T00:00:00.000Z", checkInDates: ["2026-07-11"] },
    { id: "a", name: "A", startedAt: "2026-07-10T00:00:00.000Z", checkInDates: ["2026-07-10", "2026-07-11", "2026-07-12"] },
    { id: "c", name: "C", startedAt: "2026-07-09T00:00:00.000Z", checkInDates: ["2026-07-10", "2026-07-11", "2026-07-12"] }
  ], "2026-07-12");

  assert.deepEqual(ranked.map((entry) => entry.id), ["a", "c", "b"]);
  assert.deepEqual(ranked.map((entry) => entry.rank), [1, 2, 3]);
});

test("zeigt die Top 20 und bei einer niedrigeren eigenen Position die direkten Nachbarn", () => {
  const entries = Array.from({ length: 30 }, (_, index) => ({
    id: `p${index + 1}`,
    rank: index + 1
  }));

  const window = selectChallengeRankingWindow(entries, "p24");

  assert.deepEqual(
    window.topEntries.map((entry) => entry.rank),
    Array.from({ length: 20 }, (_, index) => index + 1)
  );
  assert.deepEqual(window.nearbyEntries.map((entry) => entry.rank), [22, 23, 24, 25, 26]);
});

test("begrenzt das öffentliche Ranking auf Top 5 und zeigt die eigene Umgebung danach", () => {
  const entries = Array.from({ length: 30 }, (_, index) => ({
    id: `p${index + 1}`,
    rank: index + 1
  }));

  const window = selectChallengeRankingWindow(entries, "p8", 5);

  assert.deepEqual(window.topEntries.map((entry) => entry.rank), [1, 2, 3, 4, 5]);
  assert.deepEqual(window.nearbyEntries.map((entry) => entry.rank), [6, 7, 8, 9, 10]);
});

test("dupliziert bei Rang 21 keine bereits sichtbaren Top-20-Einträge", () => {
  const entries = Array.from({ length: 24 }, (_, index) => ({
    id: `p${index + 1}`,
    rank: index + 1
  }));

  const window = selectChallengeRankingWindow(entries, "p21");

  assert.deepEqual(window.nearbyEntries.map((entry) => entry.rank), [21, 22, 23]);
});

test("blendet den persönlichen Ranking-Ausschnitt innerhalb der Top 20 aus", () => {
  const entries = Array.from({ length: 24 }, (_, index) => ({
    id: `p${index + 1}`,
    rank: index + 1
  }));

  assert.deepEqual(selectChallengeRankingWindow(entries, "p8").nearbyEntries, []);
  assert.deepEqual(selectChallengeRankingWindow(entries).nearbyEntries, []);
});

test("baut einen begrenzten Challenge-Verlauf ohne Tage vor dem Start", () => {
  const history = buildChallengeHistory({
    startedAt: "2026-07-10T08:00:00.000Z",
    checkInDates: ["2026-07-10", "2026-07-12", "2026-08-01"],
    today: "2026-07-13",
    days: 7
  });

  assert.deepEqual(history, [
    { date: "2026-07-10", status: "fulfilled" },
    { date: "2026-07-11", status: "missed" },
    { date: "2026-07-12", status: "fulfilled" },
    { date: "2026-07-13", status: "open" }
  ]);
});

test("begrenzt den Challenge-Verlauf auf das gewünschte Zeitfenster", () => {
  const history = buildChallengeHistory({
    startedAt: "2026-06-01T08:00:00.000Z",
    checkInDates: ["2026-07-09", "2026-07-10", "2026-07-12"],
    today: "2026-07-12",
    days: 3
  });

  assert.deepEqual(history, [
    { date: "2026-07-10", status: "fulfilled" },
    { date: "2026-07-11", status: "missed" },
    { date: "2026-07-12", status: "fulfilled" }
  ]);
});
