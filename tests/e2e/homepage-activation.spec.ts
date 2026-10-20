import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Startseite erklärt den echten Freund-Challenge-Loop mit klaren CTAs", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", {
    level: 1,
    name: "Finde Deine Challenge und miss Dich mit anderen."
  })).toBeVisible();
  await expect(page.getByRole("link", { name: "Alle Challenges entdecken" }).first()).toHaveAttribute(
    "href",
    "/challenges"
  );
  await expect(page.getByRole("heading", { name: "So funktioniert’s" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gemeinsam verbindlich" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Privat und sicher starten" })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Find your challenge");
  await expect(page.locator("main")).not.toContainText("Unleash Your Potential");

  const variants = page.getByTestId("challenge-variant");
  await expect(variants).toHaveCount(3);
  await expect(variants.nth(0)).toContainText("Einmal-Challenge");
  await expect(variants.nth(1)).toContainText("Zeitraum-Challenge");
  await expect(variants.nth(2)).toContainText("Dauer-Challenges");
  await expect(page.getByLabel("Echte ChallengeHub Produktvorschau")).toHaveCount(0);
  await page.getByRole("link", { name: "Alle Challenges entdecken" }).click();
  await expect(page).toHaveURL(/\/challenges$/);
});

for (const width of [1440, 390, 320]) {
test(`Startseite bleibt bei ${width}px lesbar und zugänglich`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("challenge-variant")).toHaveCount(3);
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(scan.violations).toEqual([]);
  await page.screenshot({ path: `output/playwright/homepage-variants-${width}.png`, fullPage: true });
});
}
