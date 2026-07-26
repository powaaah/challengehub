"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { createSession, clearSession, hashPassword, verifyPassword } from "@/lib/auth";
import { createAccount, findAccountByLogin } from "@/lib/accounts";
import { startParticipationForUser } from "@/lib/participation-start";

export type AuthFormState = {
  error: string;
};

export async function registerAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);

  const isValidUsername = name.length >= 2 && name.length <= 30 && !name.includes("@");

  if (!email.includes("@") || !isValidUsername || password.length < 8) {
    return {
      error: "Bitte gib einen gültigen Benutzernamen, eine gültige E-Mail und mindestens 8 Zeichen Passwort ein."
    };
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
  const user = findAccountByLogin(identifier);

  if (!user || !verifyPassword(password, user.passwordHash)) {
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
  const next = String(formData.get("next") ?? "/");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
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
