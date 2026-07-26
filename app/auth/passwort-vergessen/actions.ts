"use server";

import { requestPasswordResetForEmail } from "@/lib/password-resets";

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

  await requestPasswordResetForEmail(email);
  return {
    error: "",
    message: "Falls ein Konto zu dieser E-Mail-Adresse existiert, erhältst du einen Link zum Zurücksetzen."
  };
}
