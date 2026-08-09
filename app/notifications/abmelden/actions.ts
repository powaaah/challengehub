"use server";

import { redirect } from "next/navigation";
import { disableRetentionEmail } from "@/lib/retention";
import { verifyRetentionUnsubscribeToken } from "@/lib/retention-unsubscribe";

export async function unsubscribeRetentionEmailAction(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const target = token.length <= 1000 ? verifyRetentionUnsubscribeToken(token) : null;
  if (!target) redirect("/notifications/abmelden?status=invalid");

  disableRetentionEmail(target);
  redirect("/notifications/abmelden?status=done");
}
