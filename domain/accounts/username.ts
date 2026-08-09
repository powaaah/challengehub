export const SYSTEM_ACCOUNT_NAME_KEY = "__challengehub_internal_system__";

export function normalizeUsername(name: string) {
  return name.trim().normalize("NFKC");
}

export function getUsernameKey(name: string) {
  return normalizeUsername(name)
    .toLocaleUpperCase("de-DE")
    .toLocaleLowerCase("de-DE");
}

export function getLoginIdentifierKey(identifier: string) {
  if (identifier.includes("@")) {
    return `email:${identifier.trim().toLowerCase()}`;
  }
  return `username:${getUsernameKey(identifier)}`;
}
