import { createHash, randomBytes, randomUUID, scryptSync } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { expect, test } from "@playwright/test";

test("Nutzer fordert neutral einen Link an und bestätigt seine E-Mail genau einmal", async ({ page }) => {
  const password = "ChallengeHub-Test-2026";
  const account = await seedUnverifiedAccount(page, password);
  await page.goto("/profil");

  await expect(page.getByText("Noch nicht bestätigt", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("button", { name: "Bestätigungslink erneut senden" }).click();
  await expect(page.getByText("Falls die Adresse noch unbestätigt ist, erhältst du einen neuen Link.")).toBeVisible();
  await page.getByRole("button", { name: "Bestätigungslink erneut senden" }).click();
  await page.getByRole("button", { name: "Bestätigungslink erneut senden" }).click();
  await page.getByRole("button", { name: "Bestätigungslink erneut senden" }).click();
  const rateDb = new DatabaseSync(getDbPath());
  const rateCount = rateDb.prepare(`
    SELECT COUNT(*) AS count FROM rate_limit_events WHERE scope = 'email-verification:user'
  `).get()?.count;
  rateDb.close();
  expect(rateCount).toBe(3);

  const token = randomBytes(32).toString("base64url");
  seedVerificationToken(account.userId, token);
  await page.goto(`/auth/email-bestaetigen?token=${encodeURIComponent(token)}`);
  await expect(page.getByRole("heading", { name: "E-Mail-Adresse bestätigt" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Zum Profil" })).toBeVisible();

  await page.goto(`/auth/email-bestaetigen?token=${encodeURIComponent(token)}`);
  await expect(page.getByRole("heading", { name: "Link nicht mehr gültig" })).toBeVisible();
  await page.goto("/profil");
  await expect(page.getByText("Bestätigt", { exact: true })).toBeVisible();
});

async function seedUnverifiedAccount(page: import("@playwright/test").Page, password: string) {
  await page.goto("/");
  const dbPath = getDbPath();
  const userId = randomUUID();
  const email = `verify-${Date.now()}@example.test`;
  const name = `Verify-${Date.now()}`;
  const token = randomBytes(32).toString("hex");
  const salt = randomBytes(16).toString("hex");
  const now = new Date().toISOString();
  const db = new DatabaseSync(dbPath);
  db.prepare(`
    INSERT INTO users (id, email, name, name_key, password_hash, created_at, email_verified_at)
    VALUES (?, ?, ?, ?, ?, ?, NULL)
  `).run(userId, email, name, name.toLowerCase(), `${salt}:${scryptSync(password, salt, 64).toString("hex")}`, now);
  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    randomUUID(), userId, createHash("sha256").update(token).digest("hex"),
    new Date(Date.now() + 60 * 60 * 1_000).toISOString(), now
  );
  db.close();
  await page.context().addCookies([{
    name: "challengehub_session",
    value: token,
    url: new URL(page.url()).origin,
    httpOnly: true,
    sameSite: "Lax"
  }]);
  return { userId, email };
}

function seedVerificationToken(userId: string, token: string) {
  const now = new Date();
  const db = new DatabaseSync(getDbPath());
  db.prepare(`
    INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at, used_at)
    VALUES (?, ?, ?, ?, ?, NULL)
  `).run(
    randomUUID(), userId, createHash("sha256").update(token).digest("hex"),
    new Date(now.getTime() + 30 * 60 * 1_000).toISOString(), now.toISOString()
  );
  db.close();
}

function getDbPath() {
  const dbPath = process.env.CHALLENGEHUB_DB_PATH;
  if (!dbPath) throw new Error("CHALLENGEHUB_DB_PATH fehlt im isolierten E2E-Lauf.");
  return dbPath;
}
