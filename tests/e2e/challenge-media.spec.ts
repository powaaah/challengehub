import { expect, test } from "@playwright/test";
import { challenges } from "../../data/challenges";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

test("all curated headers load real local images and keep the action with the task", async ({ page }) => {
  test.setTimeout(120_000);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const challenge of challenges) {
      await page.goto(`/challenges/${challenge.slug}`);
      const hero = page.locator('[data-detail-section="hero"]');
      await expect(hero.getByRole("button", { name: "Jetzt teilnehmen" })).toBeVisible();
      await expect(hero.getByRole("img")).toBeVisible();
      await expect.poll(() => hero.getByRole("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.getByRole("heading", { name: "Auf einen Blick" })).toHaveCount(0);
      if (["5-minuten-calisthenics-challenge", "100-liegestuetze-am-stueck", "10000-schritte-am-tag"].includes(challenge.slug)) {
        await page.screenshot({ path: `output/playwright/media-${challenge.slug}-${width}.png` });
      }
    }
  }
});

test("new calisthenics challenge supports participation and a timed result", async ({ page }) => {
  await page.goto("/challenges/5-minuten-calisthenics-challenge");
  const dbPath = process.env.CHALLENGEHUB_DB_PATH;
  if (!dbPath) throw new Error("Isolated database required");
  const db = new DatabaseSync(dbPath);
  const id = randomUUID(), token = randomBytes(32).toString("hex"), now = new Date().toISOString();
  const name = `Athlete ${id.slice(0, 8)}`;
  try {
    db.prepare("INSERT INTO users (id,email,name,name_key,password_hash,created_at) VALUES (?,?,?,?,?,?)").run(id, `${id}@example.test`, name, name.toLowerCase(), "!disabled", now);
    db.prepare("INSERT INTO sessions (id,user_id,token_hash,expires_at,created_at) VALUES (?,?,?,?,?)").run(randomUUID(), id, createHash("sha256").update(token).digest("hex"), new Date(Date.now()+3600000).toISOString(), now);
  } finally { db.close(); }
  await page.context().addCookies([{ name: "challengehub_session", value: token, url: new URL(page.url()).origin, httpOnly: true, sameSite: "Lax" }]);
  await page.reload();
  await page.getByRole("button", { name: "Jetzt teilnehmen" }).click();
  await expect(page).toHaveURL(/teilnahme-bestaetigt/);
  await page.getByRole("link", { name: "Zum Dashboard" }).click();
  await page.getByRole("spinbutton").fill("163");
  await page.getByRole("button", { name: "Messwert speichern" }).click();
  await expect(page.getByRole("complementary")).toContainText("2:43 min");
  await expect(page.getByRole("complementary")).toContainText("Ziel erreicht");
  await page.getByRole("spinbutton").fill("150");
  await page.getByRole("button", { name: "Messwert speichern" }).click();
  await expect(page.getByRole("complementary")).toContainText("2:30 min");
  await page.getByRole("spinbutton").fill("180");
  await page.getByRole("button", { name: "Messwert speichern" }).click();
  await expect(page.getByRole("complementary")).toContainText("2:30 min");
  await page.goto("/challenges/5-minuten-calisthenics-challenge");
  await expect(page.locator('[data-detail-section="hero"]').getByRole("link", { name: "Zum Challenge-Raum" })).toBeVisible();
});
