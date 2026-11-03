import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
export class DuelRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
const key = "challengehub.guest.v1";
export function duelBase() {
  if (Platform.OS === "web") return window.location.origin;
  const url = process.env.EXPO_PUBLIC_GUEST_DUEL_URL;
  if (!url?.startsWith("https://"))
    throw Error(
      "Gemeinsame Duelle sind derzeit in der lokalen Browser-Vorschau verfügbar.",
    );
  return url.replace(/\/$/, "");
}
export async function readGuest() {
  return Platform.OS === "web"
    ? window.sessionStorage.getItem(key)
    : SecureStore.getItemAsync(key);
}
async function saveGuest(token: string) {
  if (Platform.OS === "web") window.sessionStorage.setItem(key, token);
  else await SecureStore.setItemAsync(key, token);
}
export async function duelRequest<T>(
  path: string,
  token: string | null,
  body?: unknown,
): Promise<T> {
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${duelBase()}/api/v1/guest-duels${path}`, {
      method: body === undefined ? "GET" : "POST",
      credentials: "omit",
      signal: controller.signal,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new DuelRequestError(
        data.error || "Duell nicht erreichbar.",
        response.status,
      );
    return data as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError")
      throw Error("Keine Antwort. Bitte erneut versuchen.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
let creating: Promise<string> | undefined;
export async function guestToken() {
  const existing = await readGuest();
  if (existing) return existing;
  if (!creating)
    creating = (async () => {
      const session = await duelRequest<{ token: string }>(
        "/sessions",
        null,
        {},
      );
      await saveGuest(session.token);
      return session.token;
    })().finally(() => {
      creating = undefined;
    });
  return creating;
}
