import { expect, test } from "@playwright/test";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

test("gültiger Einmal-Link ändert das Passwort und beendet bestehende Sitzungen", async ({ page }) => {
  const unique = Date.now().toString();
  const email = `reset-e2e-${unique}@example.com`;
  const username = `Reset-${unique}`;
  const oldPassword = "altes-test-passwort";
  const newPassword = "neues-test-passwort";

  await page.goto("/");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("button", { name: "Registrieren" }).click();
  const dialog = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await dialog.getByLabel("Benutzername").fill(username);
  await dialog.getByLabel("E-Mail-Adresse").fill(email);
  await dialog.getByLabel("Passwort").fill(oldPassword);
  await dialog.getByRole("button", { name: "Account erstellen" }).click();
  await expect(page.getByRole("button", { name: "Profilmenü öffnen" })).toBeVisible();

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const databasePath = process.env.CHALLENGEHUB_DB_PATH;
  if (!databasePath) {
    throw new Error("CHALLENGEHUB_DB_PATH fehlt im Playwright-Testprozess.");
  }
  const db = new DatabaseSync(databasePath);
  try {
    const account = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: string };
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 30 * 60 * 1000);
    db.prepare(`
      INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at, used_at)
      VALUES (?, ?, ?, ?, ?, NULL)
    `).run(randomUUID(), account.id, tokenHash, expiresAt.toISOString(), createdAt.toISOString());
  } finally {
    db.close();
  }

  await page.goto(`/auth/passwort-zuruecksetzen?token=${encodeURIComponent(token)}`);
  await page.getByLabel("Neues Passwort", { exact: true }).fill(newPassword);
  await page.getByLabel("Neues Passwort wiederholen").fill(newPassword);
  await page.getByRole("button", { name: "Passwort speichern" }).click();
  await expect(page.getByText("Dein Passwort wurde geändert.")).toBeVisible();

  await page.goto("/meine-challenges");
  await expect(page).not.toHaveURL(/\/meine-challenges/);
  await page.getByRole("button", { name: "Login" }).click();
  let login = page.getByRole("dialog", { name: "Bei ChallengeHub anmelden" });
  await login.getByLabel("E-Mail-Adresse oder Benutzername").fill(email);
  await login.getByLabel("Passwort").fill(oldPassword);
  await login.getByRole("button", { name: "Anmelden" }).click();
  await expect(login.getByText("E-Mail, Benutzername oder Passwort stimmt nicht.")).toBeVisible();

  await login.getByRole("button", { name: "Anmeldedialog schließen" }).click();
  await page.getByRole("button", { name: "Login" }).click();
  login = page.getByRole("dialog", { name: "Bei ChallengeHub anmelden" });
  await login.getByLabel("E-Mail-Adresse oder Benutzername").fill(email);
  await login.getByLabel("Passwort").fill(newPassword);
  await login.getByRole("button", { name: "Anmelden" }).click();
  await expect(page.getByRole("button", { name: "Profilmenü öffnen" })).toBeVisible();
});
