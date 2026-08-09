import { expect, test } from "@playwright/test";

test("Hauptnavigation führt zu Challenges, Ablauf und Wissen ohne falschen Ranking-Link", async ({ page }) => {
  await page.goto("/");

  const navigation = page.getByRole("navigation", { name: "Hauptnavigation" });
  await expect(navigation.getByRole("link", { name: "Challenges", exact: true })).toHaveAttribute(
    "href",
    "/challenges"
  );
  await expect(navigation.getByRole("link", { name: "So funktioniert’s", exact: true })).toHaveAttribute(
    "href",
    "/#so-funktionierts"
  );
  await expect(navigation.getByRole("link", { name: "Wissen", exact: true })).toHaveAttribute(
    "href",
    "/wissen"
  );
  await expect(navigation.getByRole("link", { name: "Ranking", exact: true })).toHaveCount(0);

  await navigation.getByRole("link", { name: "So funktioniert’s", exact: true }).click();
  await expect(page).toHaveURL(/\/#so-funktionierts$/);
  await expect(page.getByRole("heading", { name: "So funktioniert’s" })).toBeInViewport();
});

test("Footer gruppiert Produkt-, Unternehmens- und Rechtslinks", async ({ page }) => {
  await page.goto("/");

  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("navigation", { name: "Produkt" })).toBeVisible();
  await expect(footer.getByRole("navigation", { name: "Unternehmen" })).toBeVisible();
  await expect(footer.getByRole("navigation", { name: "Rechtliches" })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Meine Challenges" })).toHaveAttribute(
    "href",
    "/meine-challenges"
  );
  await expect(footer.getByRole("link", { name: "Datenschutz" })).toHaveAttribute(
    "href",
    "/datenschutz"
  );
});

test("globale 404 erklärt den Zustand und bietet klare Rückwege", async ({ page }) => {
  const response = await page.goto("/diese-seite-gibt-es-nicht");

  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle("Seite nicht gefunden | ChallengeHub");
  await expect(page.getByRole("heading", { level: 1, name: "Seite nicht gefunden" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Challenges entdecken" })).toHaveAttribute(
    "href",
    "/challenges"
  );
  await expect(page.getByRole("link", { name: "Zur Startseite" })).toHaveAttribute("href", "/");
});

test("mobile Navigation enthält dieselben verständlichen Ziele", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/challenges");

  const trigger = page.getByRole("button", { name: "Navigation öffnen" });
  await trigger.click();
  const navigation = page.getByRole("navigation", { name: "Hauptnavigation" });
  await expect(navigation.getByRole("link", { name: "Challenges", exact: true })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(navigation.getByRole("link", { name: "So funktioniert’s", exact: true })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Wissen", exact: true })).toBeVisible();
});
