import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

test("edited Markdown appears on the homepage and imprint", async ({ page }) => {
  test.setTimeout(90_000);
  const files = [
    { path: "content/pages/startseite.md", route: "/", before: "Finde Deine Challenge und miss Dich mit anderen.", after: "Gemeinsam neue Ziele erreichen." },
    { path: "content/pages/impressum.md", route: "/impressum", before: "## impressum\n\nImpressum", after: "## impressum\n\nAnbieterkennzeichnung aus Markdown" },
  ];
  const originals = files.map((file) => fs.readFileSync(file.path, "utf8"));
  const compile = () => execFileSync(process.execPath, ["scripts/compile-pages.mts"], { stdio: "pipe" });
  try {
    files.forEach((file, i) => fs.writeFileSync(file.path, originals[i].replace(/\r\n/g, "\n").replace(file.before, file.after)));
    compile();
    for (const file of files) {
      await page.goto(file.route);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(file.after.split("\n").at(-1)!);
    }
  } finally {
    files.forEach((file, i) => fs.writeFileSync(file.path, originals[i]));
    compile();
  }
});

for (const width of [1440, 390]) {
  test(`public Markdown pages keep headings and fit at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/challenges", "/wissen", "/impressum", "/datenschutz", "/sicherheit", "/karriere"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      if (route === "/" || route === "/impressum")
        await page.screenshot({ path: testInfo.outputPath(`${route === "/" ? "startseite" : "impressum"}.png`), fullPage: true });
    }
  });
}
