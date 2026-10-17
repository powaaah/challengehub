import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

test("Markdown creates and edits a real page, removal archives results and removes public routes", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/challenges");
  const slug = `markdown-e2e-${randomUUID()}`;
  const file = `content/challenges/${slug}.md`;
  const source = fs
    .readFileSync("content/challenges/journey-100-liegestuetze.md", "utf8")
    .replace(/\r\n/g, "\n");
  const match = source.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/)!;
  const meta = JSON.parse(match[1]);
  meta.id = `curated:${slug}`;
  meta.slug = slug;
  meta.title = "Markdown Erstfassung";
  meta.header.summary = "Diese Challenge kommt aus einer Markdown-Datei.";
  const write = () =>
    fs.writeFileSync(
      file,
      "---\n" + JSON.stringify(meta, null, 2) + "\n---\n" + match[2],
    );
  const compile = () =>
    execFileSync(process.execPath, ["scripts/compile-challenges.mts"], {
      stdio: "pipe",
    });
  expect(fs.existsSync(file)).toBe(false);
  const db = new DatabaseSync(process.env.CHALLENGEHUB_DB_PATH!);
  try {
    write();
    compile();
    await page.goto(`/challenges/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Markdown Erstfassung",
    );
    const user = randomUUID(),
      token = randomBytes(32).toString("hex"),
      now = new Date().toISOString();
    db.prepare(
      "INSERT INTO users(id,email,name,name_key,password_hash,created_at) VALUES(?,?,?,?,?,?)",
    ).run(
      user,
      `${user}@example.test`,
      "Markdown Tester",
      user,
      "!disabled",
      now,
    );
    db.prepare(
      "INSERT INTO sessions(id,user_id,token_hash,expires_at,created_at) VALUES(?,?,?,?,?)",
    ).run(
      randomUUID(),
      user,
      createHash("sha256").update(token).digest("hex"),
      new Date(Date.now() + 3600000).toISOString(),
      now,
    );
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
    await page.reload();
    await page.getByRole("button", { name: "Jetzt teilnehmen" }).click();
    await page.getByRole("link", { name: "Zum Dashboard" }).click();
    await expect(
      page.getByRole("button", { name: "Challenge heute durchgeführt" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Challenge heute durchgeführt" })
      .click();
    await expect(
      page.getByRole("button", { name: "Heute gespeichert" }),
    ).toBeDisabled();
    const room = page.url(),
      id = room.split("/").at(-1)!;
    meta.title = "Markdown Zweite Fassung";
    write();
    compile();
    await page.goto(`/challenges/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Markdown Zweite Fassung",
    );
    fs.unlinkSync(file);
    compile();
    const response = await page.goto(`/challenges/${slug}`);
    expect(response!.status()).toBe(404);
    expect(
      (await page.request.get(`/api/v1/challenges/${slug}`)).status(),
    ).toBe(404);
    await page.goto(room);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Markdown Zweite Fassung",
    );
    await expect(
      page.getByText(
        "Diese Teilnahme ist beendet. Dein bisheriger Verlauf bleibt sichtbar.",
      ),
    ).toBeVisible();
    expect(
      db
        .prepare("SELECT COUNT(*) n FROM check_ins WHERE participation_id=?")
        .get(id)!.n,
    ).toBe(1);
    expect(
      db.prepare("SELECT status FROM participations WHERE id=?").get(id)!
        .status,
    ).toBe("archived");
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    compile();
    db.close();
  }
});
