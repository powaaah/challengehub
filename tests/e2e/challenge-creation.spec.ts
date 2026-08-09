import { expect, test } from "@playwright/test";

test("neue Community-Challenge wartet unsichtbar auf Moderation", async ({ page }) => {
  const uniqueSuffix = Date.now();
  const title = `Morgenlicht ${uniqueSuffix}`;
  const slug = `morgenlicht-${uniqueSuffix}`;

  await page.goto("/challenges/neu");
  await page.getByRole("button", { name: "Zum Login" }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();

  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(`Repository Test ${uniqueSuffix}`);
  await registration.getByLabel("E-Mail-Adresse").fill(`challenge-write-${Date.now()}@example.test`);
  await registration.getByLabel("Passwort").fill("sicheres-test-passwort");
  await registration.getByRole("button", { name: "Account erstellen" }).click();

  await expect(page).toHaveURL(/\/challenges\/neu$/);
  await expect(page.getByRole("button", { name: "Profilmenü öffnen" })).toBeVisible();
  await expect(page.getByText("Account erforderlich.")).toHaveCount(0);
  await page.getByLabel("Titel").fill(title);
  await page.getByLabel("Aufgabe").fill("Jeden Morgen zehn Minuten nach draußen gehen");
  await page.getByLabel("Beschreibung").fill(
    "Eine klare Morgenroutine mit Tageslicht für einen bewussten Start in den Tag."
  );
  await page.getByLabel("Regeln, eine pro Zeile").fill("Innerhalb der ersten Stunde starten");
  await page.getByLabel("Tipps, optional eine pro Zeile").fill("Schuhe am Vorabend bereitstellen");
  await page.getByRole("button", { name: "Zur Prüfung einreichen" }).click();

  await expect(page).toHaveURL(/\/challenges\/neu$/);
  await expect(page.getByRole("status")).toContainText("Moderation");
  const pendingPage = await page.request.get(`/challenges/${slug}`);
  expect(pendingPage.status()).toBe(404);
  expect(await pendingPage.text()).toContain("Seite nicht gefunden");

  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).not.toContain(`https://challengehub.de/challenges/${slug}`);
});

test("bestehende Challenge wird vor einer doppelten Veroeffentlichung verlinkt", async ({ page }) => {
  const uniqueSuffix = Date.now();
  await page.goto("/challenges/neu");
  await page.getByRole("button", { name: "Zum Login" }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();

  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(`Duplikat Test ${uniqueSuffix}`);
  await registration.getByLabel("E-Mail-Adresse").fill(`duplicate-${uniqueSuffix}@example.test`);
  await registration.getByLabel("Passwort").fill("sicheres-test-passwort");
  await registration.getByRole("button", { name: "Account erstellen" }).click();
  await expect(page.getByRole("button", { name: "Profilmenü öffnen" })).toBeVisible();
  await expect(page.getByText("Account erforderlich.")).toHaveCount(0);

  await page.getByLabel("Titel").fill("10.000 Schritte am Tag");
  await page.getByLabel("Aufgabe").fill("Jeden Tag 10.000 Schritte gehen");
  await page.getByLabel("Beschreibung").fill("Eine bereits vorhandene Challenge nicht doppelt anlegen.");
  await page.getByLabel("Regeln, eine pro Zeile").fill("Täglich Schritte erfassen");
  await page.getByRole("button", { name: "Zur Prüfung einreichen" }).click();

  await expect(page).toHaveURL(/\/challenges\/neu$/);
  const alert = page.getByRole("alert").filter({ hasText: "möglicherweise schon" });
  await expect(alert).toBeVisible();
  await expect(alert.getByRole("link", { name: "10 000 Schritte am Tag Challenge" })).toHaveAttribute(
    "href",
    "/challenges/10000-schritte-am-tag"
  );
});

test("Challenge-Erstellung lehnt überlange Inhalte vor dem Speichern ab", async ({ page }) => {
  const uniqueSuffix = Date.now();
  await page.goto("/challenges/neu");
  await page.getByRole("button", { name: "Zum Login" }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();

  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(`Grenzwert Test ${uniqueSuffix}`);
  await registration.getByLabel("E-Mail-Adresse").fill(`limits-${uniqueSuffix}@example.test`);
  await registration.getByLabel("Passwort").fill("sicheres-test-passwort");
  await registration.getByRole("button", { name: "Account erstellen" }).click();
  await expect(page.getByRole("button", { name: "Profilmenü öffnen" })).toBeVisible();

  await page.getByLabel("Titel").fill(`Grenzwert ${uniqueSuffix}`);
  await page.getByLabel("Aufgabe").fill("Jeden Tag eine sichere Aufgabe erledigen");
  const description = page.getByLabel("Beschreibung");
  await description.evaluate((element) => element.removeAttribute("maxlength"));
  await description.fill("x".repeat(2_001));
  await page.getByLabel("Regeln, eine pro Zeile").fill("Eine gültige Regel");
  await page.getByRole("button", { name: "Zur Prüfung einreichen" }).click();

  await expect(page).toHaveURL(/\/challenges\/neu$/);
  await expect(page.getByRole("alert").filter({ hasText: "Textgrenzen" })).toBeVisible();
});
