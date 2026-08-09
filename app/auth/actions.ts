"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import {
  isEmailRawWithinLimits,
  isEmailWithinLimits,
  isLoginIdentifierWithinLimits,
  isPasswordWithinLimits,
  isUsernameRawWithinLimits
} from "@/domain/security/input-limits";
import { verifyLoginAttempt } from "@/domain/security/login-verification";
import { createSession, clearSession, hashPassword, verifyPassword } from "@/lib/auth";
import { createAccount, findAccountByLogin } from "@/lib/accounts";
import { startParticipationForUser } from "@/lib/participation-start";
import { allowRateLimitedAction, RATE_LIMIT_POLICIES } from "@/lib/rate-limit";
import { getRateLimitClientIp } from "@/lib/request-ip";
import { getSafeRelativeRedirect } from "@/lib/safe-redirect";
import { isValidUsername } from "@/lib/profile-name";
import { getLoginIdentifierKey, normalizeUsername } from "@/domain/accounts/username";

export type AuthFormState = {
  error: string;
};

const dummyPasswordHash = "challengehub-dummy-login-salt:f1870d662266312b7b9ee032263743438a3c68633328a42b3cc00ad0a9747a739e53abdfc1f6097501ed49dc5b8ad412b4bdcb9c8e7bdb3a4e5df8e70e669014";

export async function registerAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const rawEmail = String(formData.get("email") ?? "");
  const rawName = String(formData.get("name") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);

  if (!isEmailRawWithinLimits(rawEmail) || !isUsernameRawWithinLimits(rawName) || !isPasswordWithinLimits(password)) {
    return {
      error: "Bitte gib einen gültigen Benutzernamen, eine gültige E-Mail und mindestens 8 Zeichen Passwort ein."
    };
  }

  const email = rawEmail.trim().toLowerCase();
  const name = normalizeUsername(rawName);

  if (!isEmailWithinLimits(email) || !isValidUsername(name)) {
    return {
      error: "Bitte gib einen gültigen Benutzernamen, eine gültige E-Mail und mindestens 8 Zeichen Passwort ein."
    };
  }

  const clientIp = await getRateLimitClientIp();
  if (!allowRateLimitedAction([
    { policy: RATE_LIMIT_POLICIES.registerIp, identifier: clientIp },
    { policy: RATE_LIMIT_POLICIES.registerEmail, identifier: email }
  ])) {
    return { error: "Zu viele Registrierungsversuche. Bitte versuche es später erneut." };
  }

  const userId = randomUUID();
  const result = createAccount({
    id: userId,
    email,
    name,
    passwordHash: hashPassword(password)
  });

  if (result.status === "account_conflict") {
    return {
      error: "E-Mail-Adresse oder Benutzername ist bereits vergeben."
    };
  }

  await createSession(userId);
  const participationRedirect = await getParticipationRedirect(userId, next, formData);
  if (participationRedirect) {
    redirect(participationRedirect);
  }
  redirect(next);
}

export async function loginAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);

  if (!isLoginIdentifierWithinLimits(identifier) || !isPasswordWithinLimits(password)) {
    return {
      error: "E-Mail, Benutzername oder Passwort stimmt nicht."
    };
  }

  const clientIp = await getRateLimitClientIp();
  if (!allowRateLimitedAction([
    { policy: RATE_LIMIT_POLICIES.loginIp, identifier: clientIp },
    { policy: RATE_LIMIT_POLICIES.loginIdentifier, identifier: getLoginIdentifierKey(identifier) }
  ])) {
    return { error: "Zu viele Anmeldeversuche. Bitte versuche es später erneut." };
  }

  const user = findAccountByLogin(identifier);

  const loginVerified = verifyLoginAttempt({
    password,
    passwordHash: user?.passwordHash ?? null,
    dummyPasswordHash,
    verifyPassword
  });

  if (!user || !loginVerified) {
    return {
      error: "E-Mail, Benutzername oder Passwort stimmt nicht."
    };
  }

  await createSession(user.id);
  const participationRedirect = await getParticipationRedirect(user.id, next, formData);
  if (participationRedirect) {
    redirect(participationRedirect);
  }
  redirect(next);
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

function getSafeNext(formData: FormData) {
  return getSafeRelativeRedirect(formData.get("next"));
}

async function getParticipationRedirect(userId: string, next: string, formData: FormData) {
  const slug = String(formData.get("participationSlug") ?? "").trim();
  const challengePath = slug ? `/challenges/${encodeURIComponent(slug)}` : "";

  if (!slug || next !== challengePath) {
    return null;
  }

  try {
    const result = await startParticipationForUser({ userId, challengeSlug: slug });
    if (result.status === "challenge_not_available") {
      return null;
    }

    return `${challengePath}/teilnahme-bestaetigt?teilnahme=${encodeURIComponent(result.participationId)}`;
  } catch {
    return null;
  }
}
