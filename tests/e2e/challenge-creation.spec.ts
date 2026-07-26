import { expect, test } from "@playwright/test";

test("eingeloggte Nutzer veroeffentlichen eine crawlbare Challenge", async ({ page }) => {
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
  await page.getByRole("button", { name: "Öffentlich speichern" }).click();

  await expect(page).toHaveURL(new RegExp(`/challenges/${slug}$`));
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://challengehub.de/challenges/${slug}`
  );
  const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
  expect(structuredData).toContain(title);

  await page.getByRole("button", { name: "Jetzt teilnehmen" }).first().click();
  await expect(page).toHaveURL(
    new RegExp(`/challenges/${slug}/teilnahme-bestaetigt\\?teilnahme=[^&]+$`)
  );
  await expect(page.getByRole("heading", { name: "Danke für deine Teilnahme." })).toBeVisible();
  await page.getByRole("link", { name: "Zum Dashboard" }).click();
  await expect(page).toHaveURL(/\/meine-challenges\/[^/]+$/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Die letzten 12 Wochen" })).toBeVisible();
  await expect(page.locator('[aria-label="Challenge-Verlauf nach Tagen"] li[title$="heute noch offen"]')).toHaveCount(1);

  await page.getByRole("button", { name: "Challenge heute durchgeführt" }).click();
  await expect(page.locator('[aria-label="Challenge-Verlauf nach Tagen"] li[title$="erledigt"]')).toHaveCount(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Die letzten 12 Wochen" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();

  await page.getByText("Challenge verlassen", { exact: true }).click();
  await expect(page.getByText("Deine bisherigen Check-ins bleiben als Verlauf erhalten.")).toBeVisible();
  await page.getByRole("button", { name: "Teilnahme endgültig beenden" }).click();
  await expect(page).toHaveURL(/\/meine-challenges\?verlassen=erfolgreich$/);
  const endedChallenge = page.getByRole("article").filter({ hasText: title });
  await expect(endedChallenge.getByText("Beendet", { exact: true })).toBeVisible();

  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain(
    `https://challengehub.de/challenges/${slug}`
  );
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
  await page.getByRole("button", { name: "Öffentlich speichern" }).click();

  await expect(page).toHaveURL(/\/challenges\/neu$/);
  const alert = page.getByRole("alert").filter({ hasText: "möglicherweise schon" });
  await expect(alert).toBeVisible();
  await expect(alert.getByRole("link", { name: "10 000 Schritte am Tag Challenge" })).toHaveAttribute(
    "href",
    "/challenges/10000-schritte-am-tag"
  );
});
