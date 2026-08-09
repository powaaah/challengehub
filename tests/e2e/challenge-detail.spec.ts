import { expect, test } from "@playwright/test";

test("Challenge-Detailseite ordnet Entscheidung, Teilnahme und Belege verständlich", async ({ page }) => {
  await page.goto("/challenges/10000-schritte-am-tag");

  const expectedSections = ["hero", "facts-rules", "participation", "ranking", "activity", "seo"];
  const actualSections = await page.locator("[data-detail-section]").evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("data-detail-section"))
  );
  expect(actualSections).toEqual(expectedSections);

  await expect(page.getByRole("heading", { level: 2, name: "Auf einen Blick" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Regeln" })).toBeVisible();
  await expect(page.getByText("10.000 Schritte zählen pro Kalendertag.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Bereit für die Challenge?" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Top 5" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Letzte Aktivitäten" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Häufige Fragen" })).toBeVisible();
});

test("leeres öffentliches Ranking zeigt keine erfundene Tabellenzeile", async ({ page }) => {
  await page.goto("/challenges/30-tage-ohne-zucker");

  const ranking = page.locator('[data-detail-section="ranking"]');
  await expect(ranking.getByText("Noch keine Rangliste")).toBeVisible();
  await expect(ranking.getByRole("table")).toHaveCount(0);
  await expect(ranking).not.toContainText("frei");
});

test("sichtbare Regeln und FAQ stimmen mit den strukturierten Daten überein", async ({ page }) => {
  await page.goto("/challenges/10000-schritte-am-tag");

  const graph = await page.locator('script[type="application/ld+json"]').evaluate((element) =>
    JSON.parse(element.textContent ?? "{}") as { "@graph": Array<Record<string, unknown>> }
  );
  const howTo = graph["@graph"].find((entry) => entry["@type"] === "HowTo") as {
    step: Array<{ text: string }>;
  };
  const faq = graph["@graph"].find((entry) => entry["@type"] === "FAQPage") as {
    mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }>;
  };

  const visibleRules = await page.locator('[data-detail-section="facts-rules"] ol li').allTextContents();
  expect(howTo.step.map((step) => step.text)).toEqual(visibleRules);
  for (const item of faq.mainEntity) {
    await expect(page.getByText(item.name, { exact: true })).toBeVisible();
    await expect(page.getByText(item.acceptedAnswer.text, { exact: true })).toBeVisible();
  }
});

test("Detailseite bleibt mit langen Inhalten bei 320 Pixeln ohne horizontalen Überlauf", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/challenges/10000-schritte-am-tag");

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
