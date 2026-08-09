"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasUtf8ByteLengthAtMost } from "@/domain/security/input-limits";
import { getCurrentUser } from "@/lib/auth";
import { createChallengeInvitation } from "@/lib/challenge-invitations";
import { createCheckInForUser } from "@/lib/check-ins";
import { leaveParticipationForUser } from "@/lib/participation-start";
import { getParticipationByIdForUser } from "@/lib/participations";
import { SITE_URL } from "@/lib/seo";
import { allowRateLimitedAction, RATE_LIMIT_POLICIES } from "@/lib/rate-limit";

export type CreateInvitationState = {
  status: "idle" | "success" | "error";
  message: string;
  inviteUrl?: string;
};

export async function checkInTodayAction(formData: FormData) {
  const participationId = String(formData.get("participationId") ?? "").trim();

  if (!participationId) {
    redirect("/meine-challenges");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth?next=/meine-challenges");
  }

  if (!hasUtf8ByteLengthAtMost(participationId, 100) || !allowRateLimitedAction([
    { policy: RATE_LIMIT_POLICIES.checkIn, identifier: user.id }
  ])) {
    redirect("/meine-challenges");
  }

  const result = createCheckInForUser({
    participationId,
    userId: user.id,
    date: getTodayKey()
  });

  if (result === "participation_not_found") {
    redirect("/meine-challenges");
  }

  revalidatePath(`/meine-challenges/${participationId}`);
}

export async function leaveChallengeAction(formData: FormData) {
  const participationId = String(formData.get("participationId") ?? "").trim();
  const user = await getCurrentUser();

  if (!user || !participationId) {
    redirect("/meine-challenges");
  }

  const result = leaveParticipationForUser({ participationId, userId: user.id });
  if (result.status === "not_found") {
    redirect("/meine-challenges");
  }

  revalidatePath("/meine-challenges");
  revalidatePath(`/meine-challenges/${participationId}`);
  redirect("/meine-challenges?verlassen=erfolgreich");
}

export async function createInvitationAction(
  _previousState: CreateInvitationState,
  formData: FormData
): Promise<CreateInvitationState> {
  const participationId = String(formData.get("participationId") ?? "").trim();
  const user = await getCurrentUser();

  if (!user || !participationId) {
    return { status: "error", message: "Die Einladung konnte nicht erstellt werden." };
  }

  if (!hasUtf8ByteLengthAtMost(participationId, 100) || !allowRateLimitedAction([
    { policy: RATE_LIMIT_POLICIES.invitationCreate, identifier: user.id }
  ])) {
    return { status: "error", message: "Die Einladung konnte nicht erstellt werden." };
  }

  const participation = getParticipationByIdForUser({ participationId, userId: user.id });
  if (!participation || participation.status !== "active") {
    return { status: "error", message: "Diese Teilnahme kann keine Einladung erstellen." };
  }

  const result = createChallengeInvitation({
    inviterParticipationId: participation.id,
    inviterUserId: user.id
  });

  if (result.status !== "created") {
    return {
      status: "error",
      message: "Die Einladung konnte nicht erstellt werden. Bitte versuche es erneut."
    };
  }

  return {
    status: "success",
    message: "Der Link ist sieben Tage gültig und wird nur einmal angezeigt.",
    inviteUrl: `${SITE_URL}/challenges/${participation.challengeSlug}?einladung=${encodeURIComponent(result.token)}`
  };
}

function getTodayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
