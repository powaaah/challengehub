import { createHash, randomBytes, randomUUID, scryptSync } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { expect, request as createRequest, test } from "@playwright/test";

test("Benutzer ändert seinen eindeutigen Benutzernamen im Profil", async ({ page }) => {
  const unique = Date.now().toString();
  const oldName = `profil-${unique}`;
  const newName = `geändert-${unique}`;

  await page.goto("/");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();

  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(oldName);
  await registration.getByLabel("E-Mail-Adresse").fill(`${oldName}@example.test`);
  await registration.getByLabel("Passwort").fill("ChallengeHub-Test-2026");
  await registration.getByRole("button", { name: "Account erstellen" }).click();

  const profileButton = page.getByRole("button", { name: "Profilmenü öffnen" });
  await expect(profileButton).toBeVisible();
  await profileButton.click();
  await page.getByRole("menuitem", { name: "Profil bearbeiten" }).click();

  await expect(page).toHaveURL("/profil");
  await expect(page.getByRole("heading", { name: "Dein Profil" })).toBeVisible();
  await page.getByRole("textbox", { name: "Benutzername" }).fill(newName);
  await page.getByRole("button", { name: "Benutzername speichern" }).click();

  await expect(page.getByText("Benutzername gespeichert.")).toBeVisible();
  await page.getByRole("button", { name: "Profilmenü öffnen" }).click();
  await expect(page.getByRole("menu").getByText(newName, { exact: true })).toBeVisible();
});

test("anonyme Besucher erhalten keinen Zugriff auf die Profilseite", async ({ page }) => {
  await page.goto("/profil");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Dein Profil" })).toHaveCount(0);
});

test("anonymer Direktaufruf der Profil-Action verändert keinen Benutzernamen", async ({ page }) => {
  const unique = Date.now().toString();
  const name = `action-${unique}`;
  const capturedName = `captured-${unique}`;
  const tamperedName = `tampered-${unique}`;
  await register(page, name, `${name}@example.test`);
  await page.goto("/profil");

  const nameInput = page.getByRole("textbox", { name: "Benutzername" });
  const submit = page.getByRole("button", { name: "Benutzername speichern" });
  await nameInput.fill(capturedName);
  const requestPromise = page.waitForRequest((request) =>
    request.method() === "POST" && new URL(request.url()).pathname === "/profil"
  );
  const responsePromise = page.waitForResponse((response) =>
    response.request().method() === "POST" && new URL(response.url()).pathname === "/profil"
  );
  await submit.click();
  const actionRequest = await requestPromise;
  await responsePromise;
  const actionBody = actionRequest.postDataBuffer();
  expect(actionBody).not.toBeNull();
  await expect(nameInput).toHaveValue(capturedName);
  const tamperedBody = Buffer.from(actionBody!.toString("utf8").replace(capturedName, tamperedName));
  expect(tamperedBody.equals(actionBody!)).toBe(false);

  const anonymous = await createRequest.newContext({ baseURL: new URL(page.url()).origin });
  const requestHeaders = actionRequest.headers();
  const response = await anonymous.fetch("/profil", {
    method: "POST",
    data: tamperedBody,
    headers: Object.fromEntries(
      ["accept", "content-type", "next-action", "next-router-state-tree", "origin"]
        .flatMap((name) => requestHeaders[name] ? [[name, requestHeaders[name]]] : [])
    ),
    maxRedirects: 0
  });
  expect(response.status()).toBeLessThan(500);
  expect(response.headers()["x-action-redirect"] ?? response.headers().location)
    .toBe("/auth?next=/profil;push");
  await anonymous.dispose();

  await page.reload();
  await expect(nameInput).toHaveValue(capturedName);
});

test("Profilseite lehnt einen bereits vergebenen Unicode-Benutzernamen ab", async ({ page }) => {
  const unique = Date.now().toString();
  const reservedName = `Änne-${unique}`;

  await register(page, reservedName, `reserved-${unique}@example.test`);
  await page.getByRole("button", { name: "Profilmenü öffnen" }).click();
  await page.getByRole("menuitem", { name: "Logout" }).click();
  await register(page, `zweiter-${unique}`, `second-${unique}@example.test`);

  await page.getByRole("button", { name: "Profilmenü öffnen" }).click();
  await page.getByRole("menuitem", { name: "Profil bearbeiten" }).click();
  await page.getByRole("textbox", { name: "Benutzername" }).fill(reservedName.toLocaleLowerCase("de-DE"));
  await page.getByRole("button", { name: "Benutzername speichern" }).click();

  await expect(page.getByText("Dieser Benutzername ist bereits vergeben.", { exact: true })).toBeVisible();
});

test("Nutzer steuert öffentliche Sichtbarkeit, exportiert Daten und löscht das Konto nach Re-Authentifizierung", async ({ page }) => {
  const unique = Date.now().toString();
  const name = `privacy-${unique}`;
  const email = `${name}@example.test`;
  const password = "ChallengeHub-Test-2026";
  await seedAuthenticatedAccount(page, name, email, password);
  await page.goto("/profil");

  const ranking = page.getByLabel("Im öffentlichen Ranking anzeigen");
  const activity = page.getByLabel("Check-ins im öffentlichen Aktivitätsfeed anzeigen");
  const mate = page.getByLabel("Für ChallengeMate-Vorschläge auffindbar");
  await expect(ranking).not.toBeChecked();
  await expect(activity).not.toBeChecked();
  await expect(mate).not.toBeChecked();
  await ranking.check();
  await activity.check();
  await page.getByRole("button", { name: "Privatsphäre speichern" }).click();
  await expect(page.getByText("Privatsphäre gespeichert.")).toBeVisible();
  await page.reload();
  await expect(ranking).toBeChecked();
  await expect(activity).toBeChecked();
  await expect(mate).not.toBeChecked();

  const exportResponse = await page.request.get("/profil/export");
  expect(exportResponse.status()).toBe(200);
  expect(exportResponse.headers()["content-type"]).toContain("application/json");
  expect(exportResponse.headers()["content-disposition"]).toContain("attachment");
  const exported = await exportResponse.json();
  expect(exported.account.email).toBe(email);
  expect(exported.privacy.rankingVisible).toBe(true);
  expect(JSON.stringify(exported)).not.toMatch(/passwordHash|tokenHash/i);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await expect(page.getByRole("link", { name: "Datenexport herunterladen" })).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.getByText("Konto endgültig löschen", { exact: true }).click();
  await page.getByLabel("Ich habe die Folgen verstanden").check();
  await page.getByLabel("Aktuelles Passwort zur Kontolöschung").fill("falsches-passwort");
  await page.getByRole("button", { name: "Konto jetzt löschen" }).click();
  await expect(page.getByText("Das Passwort ist nicht korrekt.")).toBeVisible();

  await page.getByLabel("Ich habe die Folgen verstanden").check();
  await page.getByLabel("Aktuelles Passwort zur Kontolöschung").fill(password);
  await page.getByRole("button", { name: "Konto jetzt löschen" }).click();
  await expect(page).toHaveURL("/profil/geloescht");
  await expect(page.getByRole("heading", { name: "Dein Konto wurde gelöscht" })).toBeVisible();
  await page.goto("/profil");
  await expect(page).toHaveURL("/");
});

async function register(page: import("@playwright/test").Page, name: string, email: string) {
  await page.goto("/");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();
  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(name);
  await registration.getByLabel("E-Mail-Adresse").fill(email);
  await registration.getByLabel("Passwort").fill("ChallengeHub-Test-2026");
  await registration.getByRole("button", { name: "Account erstellen" }).click();
  await expect(page.getByRole("button", { name: "Profilmenü öffnen" })).toBeVisible();
}

async function seedAuthenticatedAccount(
  page: import("@playwright/test").Page,
  name: string,
  email: string,
  password: string
) {
  await page.goto("/");
  const dbPath = process.env.CHALLENGEHUB_DB_PATH;
  if (!dbPath) throw new Error("CHALLENGEHUB_DB_PATH fehlt im isolierten E2E-Lauf.");

  const userId = randomUUID();
  const token = randomBytes(32).toString("hex");
  const salt = randomBytes(16).toString("hex");
  const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1_000).toISOString();
  const db = new DatabaseSync(dbPath);
  db.prepare(`
    INSERT INTO users (id, email, name, name_key, password_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, email, name, name.toLowerCase(), passwordHash, now);
  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(randomUUID(), userId, createHash("sha256").update(token).digest("hex"), expiresAt, now);
  db.close();

  await page.context().addCookies([{
    name: "challengehub_session",
    value: token,
    url: new URL(page.url()).origin,
    httpOnly: true,
    sameSite: "Lax"
  }]);
}
