"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { requestPasswordResetForEmail } from "@/lib/password-resets";
import { allowPasswordResetRequest } from "@/lib/password-reset-rate-limit";

export type PasswordResetRequestState = {
  error: string;
  message: string;
};

export async function requestPasswordResetAction(
  _state: PasswordResetRequestState,
  formData: FormData
): Promise<PasswordResetRequestState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) {
    return { error: "Bitte gib eine gültige E-Mail-Adresse ein.", message: "" };
  }

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || requestHeaders.get("x-real-ip") || "unknown";
  if (allowPasswordResetRequest({ email, ip })) {
    after(() => requestPasswordResetForEmail(email));
  }
  return {
    error: "",
    message: "Falls ein Konto zu dieser E-Mail-Adresse existiert, erhältst du einen Link zum Zurücksetzen."
  };
}
