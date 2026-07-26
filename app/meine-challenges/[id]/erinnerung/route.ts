import { getCurrentUser } from "@/lib/auth";
import { buildDailyChallengeReminder } from "@/lib/calendar-reminder";
import { getParticipationByIdForUser } from "@/lib/participations";

export const dynamic = "force-dynamic";

type ReminderRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ReminderRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Anmeldung erforderlich.", {
      status: 401,
      headers: { "Cache-Control": "private, no-store" }
    });
  }

  const { id } = await params;
  const participation = getParticipationByIdForUser({ participationId: id, userId: user.id });

  if (!participation || participation.status !== "active") {
    return new Response("Aktive Teilnahme nicht gefunden.", {
      status: 404,
      headers: { "Cache-Control": "private, no-store" }
    });
  }

  const calendar = buildDailyChallengeReminder({
    participationId: participation.id,
    challengeSlug: participation.challengeSlug,
    challengeTitle: participation.challengeTitle,
    challengeGoal: participation.challengeGoal,
    startDate: getTodayKey(),
    generatedAt: new Date()
  });

  return new Response(calendar, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'attachment; filename="challengehub-erinnerung.ics"',
      "Content-Type": "text/calendar; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

function getTodayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
