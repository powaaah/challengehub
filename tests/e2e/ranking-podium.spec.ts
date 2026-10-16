import { test, expect, type Page } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import AxeBuilder from "@axe-core/playwright";
import { createHash, randomBytes, randomUUID } from "node:crypto";

async function fixture(page: Page) {
  await page.goto("/challenges/100-liegestuetze-am-stueck");
  const db = new DatabaseSync(process.env.CHALLENGEHUB_DB_PATH!);
  const prefix = randomUUID();
  const cid = prefix + "-challenge";
  const userId = prefix + "-user";
  const pid = prefix + "-participation";
  const now = new Date().toISOString();
  const token = randomBytes(32).toString("hex");
  db.prepare(
    "INSERT INTO users(id,email,name,name_key,password_hash,created_at) VALUES(?,?,?,?,?,?)",
  ).run(
    userId,
    `${prefix}@example.test`,
    "PodiumTester",
    prefix,
    "!disabled",
    now,
  );
  let challenge = db
    .prepare(
      "SELECT id FROM challenges WHERE slug='100-liegestuetze-am-stueck'",
    )
    .get() as { id: string } | undefined;
  if (!challenge) {
    db.prepare(
      `INSERT INTO challenges(id,creator_id,slug,title,level,category,duration_days,goal,description,rules_json,tips_json,status,created_at,updated_at,challenge_type,metric_unit,target_value,frequency,measurement_direction,completion_criterion)
      VALUES(?,?,'100-liegestuetze-am-stueck','100 Liegestütze am Stück','Beginner','Bewegung',1,'100 Liegestütze','Test','[]','[]','published',?,?,'one_time_result','repetitions',100,'once','at_least','single_result')`,
    ).run(cid, userId, now, now);
    challenge = { id: cid };
  }
  for (let i = 0; i < 25; i++) {
    const uid = prefix + "-" + i;
    db.prepare(
      "INSERT INTO users(id,email,name,name_key,password_hash,created_at) VALUES(?,?,?,?,?,?)",
    ).run(
      uid,
      uid + "@example.test",
      i === 0
        ? "Stefan42"
        : i === 1
          ? "Beton_micha"
          : i === 2
            ? "Frank_the_tank"
            : `Teilnehmer_${i}`,
      uid,
      "!disabled",
      now,
    );
    db.prepare(
      "INSERT INTO participations(id,user_id,challenge_id,started_at,status,completed_at) VALUES(?,?,?,?, 'completed',?)",
    ).run(uid, uid, challenge.id, now, now);
    db.prepare(
      "INSERT INTO check_ins(id,participation_id,date,value,created_at) VALUES(?,?,?,?,?)",
    ).run(uid, uid, now.slice(0, 10), 100, now);
    db.prepare("INSERT INTO challenge_completion_times VALUES(?,?,?)").run(
      uid,
      132 + i * 30,
      now,
    );
    db.prepare("INSERT INTO account_privacy_preferences VALUES(?,1,0,0,?)").run(
      uid,
      now,
    );
  }
  db.prepare(
    "INSERT INTO participations(id,user_id,challenge_id,started_at,status) VALUES(?,?,?,?, 'active')",
  ).run(pid, userId, challenge.id, now);
  db.prepare("INSERT INTO account_privacy_preferences VALUES(?,1,0,0,?)").run(
    userId,
    now,
  );
  db.prepare(
    "INSERT INTO sessions(id,user_id,token_hash,expires_at,created_at) VALUES(?,?,?,?,?)",
  ).run(
    prefix,
    userId,
    createHash("sha256").update(token).digest("hex"),
    new Date(Date.now() + 3600000).toISOString(),
    now,
  );
  db.close();
  await page
    .context()
    .addCookies([
      {
        name: "challengehub_session",
        value: token,
        url: new URL(page.url()).origin,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  return { pid };
}

test("Podium, rahmenlose Tabelle und optionale Bestzeit durchlaufen den echten Ergebnisflow", async ({
  page,
}) => {
  test.setTimeout(120000);
  const { pid } = await fixture(page);
  await page.goto(`/meine-challenges/${pid}`);
  await expect(page.getByLabel("Ziel vollständig geschafft")).toBeVisible();
  await expect(
    page.getByLabel("Ergebnis eintragen", { exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Ziel vollständig geschafft").check();
  await page
    .getByRole("button", { name: "Erfolg speichern", exact: true })
    .click();
  await expect(page.getByRole("complementary")).toContainText("Geschafft");
  await expect(page.locator('tr[aria-current="true"]')).toContainText(
    "PodiumTester",
  );
  await page.getByLabel("Ziel vollständig geschafft").check();
  await page.getByLabel("Deine Zeit in Sekunden (optional)").fill("95");
  await page.getByRole("button", { name: "Neue Bestzeit eintragen" }).click();
  await expect(page.getByRole("complementary")).toContainText("1:35 min");
  await page.getByLabel("Ziel vollständig geschafft").check();
  await page.getByLabel("Deine Zeit in Sekunden (optional)").fill("200");
  await page.getByRole("button", { name: "Neue Bestzeit eintragen" }).click();
  await expect(page.getByRole("complementary")).toContainText("1:35 min");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/challenges/100-liegestuetze-am-stueck");
    const ranking = page.locator('[data-detail-section="ranking"]');
    await expect(
      ranking.getByRole("heading", { name: "Ranking", exact: true }),
    ).toBeVisible();
    await expect(
      ranking.getByRole("list", { name: "Podium" }).getByRole("listitem"),
    ).toHaveCount(3);
    await expect(ranking.getByRole("listitem").first()).toContainText(
      "PodiumTester",
    );
    await expect(ranking.getByRole("listitem").first()).toContainText(
      "1:35 min",
    );
    await expect(ranking.getByRole("row").nth(1)).toContainText(
      "Frank_the_tank",
    );
    await expect(ranking).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(
      ranking.getByRole("columnheader", { name: "Bestzeit" }),
    ).toBeVisible();
    const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    await ranking.screenshot({
      path: `output/playwright/ranking-podium-${width}.png`,
    });
  }
});
