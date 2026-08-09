import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/challenges", "/challenges/10000-schritte-am-tag"]) {
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
    name: "10 000 Schritte am Tag Challenge: Einordnung und Hinweise"
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

test("Challenge-Detailseite hält Rankingköpfe bei 400 Prozent getrennt", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/challenges/10000-schritte-am-tag");

  const headers = page.getByRole("columnheader");
  const participantBox = await headers.filter({ hasText: "Teilnehmer" }).boundingBox();
  const streakBox = await headers.filter({ hasText: "Streak" }).boundingBox();
  expect(participantBox).not.toBeNull();
  expect(streakBox).not.toBeNull();
  expect(participantBox!.x + participantBox!.width).toBeLessThanOrEqual(streakBox!.x);
  for (const label of ["Teilnehmer", "Streak"]) {
    const size = await headers.filter({ hasText: label }).evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth
    }));
    expect(size.scrollWidth, `${label} muss in seine Spalte passen`).toBeLessThanOrEqual(size.clientWidth);
  }

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
