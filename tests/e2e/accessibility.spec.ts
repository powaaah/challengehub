import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/challenges", "/challenges/10000-schritte-am-tag", "/diese-seite-gibt-es-nicht"]) {
  test(`${path} hat keine automatisch erkennbaren schweren Barrierefreiheitsverstöße`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const severeViolations = results.violations.filter(({ impact }) =>
      impact === "serious" || impact === "critical"
    );

    expect(severeViolations, JSON.stringify(severeViolations, null, 2)).toEqual([]);
  });
}

test("Challenge-Detailseite schneidet die Info-Überschrift bei 400 Prozent nicht ab", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/challenges/10000-schritte-am-tag");

  const infoHeading = page.getByRole("heading", {
    level: 2,
    name: "Mehr zur 10 000 Schritte am Tag Challenge"
  });
  await expect(infoHeading).toBeVisible();
  expect(await infoHeading.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      overflow: style.overflow,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight
    };
  })).toMatchObject({ overflow: "visible" });
});

test("Challenge-Detailseite hält das leere Ranking bei 400 Prozent im Viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/challenges/30-tage-ohne-zucker");

  await expect(page.getByRole("heading", { level: 2, name: "Top 5" })).toBeVisible();
  await expect(page.getByText("Noch keine Rangliste")).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
