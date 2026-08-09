export const RETENTION_NOTIFICATION_TYPES = [
  "daily_reminder",
  "weekly_recap",
  "mate_request",
  "mate_matched",
  "reactivation",
  "completion_badge"
] as const;

export type RetentionNotificationType = (typeof RETENTION_NOTIFICATION_TYPES)[number];

export type RetentionNotificationDraft = {
  sourceKey: string;
  type: RetentionNotificationType;
  title: string;
  body: string;
  href: string;
  occurredAt: string;
};

type ParticipationSnapshot = {
  id: string;
  challengeSlug: string;
  challengeTitle: string;
  startedAt: string;
  status: string;
  completedAt: string | null;
};

export type MateRetentionEvent = {
  key: string;
  kind: "request" | "matched";
  mateName: string;
  occurredAt: string;
};

export function deriveParticipationNotifications(input: {
  participation: ParticipationSnapshot;
  checkInDates: string[];
  today: string;
  mateEvents: MateRetentionEvent[];
}): RetentionNotificationDraft[] {
  const { participation, today } = input;
  const href = `/meine-challenges/${participation.id}`;
  const checkIns = new Set(input.checkInDates);
  const notifications: RetentionNotificationDraft[] = [];

  if (participation.status === "completed" && participation.completedAt) {
    notifications.push({
      sourceKey: `completion:${participation.id}:${participation.completedAt}`,
      type: "completion_badge",
      title: `${participation.challengeTitle} geschafft`,
      body: "Dein Abschluss ist gespeichert. Dein Fortschritt bleibt als persönlicher Erfolg sichtbar.",
      href,
      occurredAt: participation.completedAt
    });
  } else if (participation.status === "active" && !checkIns.has(today)) {
    const yesterday = shiftDate(today, -1);
    const startedOn = participation.startedAt.slice(0, 10);
    const missedYesterday = startedOn <= yesterday && !checkIns.has(yesterday);
    notifications.push(missedYesterday ? {
      sourceKey: `reactivation:${participation.id}:${today}`,
      type: "reactivation",
      title: "Heute ist ein neuer Einstieg",
      body: `Gestern blieb offen. Du kannst ${participation.challengeTitle} heute ohne Aufholzwang fortsetzen.`,
      href,
      occurredAt: `${today}T08:00:00.000Z`
    } : {
      sourceKey: `daily:${participation.id}:${today}`,
      type: "daily_reminder",
      title: "Dein heutiger Check-in ist offen",
      body: `${participation.challengeTitle}: Trag deinen Fortschritt heute direkt im Challenge-Raum ein.`,
      href,
      occurredAt: `${today}T08:00:00.000Z`
    });
  }

  if (participation.status === "active" && isSunday(today)) {
    const firstDay = shiftDate(today, -6);
    const fulfilledDays = input.checkInDates.filter((date) => date >= firstDay && date <= today).length;
    notifications.push({
      sourceKey: `weekly:${participation.id}:${today}`,
      type: "weekly_recap",
      title: "Dein Wochenrückblick",
      body: `Du warst bei ${participation.challengeTitle} an ${fulfilledDays} von 7 Tagen dabei.`,
      href,
      occurredAt: `${today}T17:00:00.000Z`
    });
  }

  for (const event of input.mateEvents) {
    notifications.push({
      sourceKey: event.key,
      type: event.kind === "request" ? "mate_request" : "mate_matched",
      title: event.kind === "request" ? "Neue ChallengeMate-Anfrage" : "Euer ChallengeMate-Match steht",
      body: event.kind === "request"
        ? `${event.mateName} möchte diese Challenge mit dir angehen.`
        : `${event.mateName} und du könnt euch jetzt direkt in der gemeinsamen Challenge orientieren.`,
      href: event.kind === "request" ? "/challenge-mate" : href,
      occurredAt: event.occurredAt
    });
  }

  return notifications;
}

export function getRetentionEmailEligibility(
  type: RetentionNotificationType,
  preferences: { emailReminderEnabled: boolean; weeklyRecapEnabled: boolean }
) {
  if (type === "weekly_recap") return preferences.weeklyRecapEnabled;
  return (type === "daily_reminder" || type === "reactivation" || type === "completion_badge")
    && preferences.emailReminderEnabled;
}

function isSunday(dateKey: string) {
  return new Date(`${dateKey}T12:00:00.000Z`).getUTCDay() === 0;
}

function shiftDate(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
