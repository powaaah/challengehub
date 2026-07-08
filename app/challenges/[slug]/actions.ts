"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { startParticipationForUser } from "@/lib/db";

const firstServerChallengeSlug = "10000-schritte-am-tag";

export async function startChallengeAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();

  if (!slug) {
    redirect("/challenges");
  }

  if (slug !== firstServerChallengeSlug) {
    redirect(`/challenges/${encodeURIComponent(slug)}`);
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth?next=/challenges/${encodeURIComponent(slug)}`);
  }

  let participation;

  try {
    participation = startParticipationForUser({
      userId: user.id,
      challengeSlug: slug
    });
  } catch {
    redirect(`/challenges/${encodeURIComponent(slug)}`);
  }

  redirect(`/meine-challenges/${participation.id}`);
}
