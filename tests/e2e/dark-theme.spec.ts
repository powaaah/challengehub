import AxeBuilder from "@axe-core/playwright";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { expect, test, type Page } from "@playwright/test";

async function signInThemeFixture(page: Page) {
  const dbPath = process.env.CHALLENGEHUB_DB_PATH;
  if (!dbPath) throw new Error("Isolierte E2E-Datenbank fehlt.");
  const id = randomUUID();
  const name = `Theme ${id.slice(0, 8)}`;
  const token = randomBytes(32).toString("hex");
  const now = new Date().toISOString();
  const db = new DatabaseSync(dbPath);
  try {
    // Visual checks use an existing session, without consuming registration limits.
    // The fixture has no usable password; authentication flows have dedicated tests.
    db.prepare(`INSERT INTO users (id, email, name, name_key, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`).run(id, `${id}@example.test`, name, name.toLowerCase(), "!disabled", now);
    db.prepare(`INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)`).run(randomUUID(), id, createHash("sha256").update(token).digest("hex"),
      new Date(Date.now() + 3_600_000).toISOString(), now);
  } finally {
    db.close();
  }
  await page.context().addCookies([{
    name: "challengehub_session", value: token, url: new URL(page.url()).origin,
    httpOnly: true, sameSite: "Lax"
  }]);
}

async function checkTheme(page: Page, name: string, width: number) {
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const layout = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    // Catch legacy light panels that can make inherited light text unreadable.
    lightPanels: [...document.querySelectorAll("main *, [role=dialog] *")].filter((element) => {
      if (!(element instanceof HTMLElement) || !element.getClientRects().length) return false;
      const rect = element.getBoundingClientRect();
      const color = getComputedStyle(element).backgroundColor.match(/[\d.]+/g)?.map(Number);
      return rect.width > 80 && rect.height > 35 && color &&
        (color.length === 3 || color[3] > 0.5) && color.slice(0, 3).every((value) => value > 210);
    }).map((element) => element.tagName + "." + element.className)
  }));
  expect(layout.overflow, name).toBe(false);
  expect(layout.lightPanels, name).toEqual([]);
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(scan.violations.filter((issue) => issue.impact === "serious" || issue.impact === "critical"),
    JSON.stringify(scan.violations, null, 2)).toEqual([]);
  await page.screenshot({ path: `output/playwright/theme/${name}-${width}.png`, fullPage: true });
}

for (const width of [390, 1440]) {
  test(`dunkles Theme auf öffentlichen Seiten bei ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    for (const [name, route] of [
      ["home", "/"], ["catalog", "/challenges"],
      ["detail", "/challenges/10000-schritte-am-tag"], ["knowledge", "/wissen"],
      ["article", "/wissen/habit-rules-fuer-challenges"],
      ["privacy", "/datenschutz"], ["reset", "/auth/passwort-vergessen"],
      ["not-found", "/diese-seite-gibt-es-nicht"]
    ]) {
      await test.step(name, async () => {
        await page.goto(route);
        if (name === "detail") {
          const participate = page.getByRole("button", { name: "Jetzt teilnehmen", exact: true });
          await page.mouse.move(0, 0);
          await expect(participate).toHaveCSS("background-color", "rgb(255, 140, 0)");
          await expect(participate).toHaveCSS("color", "rgb(9, 11, 14)");
          await participate.hover();
          await expect(participate).toHaveCSS("background-color", "rgb(255, 163, 51)");
          await page.mouse.move(0, 0);
        }
        await checkTheme(page, name, width);
      });
    }
  });

  test(`dunkles Theme für Login und private Seiten bei ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/challenges/neu");
    await page.getByRole("button", { name: "Zum Login", exact: true }).click();
    await checkTheme(page, "login", width);
    await page.getByRole("button", { name: "Registrieren", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
    await expect(dialog).toBeVisible();
    await checkTheme(page, "registration", width);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await signInThemeFixture(page);
    for (const [name, route] of [
      ["create", "/challenges/neu"], ["profile", "/profil"],
      ["dashboard", "/meine-challenges"], ["mate", "/challenge-mate"]
    ]) {
      await test.step(name, async () => {
        await page.goto(route);
        await checkTheme(page, name, width);
      });
    }
    await page.goto("/challenges/10000-schritte-am-tag");
    await page.getByRole("button", { name: "Jetzt teilnehmen", exact: true }).click();
    await expect(page).toHaveURL(/\/teilnahme-bestaetigt\?teilnahme=/);
    await checkTheme(page, "participation", width);
    await page.getByRole("link", { name: "Zum Dashboard", exact: true }).click();
    await checkTheme(page, "room", width);
    await page.goto("/challenges/10000-schritte-am-tag");
    const roomLink = page.getByRole("link", { name: "Zum Challenge-Raum", exact: true });
    await page.mouse.move(0, 0);
    await expect(roomLink).toHaveCSS("background-color", "rgb(255, 140, 0)");
    await expect(roomLink).toHaveCSS("color", "rgb(9, 11, 14)");
    await roomLink.hover();
    await expect(roomLink).toHaveCSS("background-color", "rgb(255, 163, 51)");
  });
}
