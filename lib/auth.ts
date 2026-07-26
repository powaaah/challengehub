import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, scryptSync, timingSafeEqual, createHash, randomUUID } from "node:crypto";
import {
  createAccountSession,
  deleteAccountSessionByTokenHash,
  findAccountBySessionTokenHash
} from "./accounts";

const sessionCookieName = "challengehub_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
};

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }

  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1000);

  const result = createAccountSession({
    id: randomUUID(),
    userId,
    tokenHash,
    expiresAt: expiresAt.toISOString()
  });

  if (result.status !== "created") {
    throw new Error("Session could not be created.");
  }

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    deleteAccountSessionByTokenHash(hashSessionToken(token));
  }

  cookieStore.delete(sessionCookieName);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const user = findAccountBySessionTokenHash(hashSessionToken(token), new Date().toISOString());

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name
  };
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth?next=/challenges/neu");
  }

  return user;
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
