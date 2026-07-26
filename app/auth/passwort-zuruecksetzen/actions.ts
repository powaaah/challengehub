"use server";

import { resetPasswordForToken } from "@/lib/password-resets";

export type PasswordResetState = {
  error: string;
  success: boolean;
};

export async function resetPasswordAction(
  _state: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

  if (password.length < 8) {
    return { error: "Das neue Passwort muss mindestens 8 Zeichen lang sein.", success: false };
  }
  if (password !== passwordConfirmation) {
    return { error: "Die beiden Passwörter stimmen nicht überein.", success: false };
  }

  const result = resetPasswordForToken(token, password);
  if (result.status !== "reset") {
    return {
      error: "Der Link ist ungültig, abgelaufen oder wurde bereits verwendet.",
      success: false
    };
  }

  return { error: "", success: true };
}
