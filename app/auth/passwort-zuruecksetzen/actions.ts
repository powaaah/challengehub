"use server";

import { isPasswordWithinLimits, isResetTokenRawWithinLimits } from "@/domain/security/input-limits";
import { resetPasswordForToken } from "@/lib/password-resets";
import { allowRateLimitedAction, RATE_LIMIT_POLICIES } from "@/lib/rate-limit";
import { getRateLimitClientIp } from "@/lib/request-ip";

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

  if (!isResetTokenRawWithinLimits(token)) {
    return { error: "Der Link ist ungültig, abgelaufen oder wurde bereits verwendet.", success: false };
  }
  if (!isPasswordWithinLimits(password)) {
    return { error: "Das neue Passwort muss 8 bis 128 Bytes lang sein.", success: false };
  }
  if (password !== passwordConfirmation) {
    return { error: "Die beiden Passwörter stimmen nicht überein.", success: false };
  }

  const clientIp = await getRateLimitClientIp();
  if (!allowRateLimitedAction([
    { policy: RATE_LIMIT_POLICIES.passwordResetIp, identifier: clientIp },
    { policy: RATE_LIMIT_POLICIES.passwordResetToken, identifier: token }
  ])) {
    return {
      error: "Der Link ist ungültig, abgelaufen oder wurde bereits verwendet.",
      success: false
    };
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
