export function getSafeRelativeRedirect(value: unknown) {
  const path = String(value ?? "/");
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") ? path : "/";
}
