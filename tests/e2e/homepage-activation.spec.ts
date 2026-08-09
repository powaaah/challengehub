import { expect, test } from "@playwright/test";

test("Startseite erklärt den echten Freund-Challenge-Loop mit klaren CTAs", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", {
    level: 1,
    name: "Starte eine Challenge. Bleib gemeinsam dran."
  })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kostenlos Challenge starten" }).first()).toHaveAttribute(
    "href",
    "/challenges/10000-schritte-am-tag"
  );
  await expect(page.getByRole("heading", { name: "So funktioniert’s" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gemeinsam verbindlich" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Privat und sicher starten" })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Find your challenge");
  await expect(page.locator("main")).not.toContainText("Unleash Your Potential");

  const starterLinks = page.locator('[data-testid="starter-challenge"]');
  await expect(starterLinks).toHaveCount(3);
  expect(await starterLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual([
    "/challenges/10000-schritte-am-tag",
    "/challenges/30-tage-ohne-zucker",
    "/challenges/100-tage-ohne-soziale-medien"
  ]);
});

test("Startseiten-Hauptführung bleibt bei 390 Pixeln ohne horizontalen Überlauf", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
