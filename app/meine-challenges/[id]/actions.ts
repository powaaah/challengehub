"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createCheckInForParticipation } from "@/lib/db";

export async function checkInTodayAction(formData: FormData) {
  const participationId = String(formData.get("participationId") ?? "").trim();

  if (!participationId) {
    redirect("/meine-challenges");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth?next=/meine-challenges");
  }

  createCheckInForParticipation({
    participationId,
    userId: user.id,
    date: getTodayKey()
  });

  revalidatePath(`/meine-challenges/${participationId}`);
}

function getTodayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
