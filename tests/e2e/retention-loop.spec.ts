import { expect, test } from "@playwright/test";

test("Teilnehmer steuert persistente Erinnerungen und seinen In-App-Feed", async ({ page }) => {
  const runId = Date.now();
  await page.goto("/challenges/10000-schritte-am-tag");
  await page.getByRole("button", { name: "Jetzt teilnehmen" }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();
  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(`Retention ${runId}`);
  await registration.getByLabel("E-Mail-Adresse").fill(`retention-${runId}@example.test`);
  await registration.getByLabel("Passwort").fill("ChallengeHub-Test-2026");
  await registration.getByRole("button", { name: "Account erstellen" }).click();

  await expect(page).toHaveURL(/\/teilnahme-bestaetigt\?teilnahme=/, { timeout: 15_000 });
  await page.getByRole("link", { name: "Zum Dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Dein Dranbleib-Feed" })).toBeVisible();
  await expect(page.getByText("Dein heutiger Check-in ist offen")).toBeVisible();

  await page.getByText("Erinnerungen einstellen", { exact: true }).click();
  await expect(page.getByLabel("In-App-Erinnerungen")).toBeChecked();
  await page.getByLabel("Tägliche E-Mail-Erinnerung").check();
  await page.getByLabel("Wöchentlicher Rückblick per E-Mail").check();
  await page.getByRole("button", { name: "Einstellungen speichern" }).click();
  await expect(page.getByText("Erinnerungen gespeichert")).toBeVisible();

  await page.getByRole("button", { name: "Als gelesen markieren" }).first().click();
  await expect(page.getByText("Meldung als gelesen markiert")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Tägliche E-Mail-Erinnerung")).toBeChecked();
  await expect(page.getByLabel("Wöchentlicher Rückblick per E-Mail")).toBeChecked();
});
