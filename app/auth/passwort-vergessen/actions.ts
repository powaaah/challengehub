"use server";

import { after } from "next/server";
import { isEmailWithinLimits } from "@/domain/security/input-limits";
import { requestPasswordResetForEmail } from "@/lib/password-resets";
import { allowPasswordResetRequest } from "@/lib/password-reset-rate-limit";
import { getRateLimitClientIp } from "@/lib/request-ip";

export type PasswordResetRequestState = {
  error: string;
  message: string;
};

export async function requestPasswordResetAction(
  _state: PasswordResetRequestState,
  formData: FormData
): Promise<PasswordResetRequestState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!isEmailWithinLimits(email)) {
    return { error: "Bitte gib eine gültige E-Mail-Adresse ein.", message: "" };
  }

  const ip = await getRateLimitClientIp();
  if (allowPasswordResetRequest({ email, ip })) {
    after(() => requestPasswordResetForEmail(email));
  }
  return {
    error: "",
    message: "Falls ein Konto zu dieser E-Mail-Adresse existiert, erhältst du einen Link zum Zurücksetzen."
  };
}
