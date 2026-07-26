import * as assert from "node:assert/strict";
import { test } from "node:test";
import { buildDailyChallengeReminder } from "../lib/calendar-reminder.ts";

test("Kalender-Erinnerung wiederholt den Challenge-Termin täglich um 18 Uhr", () => {
  const calendar = buildDailyChallengeReminder({
    participationId: "participation-1",
    challengeSlug: "10000-schritte-am-tag",
    challengeTitle: "10 000 Schritte, jeden Tag",
    challengeGoal: "Gehen; einchecken",
    startDate: "2026-07-25",
    generatedAt: new Date("2026-07-25T08:30:15.000Z")
  });

  assert.match(calendar, /^BEGIN:VCALENDAR\r\n/);
  assert.match(calendar, /DTSTAMP:20260725T083015Z\r\n/);
  assert.match(calendar, /DTSTART;TZID=Europe\/Berlin:20260725T180000\r\n/);
  assert.match(calendar, /RRULE:FREQ=DAILY\r\n/);
  assert.match(calendar, /SUMMARY:10 000 Schritte\\, jeden Tag\r\n/);
  assert.match(calendar, /DESCRIPTION:Gehen\\; einchecken Täglicher Check-in auf ChallengeHub\.\r\n/);
  assert.match(calendar, /URL:https:\/\/challengehub\.de\/challenges\/10000-schritte-am-tag\r\n/);
  assert.match(calendar, /TRIGGER:-PT15M\r\n/);
  assert.match(calendar, /END:VCALENDAR\r\n$/);
});

test("Kalender-Erinnerung lehnt ein ungültiges Startdatum ab", () => {
  assert.throws(
    () => buildDailyChallengeReminder({
      participationId: "participation-1",
      challengeSlug: "challenge",
      challengeTitle: "Challenge",
      challengeGoal: "Ziel",
      startDate: "25.07.2026",
      generatedAt: new Date("2026-07-25T08:30:15.000Z")
    }),
    /YYYY-MM-DD/
  );
});
