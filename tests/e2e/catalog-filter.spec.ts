import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("filter drafts, keyboard rating, reset, bounds and combined results", async ({ page }) => {
  await page.goto("/challenges");
  const trigger = page.getByRole("button", { name: "Filter", exact: true });
  const dialog = page.getByRole("dialog", { name: "Challenges filtern" });
  const cards = page.getByTestId("challenge-card");
  await trigger.click();
  await dialog.getByRole("button", { name: "Einmalig", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(cards).toHaveCount(12);
  await trigger.click();
  await expect(dialog.getByRole("button", { name: "Einmalig", exact: true })).toHaveAttribute("aria-pressed", "false");
  await dialog.getByRole("button", { name: "Dauer-Challenge" }).click();
  await dialog.getByRole("button", { name: "Beginner", exact: true }).click();
  const slider = dialog.getByRole("slider", { name: "Mindestbewertung" });
  await slider.focus();
  await page.keyboard.press("Home");
  for (let i = 0; i < 7; i++) await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuetext", "Mindestens 4,0 Sterne");
  await dialog.getByRole("button", { name: "Challenges anzeigen" }).click();
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("10 000 Schritte");
  await trigger.click();
  await expect(slider).toHaveValue("7");
  await dialog.getByLabel("Mindestens", { exact: true }).selectOption("10");
  await dialog.getByLabel("Höchstens", { exact: true }).selectOption("5");
  await expect(dialog.getByRole("alert")).toContainText("Maximum");
  await expect(dialog.getByRole("button", { name: "Challenges anzeigen" })).toBeDisabled();
  await dialog.getByRole("button", { name: "Zurücksetzen" }).click();
  await expect(slider).toHaveValue("0");
  await expect(dialog.getByLabel("Mindestens", { exact: true })).toHaveValue("");
  await dialog.getByLabel("Mindestens", { exact: true }).selectOption("1000");
  await expect(dialog.getByText("Keine passenden Challenges. Passe deine Filter an.")).toBeVisible();
  await dialog.getByRole("button", { name: "Challenges anzeigen" }).click();
  await expect(cards).toHaveCount(0);
  await trigger.click();
  await dialog.getByRole("button", { name: "Zurücksetzen" }).click();
  await dialog.getByRole("button", { name: "Challenges anzeigen" }).click();
  await expect(cards).toHaveCount(12);
});

for (const width of [1440, 390, 320]) {
  test(`filter layout and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 740 });
    await page.goto("/challenges");
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Challenges filtern" });
    await dialog.getByRole("button", { name: "Advanced", exact: true }).click();
    const slider = dialog.getByRole("slider");
    await slider.focus();
    await page.keyboard.press("End");
    await expect(slider).toHaveAttribute("aria-valuetext", "Mindestens 5,0 Sterne");
    await expect(dialog.getByRole("button", { name: "Challenges anzeigen" })).toBeInViewport();
    const dimensions = await dialog.evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth, right: element.getBoundingClientRect().right }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
    expect(dimensions.right).toBeLessThanOrEqual(width);
    expect((await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `output/playwright/catalog-filter-${width}.png` });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Filter", exact: true })).toBeFocused();
  });
}
