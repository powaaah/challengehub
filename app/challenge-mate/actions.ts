"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CHALLENGE_MATE_REPORT_REASONS,
  parseChallengeMateProfileInput
} from "@/domain/challenge-mates/challenge-mate";
import { hasUtf8ByteLengthAtMost } from "@/domain/security/input-limits";
import { getCurrentUser } from "@/lib/auth";
import {
  acceptChallengeMate,
  blockChallengeMate,
  deactivateChallengeMateProfile,
  reportChallengeMate,
  requestChallengeMate,
  saveChallengeMateProfile
} from "@/lib/challenge-mates";

export async function saveChallengeMateProfileAction(formData: FormData) {
  const user = await requireChallengeMateUser();
  const parsed = parseChallengeMateProfileInput({
    participationId: String(formData.get("participationId") ?? ""),
    goal: String(formData.get("goal") ?? ""),
    availableFrom: String(formData.get("availableFrom") ?? ""),
    availableUntil: String(formData.get("availableUntil") ?? ""),
    mode: String(formData.get("mode") ?? ""),
    location: String(formData.get("location") ?? "")
  });
  if (!parsed) redirectWithStatus("invalid_profile");

  const result = saveChallengeMateProfile({
    ...parsed,
    userId: user.id,
    updatedAt: new Date().toISOString()
  });
  redirectWithStatus(result.status === "saved"
    ? "profile_saved"
    : result.status === "active_match_conflict"
      ? "active_match_conflict"
      : "invalid_participation");
}

export async function deactivateChallengeMateProfileAction() {
  const user = await requireChallengeMateUser();
  deactivateChallengeMateProfile(user.id, new Date().toISOString());
  redirectWithStatus("profile_paused");
}

export async function requestChallengeMateAction(formData: FormData) {
  const user = await requireChallengeMateUser();
  const recipientUserId = readIdentifier(formData, "recipientUserId");
  if (!recipientUserId) redirectWithStatus("action_failed");
  const result = requestChallengeMate({
    id: randomUUID(),
    requesterUserId: user.id,
    recipientUserId,
    createdAt: new Date().toISOString()
  });
  redirectWithStatus(result.status === "requested" ? "request_sent" : "action_failed");
}

export async function acceptChallengeMateAction(formData: FormData) {
  const user = await requireChallengeMateUser();
  const connectionId = readIdentifier(formData, "connectionId");
  if (!connectionId) redirectWithStatus("action_failed");
  const result = acceptChallengeMate({
    connectionId,
    recipientUserId: user.id,
    acceptedAt: new Date().toISOString()
  });
  redirectWithStatus(result.status === "matched" ? "match_confirmed" : "action_failed");
}

export async function blockChallengeMateAction(formData: FormData) {
  const user = await requireChallengeMateUser();
  const blockedUserId = readIdentifier(formData, "mateUserId");
  const confirmed = formData.get("confirmBlock") === "yes";
  if (!blockedUserId || !confirmed) redirectWithStatus("action_failed");
  const result = blockChallengeMate({
    blockerUserId: user.id,
    blockedUserId,
    createdAt: new Date().toISOString()
  });
  redirectWithStatus(result.status === "blocked" ? "user_blocked" : "action_failed");
}

export async function reportChallengeMateAction(formData: FormData) {
  const user = await requireChallengeMateUser();
  const reportedUserId = readIdentifier(formData, "mateUserId");
  const reasonValue = String(formData.get("reason") ?? "");
  const reason = CHALLENGE_MATE_REPORT_REASONS.find((value) => value === reasonValue);
  const rawDetails = String(formData.get("details") ?? "").trim();
  const details = rawDetails || null;
  if (
    !reportedUserId ||
    !reason ||
    (details !== null && (!hasUtf8ByteLengthAtMost(details, 1_000) || Array.from(details).length > 250))
  ) {
    redirectWithStatus("action_failed");
  }
  const result = reportChallengeMate({
    id: randomUUID(),
    reporterUserId: user.id,
    reportedUserId,
    reason,
    details,
    createdAt: new Date().toISOString()
  });
  redirectWithStatus(result.status === "reported" ? "user_reported" : "action_failed");
}

async function requireChallengeMateUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/challenge-mate");
  return user;
}

function readIdentifier(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();
  return value && hasUtf8ByteLengthAtMost(value, 100) ? value : null;
}

function redirectWithStatus(status: string): never {
  revalidatePath("/challenge-mate");
  redirect(`/challenge-mate?status=${encodeURIComponent(status)}`);
}
