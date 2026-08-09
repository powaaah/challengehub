import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveParticipationNotifications,
  getRetentionEmailEligibility
} from "../domain/retention/retention-notification.ts";

test("aktive Teilnahme ohne heutigen Check-in erhält eine konkrete In-App-Erinnerung", () => {
  const notifications = deriveParticipationNotifications({
    participation: {
      id: "p1",
      challengeSlug: "10000-schritte-am-tag",
      challengeTitle: "10 000 Schritte am Tag Challenge",
      startedAt: "2026-08-01T08:00:00.000Z",
      status: "active",
      completedAt: null
    },
    checkInDates: ["2026-08-08"],
    today: "2026-08-09",
    mateEvents: []
  });

  assert.equal(notifications[0]?.type, "daily_reminder");
  assert.equal(notifications[0]?.href, "/meine-challenges/p1");
  assert.match(notifications[0]?.body ?? "", /heute/i);
});

test("ein verpasster Vortag erzeugt eine wertungsfreie Reaktivierung statt Druck", () => {
  const notifications = deriveParticipationNotifications({
    participation: {
      id: "p1",
      challengeSlug: "lesen",
      challengeTitle: "Jeden Tag lesen",
      startedAt: "2026-08-01T08:00:00.000Z",
      status: "active",
      completedAt: null
    },
    checkInDates: ["2026-08-07"],
    today: "2026-08-09",
    mateEvents: []
  });

  assert.equal(notifications[0]?.type, "reactivation");
  assert.doesNotMatch(notifications[0]?.body ?? "", /versagt|verloren|schlecht/i);
});

test("Sonntag liefert einen Rückblick über echte Check-ins der letzten sieben Tage", () => {
  const notifications = deriveParticipationNotifications({
    participation: {
      id: "p1",
      challengeSlug: "lesen",
      challengeTitle: "Jeden Tag lesen",
      startedAt: "2026-07-20T08:00:00.000Z",
      status: "active",
      completedAt: null
    },
    checkInDates: ["2026-08-03", "2026-08-05", "2026-08-08", "2026-08-09"],
    today: "2026-08-09",
    mateEvents: []
  });

  const recap = notifications.find((notification) => notification.type === "weekly_recap");
  assert.match(recap?.body ?? "", /4 von 7 Tagen/);
});

test("Abschluss und ChallengeMate-Ereignis erscheinen als echte Feed-Einträge", () => {
  const notifications = deriveParticipationNotifications({
    participation: {
      id: "p1",
      challengeSlug: "marathon",
      challengeTitle: "Marathon",
      startedAt: "2026-08-01T08:00:00.000Z",
      status: "completed",
      completedAt: "2026-08-09T10:00:00.000Z"
    },
    checkInDates: ["2026-08-09"],
    today: "2026-08-09",
    mateEvents: [{ key: "match:c1", kind: "matched", mateName: "Ada", occurredAt: "2026-08-08T12:00:00.000Z" }]
  });

  assert.deepEqual(notifications.map((notification) => notification.type), [
    "completion_badge",
    "mate_matched"
  ]);
  assert.match(notifications[0]?.title ?? "", /geschafft/i);
});

test("E-Mail-Jobs respektieren tägliches und wöchentliches Opt-in getrennt", () => {
  assert.equal(getRetentionEmailEligibility("daily_reminder", {
    emailReminderEnabled: true,
    weeklyRecapEnabled: false
  }), true);
  assert.equal(getRetentionEmailEligibility("weekly_recap", {
    emailReminderEnabled: true,
    weeklyRecapEnabled: false
  }), false);
  assert.equal(getRetentionEmailEligibility("mate_matched", {
    emailReminderEnabled: true,
    weeklyRecapEnabled: true
  }), false);
});
