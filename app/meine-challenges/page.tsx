import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MyChallengesApp } from "@/components/my-challenges-app";
import { getCurrentUser } from "@/lib/auth";
import { getParticipationsForUser } from "@/lib/participations";
import { getJourneyPeriod } from '@/domain/challenges/journey-period';

export const metadata: Metadata = {
  title: "Meine Challenges | ChallengeHub",
  description: "Deine serverseitig gespeicherten Challenge-Teilnahmen, Check-ins, Fortschritte und Rankings.",
  alternates: {
    canonical: "/meine-challenges"
  },
  robots: {
    index: false,
    follow: true
  }
};

export const dynamic = "force-dynamic";

export default async function MyChallengesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth?next=/meine-challenges");
  }

  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const participations = getParticipationsForUser(user.id).map(participation =>
    getJourneyPeriod(participation.challengeSlug, participation.startedAt, today).ended
      ? { ...participation, status: 'ended' }
      : participation);

  return <MyChallengesApp user={user} participations={participations} />;
}
