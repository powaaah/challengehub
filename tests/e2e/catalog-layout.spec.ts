import { expect, test } from "@playwright/test";

test("eingeloggter Challenge-Katalog richtet Navigation und Toolbar sauber aus", async ({ page }) => {
  const unique = Date.now().toString();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/challenges");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();

  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(`layout-${unique}`);
  await registration.getByLabel("E-Mail-Adresse").fill(`layout-${unique}@example.com`);
  await registration.getByLabel("Passwort").fill("ChallengeHub-Test-2026");
  await registration.getByRole("button", { name: "Account erstellen" }).click();

  const profileButton = page.getByRole("button", { name: "Profilmenü öffnen" });
  await expect(profileButton).toBeVisible();
  await profileButton.click();

  const layout = await page.evaluate(() => {
    const rect = (element: Element | null) => element?.getBoundingClientRect();
    const header = rect(document.querySelector("header"));
    const main = rect(document.querySelector("main"));
    const footer = rect(document.querySelector("footer"));
    const profile = rect(document.querySelector("button[class*='profileButton']"));
    const menu = rect(document.querySelector('[role="menu"]'));
    const menuLink = document.querySelector('[role="menuitem"][href="/meine-challenges"]');
    const filter = rect(document.querySelector("button[class*='filterButton']"));
    const search = rect(document.querySelector("input[type='search']"));
    const sort = rect(document.querySelector("select"));
    const add = rect(document.querySelector('a[href="/challenges/neu"]'));

    return {
      footerAfterMain: Boolean(main && footer && footer.top >= main.bottom - 1),
      footerBelowHeader: Boolean(header && footer && footer.top > header.bottom),
      menuRightOffset: profile && menu ? Math.abs(profile.right - menu.right) : 999,
      menuLinkPadding: menuLink ? Number.parseFloat(getComputedStyle(menuLink).paddingLeft) : 0,
      toolbarTops: [filter?.top, search?.top, sort?.top, add?.top],
      toolbarHeights: [filter?.height, search?.height, sort?.height, add?.height]
    };
  });

  expect(layout.footerAfterMain).toBeTruthy();
  expect(layout.footerBelowHeader).toBeTruthy();
  expect(layout.menuRightOffset).toBeLessThanOrEqual(2);
  expect(layout.menuLinkPadding).toBeGreaterThanOrEqual(15);
  expect(Math.max(...layout.toolbarTops as number[]) - Math.min(...layout.toolbarTops as number[])).toBeLessThanOrEqual(1);
  expect(Math.max(...layout.toolbarHeights as number[]) - Math.min(...layout.toolbarHeights as number[])).toBeLessThanOrEqual(1);
});
