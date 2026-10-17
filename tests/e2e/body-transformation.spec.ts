import { test, expect } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import sharp from "sharp";
import AxeBuilder from "@axe-core/playwright";

test("Navy journey persists history, habits, private photos, export and opt-in ranking", async ({
  page,
}) => {
  await page.goto("/challenges/100-tage-body-transformation");
  const db = new DatabaseSync(process.env.CHALLENGEHUB_DB_PATH!);
  const userId = randomUUID(),
    token = randomBytes(32).toString("hex"),
    now = new Date().toISOString();
  db.prepare(
    "INSERT INTO users(id,email,name,name_key,password_hash,created_at) VALUES(?,?,?,?,?,?)",
  ).run(
    userId,
    `${userId}@example.test`,
    "Navy Tester",
    userId,
    "!disabled",
    now,
  );
  db.prepare(
    "INSERT INTO sessions(id,user_id,token_hash,expires_at,created_at) VALUES(?,?,?,?,?)",
  ).run(
    randomUUID(),
    userId,
    createHash("sha256").update(token).digest("hex"),
    new Date(Date.now() + 3600000).toISOString(),
    now,
  );
  const origin = new URL(page.url()).origin;
  await page
    .context()
    .addCookies([
      {
        name: "challengehub_session",
        value: token,
        url: origin,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  await page.reload();
  await page.getByRole("button", { name: "Jetzt teilnehmen" }).click();
  await page.getByRole("link", { name: "Zum Dashboard" }).click();
  await expect(
    page.getByRole("button", { name: "Messwerte speichern" }),
  ).toBeVisible();
  const id = page.url().split("/").at(-1)!;
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const startDate = new Date(`${today}T12:00:00Z`);
  startDate.setUTCDate(startDate.getUTCDate() - 99);
  const start = startDate.toISOString().slice(0, 10);
  db.prepare("UPDATE participations SET started_at=? WHERE id=?").run(
    startDate.toISOString(),
    id,
  );
  await page.reload();
  const form = page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: "Messwerte speichern" }) });
  await form.getByLabel("Datum", { exact: true }).fill(start);
  await form.getByLabel("Körpergröße (cm)").fill("180");
  await form.getByLabel("Gewicht (kg)").fill("90");
  await form.getByLabel("Bauchumfang (cm)").fill("100");
  await form.getByLabel("Halsumfang (cm)").fill("40");
  await form.getByRole("button").click();
  await expect(page.getByRole("status")).toHaveText("Gespeichert.");
  await expect(form.getByLabel("Körpergröße (cm)")).toHaveAttribute(
    "readonly",
    "",
  );
  await form.getByLabel("Datum", { exact: true }).fill(today);
  await form.getByLabel("Gewicht (kg)").fill("85");
  await form.getByLabel("Bauchumfang (cm)").fill("92");
  await form.getByRole("button").click();
  await expect(
    page.getByText("Dein 100-Tage-Ergebnis", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toContainText("85,0 kg");
  await page.getByText("Teil-Challenge hinzufügen", { exact: true }).click();
  const habitForm = page
    .locator("form")
    .filter({
      has: page.getByRole("button", { name: "Teil-Challenge anlegen" }),
    });
  await habitForm.getByLabel("Name", { exact: true }).fill("Gym");
  await habitForm.getByLabel("Einheit").fill("Besuche");
  await habitForm.getByLabel("Zielwert").fill("3");
  await habitForm.getByLabel("Rhythmus").selectOption("week");
  await habitForm.getByRole("button").click();
  const habit = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "Gym", exact: true }) });
  await habit.getByLabel("Tageswert (Besuche)").fill("1");
  await habit.getByRole("button", { name: "Teil-Challenge speichern" }).click();
  await expect(habit).toContainText("1,0 / 3,0");
  const photo = await sharp({
    create: { width: 64, height: 64, channels: 3, background: "#ffaa44" },
  })
    .png()
    .toBuffer();
  await page
    .getByLabel("Startbild auswählen")
    .setInputFiles({ name: "start.png", mimeType: "image/png", buffer: photo });
  await page
    .locator("form")
    .filter({ has: page.getByLabel("Startbild auswählen") })
    .getByRole("button", { name: "Bild speichern" })
    .click();
  await expect(
    page.getByRole("img", { name: "Dein Startbild", exact: true }),
  ).toBeVisible();
  const photoUrl = `${origin}/api/body-transformation/${id}/photo/start`;
  expect((await page.request.get(photoUrl)).headers()["content-type"]).toBe(
    "image/jpeg",
  );
  const exported = await (await page.request.get("/profil/export")).json();
  expect(exported.bodyTransformation[0].state.measurements).toHaveLength(2);
  expect(exported.bodyTransformationPhotos[0].base64).toBeTruthy();
  expect(
    (
      await page.request.post(`/api/body-transformation/${id}`, {
        headers: { origin: "https://untrusted.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post("/api/body-transformation/not-owned", {
        headers: { origin },
        data: {},
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await page.request.post(`/api/body-transformation/${id}/photo/start`, {
        headers: { origin },
        data: "not an image",
      })
    ).status(),
  ).toBe(400);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `output/playwright/navy-room-${width}.png`,
      fullPage: true,
    });
  }
  expect(
    (await new AxeBuilder({ page }).include("main").analyze()).violations,
  ).toEqual([]);
  await page.goto("/challenges/100-tage-body-transformation");
  await expect(
    page.locator('[data-detail-section="ranking"]'),
  ).not.toContainText("Navy Tester");
  db.prepare(
    "INSERT INTO account_privacy_preferences(user_id,ranking_visible,updated_at) VALUES(?,1,?) ON CONFLICT(user_id) DO UPDATE SET ranking_visible=1",
  ).run(userId, now);
  await page.reload();
  await expect(page.locator('[data-detail-section="ranking"]')).toContainText(
    "Navy Tester",
  );
  await page.context().clearCookies();
  expect((await page.request.get(photoUrl)).status()).toBe(404);
  db.exec("PRAGMA foreign_keys=ON");
  db.prepare("DELETE FROM users WHERE id=?").run(userId);
  expect(
    db
      .prepare(
        "SELECT COUNT(*) n FROM body_transformation WHERE participation_id=?",
      )
      .get(id)!.n,
  ).toBe(0);
  expect(
    db
      .prepare(
        "SELECT COUNT(*) n FROM body_transformation_photos WHERE participation_id=?",
      )
      .get(id)!.n,
  ).toBe(0);
  db.close();
});
