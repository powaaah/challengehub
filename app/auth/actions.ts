"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { createSession, clearSession, hashPassword, verifyPassword } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/db";

export type AuthFormState = {
  error: string;
};

export async function registerAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);

  if (!email.includes("@") || name.length < 2 || password.length < 8) {
    return {
      error: "Bitte gib Name, gueltige E-Mail und mindestens 8 Zeichen Passwort ein."
    };
  }

  if (findUserByEmail(email)) {
    return {
      error: "Mit dieser E-Mail gibt es bereits einen Account."
    };
  }

  const userId = randomUUID();
  createUser({
    id: userId,
    email,
    name,
    passwordHash: hashPassword(password)
  });
  await createSession(userId);
  redirect(next);
}

export async function loginAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);
  const user = findUserByEmail(email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return {
      error: "E-Mail oder Passwort stimmt nicht."
    };
  }

  await createSession(user.id);
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
