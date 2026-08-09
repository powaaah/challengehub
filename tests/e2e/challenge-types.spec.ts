import { DatabaseSync } from "node:sqlite";
import { expect, test } from "@playwright/test";

test.setTimeout(60_000);

test("kumulative Challenge durchläuft Erstellung, Mess-Check-in, Abschluss, Ranking und API", async ({ page }) => {
  const unique = Date.now();
  const title = `Kumulative Wiederholungen ${unique}`;
  const slug = `kumulative-wiederholungen-${unique}`;
  const userName = `Messwert-${String(unique).slice(-8)}`;

  await page.goto("/challenges/neu");
  await page.getByRole("button", { name: "Zum Login" }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();
  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(userName);
  await registration.getByLabel("E-Mail-Adresse").fill(`metric-${unique}@example.test`);
  await registration.getByLabel("Passwort").fill("sicheres-test-passwort");
  await registration.getByRole("button", { name: "Account erstellen" }).click();
  await expect(page.getByRole("button", { name: "Profilmenü öffnen" })).toBeVisible();
  await expect(page.getByText("Account erforderlich.")).toHaveCount(0);

  await page.getByLabel("Titel").fill(title);
  await page.getByLabel("Aufgabe").fill("Insgesamt 50 saubere Wiederholungen sammeln");
  await page.getByLabel("Beschreibung").fill("Eine messbare Challenge mit einem kumulativen Zielwert.");
  await page.getByLabel("Fortschrittsart").selectOption("cumulative_metric");
  await page.getByLabel("Einheit").selectOption("repetitions");
  await page.getByRole("spinbutton", { name: "Zielwert", exact: true }).fill("50");
  await page.getByLabel("Regeln, eine pro Zeile").fill("Nur saubere Wiederholungen zählen");
  expect(await page.locator("form").first().evaluate((form) => (form as HTMLFormElement).checkValidity())).toBeTruthy();
  await page.getByRole("button", { name: "Zur Prüfung einreichen" }).click();
  await expect(page.getByRole("status")).toContainText("Moderation");

  const dbPath = process.env.CHALLENGEHUB_DB_PATH;
  if (!dbPath) throw new Error("CHALLENGEHUB_DB_PATH fehlt im isolierten E2E-Lauf.");
  const db = new DatabaseSync(dbPath);
  const storedDefinition = db.prepare(`
    SELECT challenge_type AS type, metric_unit AS unit, target_value AS targetValue,
           frequency, measurement_direction AS direction,
           completion_criterion AS completionCriterion
    FROM challenges WHERE slug = ?
  `).get(slug);
  expect({ ...storedDefinition }).toEqual({
    type: "cumulative_metric",
    unit: "repetitions",
    targetValue: 50,
    frequency: "challenge_period",
    direction: "at_least",
    completionCriterion: "cumulative_target"
  });
  db.prepare("UPDATE challenges SET status = 'published' WHERE slug = ?").run(slug);
  db.close();

  await page.goto(`/challenges/${slug}`);
  await expect(page.getByText("Messwert sammeln", { exact: true })).toBeVisible();
  await expect(page.getByText("Mindestens 50 Wiederholungen", { exact: true })).toBeVisible();

  const apiResponse = await page.request.get(`/api/v1/challenges/${slug}`);
  expect(apiResponse.ok()).toBeTruthy();
  expect((await apiResponse.json()).data.definition).toEqual({
    type: "cumulative_metric",
    unit: "repetitions",
    targetValue: 50,
    frequency: "challenge_period",
    direction: "at_least",
    completionCriterion: "cumulative_target"
  });

  await page.getByRole("button", { name: "Jetzt teilnehmen" }).click();
  await page.getByRole("link", { name: "Zum Dashboard" }).click();
  await page.getByLabel("Wert hinzufügen").fill("60");
  await page.getByRole("button", { name: "Messwert speichern" }).click();

  await expect(page.getByRole("heading", { level: 2, name: "Beendet" })).toBeVisible();
  await expect(page.getByRole("complementary").getByText("60 von 50 Wiederholungen", { exact: true })).toBeVisible();
  await expect(page.locator('tr[aria-current="true"]')).toContainText("60 von 50 Wiederholungen");

  await page.goto(`/challenges/${slug}`);
  await expect(page.locator('[data-detail-section="ranking"]')).toContainText("60 von 50 Wiederholungen");
  await expect(page.locator('[data-detail-section="activity"]')).toContainText("60 Wiederholungen");
});
