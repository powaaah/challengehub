"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { acceptChallengeInvitation } from "@/lib/challenge-invitations";
import { startParticipationForUser } from "@/lib/participation-start";

export async function acceptInvitationAction(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const fallback = slug ? `/challenges/${encodeURIComponent(slug)}` : "/challenges";
  const user = await getCurrentUser();

  if (!user) {
    redirect(fallback);
  }

  const result = acceptChallengeInvitation({ token, inviteeUserId: user.id });
  if (result.status === "accepted") {
    redirect(`/meine-challenges/${result.participationId}`);
  }

  const reason = result.status === "self_invitation" ? "selbst" : "ungueltig";
  redirect(`${fallback}?einladung=${reason}`);
}

export async function startChallengeAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();

  if (!slug) {
    redirect("/challenges");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth?next=/challenges/${encodeURIComponent(slug)}`);
  }

  let result;

  try {
    result = await startParticipationForUser({
      userId: user.id,
      challengeSlug: slug
    });
  } catch {
    redirect(`/challenges/${encodeURIComponent(slug)}`);
  }

  if (result.status === "challenge_not_available") {
    redirect(`/challenges/${encodeURIComponent(slug)}`);
  }

  redirect(
    `/challenges/${encodeURIComponent(slug)}/teilnahme-bestaetigt?teilnahme=${encodeURIComponent(result.participationId)}`
  );
}
