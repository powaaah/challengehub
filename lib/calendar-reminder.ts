import { SITE_URL } from "./seo.ts";

type CalendarReminderInput = {
  participationId: string;
  challengeSlug: string;
  challengeTitle: string;
  challengeGoal: string;
  startDate: string;
  generatedAt: Date;
};

export function buildDailyChallengeReminder(input: CalendarReminderInput) {
  const date = requireDateKey(input.startDate);
  const timestamp = input.generatedAt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const challengeUrl = `${SITE_URL}/challenges/${encodeURIComponent(input.challengeSlug)}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ChallengeHub//Challenge-Erinnerung//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeCalendarText(input.participationId)}@challengehub.de`,
    `DTSTAMP:${timestamp}`,
    `DTSTART;TZID=Europe/Berlin:${date.replaceAll("-", "")}T180000`,
    "RRULE:FREQ=DAILY",
    `SUMMARY:${escapeCalendarText(input.challengeTitle)}`,
    `DESCRIPTION:${escapeCalendarText(`${input.challengeGoal} Täglicher Check-in auf ChallengeHub.`)}`,
    `URL:${challengeUrl}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeCalendarText(`${input.challengeTitle} durchführen`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join("\r\n");
}

function requireDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Startdatum muss im Format YYYY-MM-DD vorliegen.");
  }

  return value;
}

function escapeCalendarText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\r\n", "\\n")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}
