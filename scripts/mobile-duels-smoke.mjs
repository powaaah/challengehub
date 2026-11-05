import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
try {
  const a = await browser.newContext({ viewport: { width: 393, height: 852 } }),
    b = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const host = await a.newPage(),
    guest = await b.newPage();
  const errors = [];
  host.on("pageerror", (e) => errors.push(e.message));
  guest.on("pageerror", (e) => errors.push(e.message));
  await host.goto("http://localhost:8096");
  await host
    .getByRole("button", { name: "1 vs 1. Fordere jemanden heraus." })
    .click();
  await host
    .getByText("5-Minuten-Calisthenics-Challenge", { exact: true })
    .click();
  await host.getByRole("button", { name: "Gemeinsames Duell anlegen" }).click();
  await host.getByLabel("Dein Name im Duell").fill("Anna");
  await host
    .getByRole("button", { name: "Duell anlegen", exact: true })
    .click();
  await host
    .getByRole("button", { name: "Einladungslink erzeugen", exact: true })
    .click();
  const link = await host.getByLabel("Einladungslink").inputValue();
  await guest.goto(link);
  await guest.getByLabel("Dein Name im Duell").fill("Ben");
  await guest
    .getByRole("button", { name: "Duell beitreten", exact: true })
    .click();
  await host
    .getByRole("button", { name: "Duell starten", exact: true })
    .click();
  await host.getByLabel("Duell-Messwert").fill("250");
  await host
    .getByRole("button", { name: "Ergebnis speichern", exact: true })
    .click();
  await expect(host.getByText("4:10 Minuten", { exact: true })).toBeVisible();
  await guest.getByLabel("Duell-Messwert").fill("280");
  await guest
    .getByRole("button", { name: "Ergebnis speichern", exact: true })
    .click();
  await expect(guest.getByText("4:40 Minuten", { exact: true })).toBeVisible();
  for (const page of [host, guest]) {
    await page
      .getByRole("button", { name: "Ich bin fertig", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Endgültig abschließen", exact: true })
      .click();
  }
  await expect(host.getByText("Anna gewinnt!", { exact: true })).toBeVisible({
    timeout: 10000,
  });
  await expect(guest.getByText("Anna gewinnt!", { exact: true })).toBeVisible();
  await host.getByRole("button", { name: "Zurück", exact: true }).click();
  await host.reload();
  await host
    .getByRole("button", { name: /5-Minuten-Calisthenics-Challenge Beendet/ })
    .click();
  await expect(host.getByText("Anna gewinnt!", { exact: true })).toBeVisible();
  for (const page of [host, guest]) {
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )
    )
      throw Error("Horizontal overflow");
  }
  console.log(
    JSON.stringify({
      twoGuestFlow: "passed",
      reload: "passed",
      viewports: ["393x852", "412x915"],
      pageErrors: errors,
    }),
  );
} finally {
  await browser.close();
}
