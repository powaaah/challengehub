import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("SEO-Inhalt steht im Server-HTML und bleibt auf Desktop und Mobil lesbar", async ({ page, request }) => {
  const response = await request.get("/challenges/100-liegestuetze-am-stueck");
  expect(response.ok()).toBeTruthy();
  expect(await response.text()).toContain("Erfolge ohne Zeit stehen dahinter gemeinsam auf einem Rang");
  await mkdir("output/playwright", { recursive: true });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/challenges/100-liegestuetze-am-stueck");
    const seo = page.locator('[data-detail-section="seo"]');
    await expect(seo).toContainText("100 Liegestütze am Stück: Ablauf und Wertung");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
    await page.screenshot({ path: `output/playwright/challenge-seo-${width}.png`, fullPage: true });
  }
});

test("Challenge-Detailseite ordnet Entscheidung, Teilnahme und Belege verständlich", async ({ page }) => {
  await page.goto("/challenges/10000-schritte-am-tag");

  const expectedSections = ["hero", "ranking", "seo"];
  const actualSections = await page.locator("[data-detail-section]").evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("data-detail-section"))
  );
  expect(actualSections).toEqual(expectedSections);

  await page.getByText("Vollständige Regeln", { exact: true }).click();
  await expect(page.getByText("10.000 Schritte zählen pro Kalendertag.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Ranking" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Letzte Aktivitäten" })).toHaveCount(0);
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

  await page.getByText("Vollständige Regeln", { exact: true }).click();
  const visibleRules = await page.locator('[data-detail-section="hero"] details ol li').allTextContents();
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
