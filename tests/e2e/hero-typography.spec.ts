import { expect, test } from "@playwright/test";

for (const width of [1280, 1024, 821, 390, 320]) {
  test(`Hero und Login behalten bei ${width}px ganze Wörter`, async ({ page }) => {
    await page.setViewportSize({ width, height: 720 });
    await page.goto("/");

    const words = await page.locator("main h1").evaluate((heading) => {
      const text = heading.firstChild;
      if (!text) return [];
      return [...(text.textContent ?? "").matchAll(/\S+/g)].map((match) => {
        const range = document.createRange();
        range.setStart(text, match.index);
        range.setEnd(text, match.index + match[0].length);
        return { word: match[0], lines: range.getClientRects().length };
      });
    });
    expect(words.length).toBeGreaterThan(0);
    expect(words.every(({ lines }) => lines === 1)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

    const cta = page.getByRole("link", { name: "Kostenlos Challenge starten" }).first();
    await expect(cta).toBeVisible();
    if (width >= 821) {
      const box = await cta.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y + box!.height).toBeLessThanOrEqual(720);
    }

    if (width <= 390) {
      await page.getByRole("button", { name: "Navigation öffnen" }).click();
      await page.getByRole("button", { name: "Login", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Bei ChallengeHub anmelden" });
      await expect(dialog.getByLabel("E-Mail-Adresse oder Benutzername")).toBeFocused();
      const titleLines = await dialog.locator("h2").evaluate((heading) => {
        const text = heading.firstChild;
        if (!text) return [];
        return [...(text.textContent ?? "").matchAll(/\S+/g)].map((match) => {
          const range = document.createRange();
          range.setStart(text, match.index);
          range.setEnd(text, match.index + match[0].length);
          return range.getClientRects().length;
        });
      });
      expect(titleLines.length).toBeGreaterThan(0);
      expect(titleLines.every((lines) => lines === 1)).toBe(true);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
  });
}
