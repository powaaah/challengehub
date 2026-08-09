import { expect, test, type Page } from "@playwright/test";

test.setTimeout(90_000);

test("zwei Teilnehmer werden nach Opt-in und gegenseitiger Bestätigung ChallengeMates", async ({ browser, baseURL }) => {
  const runId = Date.now();
  const aliceContext = await browser.newContext();
  const bobContext = await browser.newContext();
  const alice = await aliceContext.newPage();
  const bob = await bobContext.newPage();

  await registerAndStart(alice, baseURL ?? "", `Mate Alice ${runId}`, `mate-alice-${runId}@example.test`);
  await registerAndStart(bob, baseURL ?? "", `Mate Bob ${runId}`, `mate-bob-${runId}@example.test`);

  await alice.goto(`${baseURL}/challenge-mate`);
  await expect(alice.getByRole("heading", { name: "Finde deinen ChallengeMate" })).toBeVisible();
  await activateSearch(alice, "Alice möchte abends gemeinsam einchecken und motivieren.");
  await expect(alice.getByText("Noch keine passenden Vorschläge")).toBeVisible();

  await bob.goto(`${baseURL}/challenge-mate`);
  await activateSearch(bob, "Bob möchte abends gemeinsam einchecken und motivieren.");
  await expect(bob.getByText(`Mate Alice ${runId}`)).toBeVisible();

  await bob.getByRole("button", { name: `Interesse an Mate Alice ${runId} senden` }).click();
  await expect(bob.getByText("Anfrage gesendet")).toBeVisible();

  await alice.reload();
  await expect(alice.getByRole("heading", { name: "Offene Anfragen" })).toBeVisible();
  await alice.getByRole("button", { name: `Match mit Mate Bob ${runId} bestätigen` }).click();
  await expect(alice.getByRole("heading", { name: "Gemeinsam dranbleiben" })).toBeVisible();
  await expect(alice.getByRole("heading", { name: `Mate Bob ${runId}` })).toBeVisible();
  await expect(alice.getByRole("link", { name: "Gemeinsame Challenge öffnen" })).toHaveAttribute(
    "href",
    "/challenges/10000-schritte-am-tag"
  );

  await bob.reload();
  await expect(bob.getByRole("heading", { name: "Gemeinsam dranbleiben" })).toBeVisible();
  await bob.getByText("Melden oder blockieren", { exact: true }).click();
  await bob.getByLabel(`Meldegrund für Mate Alice ${runId}`).selectOption("spam");
  await bob.getByRole("button", { name: `Mate Alice ${runId} melden` }).click();
  await expect(bob.getByText("Meldung gespeichert")).toBeVisible();
  await bob.getByText("Melden oder blockieren", { exact: true }).click();
  await bob.getByLabel(`Mate Alice ${runId} wirklich blockieren`).check();
  await bob.getByRole("button", { name: `Mate Alice ${runId} blockieren` }).click();
  await expect(bob.getByText("Nutzer blockiert")).toBeVisible();
  await expect(bob.getByText(`Mate Alice ${runId}`)).toHaveCount(0);

  await aliceContext.close();
  await bobContext.close();
});

async function registerAndStart(page: Page, baseURL: string, name: string, email: string) {
  await page.goto(`${baseURL}/challenges/10000-schritte-am-tag`);
  await page.getByRole("button", { name: "Jetzt teilnehmen" }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();
  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(name);
  await registration.getByLabel("E-Mail-Adresse").fill(email);
  await registration.getByLabel("Passwort").fill("ChallengeHub-Test-2026");
  await registration.getByRole("button", { name: "Account erstellen" }).click();
  await expect(page).toHaveURL(/\/teilnahme-bestaetigt\?teilnahme=/, { timeout: 15_000 });
}

async function activateSearch(page: Page, goal: string) {
  await page.getByLabel("Aktive Challenge").selectOption({ label: "10 000 Schritte am Tag Challenge" });
  await page.getByLabel("Dein gemeinsames Ziel").fill(goal);
  await page.getByLabel("Verfügbar ab").fill("2026-08-10");
  await page.getByLabel("Verfügbar bis").fill("2026-09-10");
  await page.getByLabel("Remote").check();
  await page.getByRole("button", { name: "Suche aktivieren" }).click();
  await expect(page.getByText("Suche aktiv")).toBeVisible();
}
