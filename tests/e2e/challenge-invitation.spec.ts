import { DatabaseSync } from "node:sqlite";
import { expect, test } from "@playwright/test";

test("eingeloggter Teilnehmer erstellt einen einmaligen Einladungslink", async ({ page }) => {
  const runId = Date.now();
  await page.goto("/challenges/10000-schritte-am-tag");
  await page.getByRole("button", { name: "Jetzt teilnehmen" }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();

  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(`Einladungs-Test-${runId}`);
  await registration.getByLabel("E-Mail-Adresse").fill(`invite-${runId}@example.test`);
  await registration.getByLabel("Passwort").fill("sicheres-test-passwort");
  await registration.getByRole("button", { name: "Account erstellen" }).click();

  await expect(page).toHaveURL(
    /\/challenges\/10000-schritte-am-tag\/teilnahme-bestaetigt\?teilnahme=[^&]+$/
  );
  await page.getByRole("link", { name: "Zum Dashboard" }).click();
  await expect(page).toHaveURL(/\/meine-challenges\/[^/]+$/);

  const reminderLink = page.getByRole("link", { name: "Kalender-Erinnerung herunterladen" });
  await expect(reminderLink).toBeVisible();
  const reminderResponse = await reminderLink.evaluate(async (element) => {
    const link = element as HTMLAnchorElement;
    const response = await fetch(link.href, { credentials: "same-origin" });
    return {
      status: response.status,
      contentType: response.headers.get("content-type"),
      body: await response.text()
    };
  });
  expect(reminderResponse.status).toBe(200);
  expect(reminderResponse.contentType).toContain("text/calendar");
  expect(reminderResponse.body).toContain("RRULE:FREQ=DAILY");

  await page.getByRole("button", { name: "Einladungslink erstellen" }).click();
  const inviteUrl = page.getByLabel("Dein Einladungslink");
  await expect(inviteUrl).toHaveValue(
    /^https:\/\/challengehub\.de\/challenges\/10000-schritte-am-tag\?einladung=[A-Za-z0-9_-]{43}$/
  );
  await expect(page.getByText("Der Link ist sieben Tage gültig und wird nur einmal angezeigt.")).toBeVisible();

  await page.getByRole("button", { name: "Kopieren" }).click();
  await expect(page.getByRole("button", { name: "Kopiert" })).toBeVisible();
});

test("Freund nimmt Einladung nach Registrierung an und sieht das gemeinsame Ranking", async ({ browser, baseURL }) => {
  const runId = Date.now();
  const inviterContext = await browser.newContext();
  const inviterPage = await inviterContext.newPage();

  await inviterPage.goto(`${baseURL}/challenges/10000-schritte-am-tag`);
  await inviterPage.getByRole("button", { name: "Jetzt teilnehmen" }).click();
  await inviterPage.getByRole("button", { name: "Registrieren", exact: true }).click();
  const inviterRegistration = inviterPage.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await inviterRegistration.getByLabel("Benutzername").fill(`Einlader ${runId}`);
  await inviterRegistration.getByLabel("E-Mail-Adresse").fill(`inviter-${runId}@example.test`);
  await inviterRegistration.getByLabel("Passwort").fill("sicheres-test-passwort");
  await inviterRegistration.getByRole("button", { name: "Account erstellen" }).click();
  await expect(inviterPage).toHaveURL(
    /\/challenges\/10000-schritte-am-tag\/teilnahme-bestaetigt\?teilnahme=[^&]+$/
  );
  await inviterPage.getByRole("link", { name: "Zum Dashboard" }).click();
  await inviterPage.getByRole("button", { name: "Einladungslink erstellen" }).click();
  const publicInviteUrl = await inviterPage.getByLabel("Dein Einladungslink").inputValue();
  const inviteUrl = publicInviteUrl.replace("https://challengehub.de", baseURL ?? "");

  const friendContext = await browser.newContext();
  const friendPage = await friendContext.newPage();
  await friendPage.goto(inviteUrl);

  await expect(friendPage).toHaveTitle(/10 000 Schritte am Tag Challenge/);
  await expect(friendPage.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://challengehub.de/challenges/10000-schritte-am-tag"
  );
  const jsonLd = await friendPage.locator('script[type="application/ld+json"]').evaluate((element) => element.innerHTML);
  expect(jsonLd).toContain('"@type":"Article"');
  expect(jsonLd).toContain('"@type":"HowTo"');
  await expect(friendPage.getByRole("heading", { name: "Gemeinsam in diese Challenge starten" })).toBeVisible();
  await friendPage.getByRole("button", { name: "Anmelden und Einladung annehmen" }).click();
  await friendPage.getByRole("button", { name: "Registrieren", exact: true }).click();

  const friendRegistration = friendPage.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await friendRegistration.getByLabel("Benutzername").fill(`Freund ${runId}`);
  await friendRegistration.getByLabel("E-Mail-Adresse").fill(`friend-${runId}@example.test`);
  await friendRegistration.getByLabel("Passwort").fill("sicheres-test-passwort");
  await friendRegistration.getByRole("button", { name: "Account erstellen" }).click();

  await expect(friendPage).toHaveURL(/\?einladung=[A-Za-z0-9_-]{43}$/);
  await friendPage.getByRole("button", { name: "Einladung annehmen", exact: true }).click();
  await expect(friendPage).toHaveURL(/\/meine-challenges\/[^/]+$/);
  await expect(friendPage.getByRole("heading", { name: "Ranking dieser Challenge" })).toBeVisible();
  await expect(friendPage.getByRole("table")).toBeVisible();
  await expect(friendPage.getByText(/^#\d+$/)).toBeVisible();

  await inviterContext.close();
  await friendContext.close();
});

test("Freund nimmt Einladung zu einer Community-Challenge an", async ({ browser, baseURL }) => {
  const runId = Date.now();
  const title = `Gemeinsam lesen ${runId}`;
  const slug = `gemeinsam-lesen-${runId}`;
  const inviterContext = await browser.newContext();
  const inviterPage = await inviterContext.newPage();

  await inviterPage.goto(`${baseURL}/challenges/neu`);
  await inviterPage.getByRole("button", { name: "Zum Login" }).click();
  await inviterPage.getByRole("button", { name: "Registrieren", exact: true }).click();
  const inviterRegistration = inviterPage.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await inviterRegistration.getByLabel("Benutzername").fill(`Community Einlader ${runId}`);
  await inviterRegistration.getByLabel("E-Mail-Adresse").fill(`community-inviter-${runId}@example.test`);
  await inviterRegistration.getByLabel("Passwort").fill("sicheres-test-passwort");
  await inviterRegistration.getByRole("button", { name: "Account erstellen" }).click();
  await expect(inviterPage.getByRole("button", { name: "Profilmenü öffnen" })).toBeVisible();
  await inviterPage.getByLabel("Titel").fill(title);
  await inviterPage.getByLabel("Aufgabe").fill("Jeden Tag gemeinsam zehn Seiten lesen");
  await inviterPage.getByLabel("Beschreibung").fill("Eine öffentliche Lese-Challenge für zwei Freunde.");
  await inviterPage.getByLabel("Regeln, eine pro Zeile").fill("Täglich zehn Seiten lesen");
  await inviterPage.getByRole("button", { name: "Zur Prüfung einreichen" }).click();
  await expect(inviterPage.getByRole("status")).toContainText("Moderation");
  const dbPath = process.env.CHALLENGEHUB_DB_PATH;
  expect(dbPath).toBeTruthy();
  const db = new DatabaseSync(dbPath as string);
  db.prepare("UPDATE challenges SET status = 'published' WHERE slug = ?").run(slug);
  db.close();
  await inviterPage.goto(`${baseURL}/challenges/${slug}`);
  expect(await inviterPage.locator("[data-detail-section]").evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("data-detail-section"))
  )).toEqual(["hero", "facts-rules", "participation", "ranking", "activity", "seo"]);
  await expect(inviterPage.getByRole("heading", { name: "Regeln", exact: true })).toBeVisible();
  await expect(inviterPage.getByRole("heading", { name: "Top 5", exact: true })).toBeVisible();
  await expect(inviterPage.getByText("Sicherheit zuerst.")).toHaveCount(0);
  await expect(inviterPage.getByRole("link", { name: "Sicherheitshinweise lesen" })).toHaveCount(0);
  await inviterPage.getByRole("button", { name: "Jetzt teilnehmen" }).first().click();
  await inviterPage.getByRole("link", { name: "Zum Dashboard" }).click();
  await inviterPage.getByRole("button", { name: "Einladungslink erstellen" }).click();
  const publicInviteUrl = await inviterPage.getByLabel("Dein Einladungslink").inputValue();
  const inviteUrl = publicInviteUrl.replace("https://challengehub.de", baseURL ?? "");

  const friendContext = await browser.newContext();
  const friendPage = await friendContext.newPage();
  await friendPage.goto(inviteUrl);
  await expect(friendPage.getByRole("heading", { name: "Gemeinsam in diese Challenge starten" })).toBeVisible();
  await friendPage.getByRole("button", { name: "Anmelden und Einladung annehmen" }).click();
  await friendPage.getByRole("button", { name: "Registrieren", exact: true }).click();
  const friendRegistration = friendPage.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await friendRegistration.getByLabel("Benutzername").fill(`Community Freund ${runId}`);
  await friendRegistration.getByLabel("E-Mail-Adresse").fill(`community-friend-${runId}@example.test`);
  await friendRegistration.getByLabel("Passwort").fill("sicheres-test-passwort");
  await friendRegistration.getByRole("button", { name: "Account erstellen" }).click();
  await friendPage.getByRole("button", { name: "Einladung annehmen", exact: true }).click();
  await expect(friendPage).toHaveURL(/\/meine-challenges\/[^/]+$/);
  await expect(friendPage.getByRole("heading", { name: title })).toBeVisible();
  await expect(friendPage.getByRole("heading", { name: "Ranking dieser Challenge" })).toBeVisible();

  await inviterContext.close();
  await friendContext.close();
});
