import { expect, test } from "@playwright/test";

test("Wissensartikel zeigt Autor, Aktualisierung, Quellen und passende Challenge crawlbar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/wissen/tiny-habits-challenges");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: /Tiny Habits/ })).toBeVisible();
  await expect(page.getByText(/Von ChallengeHub Redaktion/)).toBeVisible();
  await expect(page.locator('time[datetime="2026-08-31"]')).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Bücher und Quellen" })).toBeVisible();
  const challengeLink = page.getByRole("link", { name: /Challenge „10 000 Schritte am Tag Challenge“ ansehen/ });
  await expect(challengeLink).toHaveAttribute("href", "/challenges/10000-schritte-am-tag");
  const relatedReading = page.getByRole("navigation", { name: "Passend weiterlesen" });
  await expect(relatedReading.getByRole("link", { name: /7 Habit Rules/ })).toHaveAttribute(
    "href",
    "/wissen/habit-rules-fuer-challenges"
  );
  await expect(relatedReading.getByRole("link", { name: /Wie lange dauert es/ })).toHaveAttribute(
    "href",
    "/wissen/wie-lange-dauert-gewohnheit"
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://challengehub.de/wissen/tiny-habits-challenges"
  );

  const articleSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.map((script) => JSON.parse(script.textContent ?? "{}"))
      .flatMap((schema) => schema["@graph"] ?? [schema])
      .find((entry) => entry["@type"] === "Article")
  );
  expect(articleSchema.dateModified).toBe("2026-08-31");
  expect(articleSchema.author.name).toBe("ChallengeHub Redaktion");
  expect(articleSchema.relatedLink).toEqual([
    "https://challengehub.de/wissen/habit-rules-fuer-challenges",
    "https://challengehub.de/wissen/wie-lange-dauert-gewohnheit"
  ]);
  expect(articleSchema.citation).toHaveLength(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test("Schritte-Artikel beantwortet die Suchfrage mit Quellen, Sicherheit und stabilem SEO-Vertrag", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/wissen/wie-viele-schritte-am-tag");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Wie viele Schritte am Tag sind sinnvoll?" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Sind 10.000 Schritte am Tag notwendig?" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Sicher starten" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ding et al/ })).toHaveAttribute(
    "href",
    "https://pubmed.ncbi.nlm.nih.gov/40713949/"
  );
  await expect(page.getByRole("link", { name: /10 000 Schritte am Tag Challenge/ })).toHaveAttribute(
    "href",
    "/challenges/10000-schritte-am-tag"
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://challengehub.de/wissen/wie-viele-schritte-am-tag"
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /7.000 und 10.000/);

  const articleSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.map((script) => JSON.parse(script.textContent ?? "{}"))
      .flatMap((schema) => schema["@graph"] ?? [schema])
      .find((entry) => entry["@type"] === "Article")
  );
  expect(articleSchema.dateModified).toBe("2026-08-27");
  expect(articleSchema.citation).toContain("https://pubmed.ncbi.nlm.nih.gov/40713949/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();

  const sitemapResponse = await page.request.get("/sitemap.xml");
  expect(sitemapResponse.status()).toBe(200);
  expect(await sitemapResponse.text()).toContain(
    "https://challengehub.de/wissen/wie-viele-schritte-am-tag"
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Wie viele Schritte am Tag sind sinnvoll?" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test("Social-Media-Detox-Artikel ist crawlbar, evidenztreu und responsiv", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/wissen/social-media-detox-sinnvoll");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Social Media Detox: Ist eine digitale Pause sinnvoll?" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Ist Social Media Detox sinnvoll?" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Wann eine Pause nicht ausreicht" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Lemahieu et al/ })).toHaveAttribute(
    "href",
    "https://pubmed.ncbi.nlm.nih.gov/40038410/"
  );
  await expect(page.getByRole("link", { name: /100 Tage ohne soziale Medien/ })).toHaveAttribute(
    "href",
    "/challenges/100-tage-ohne-soziale-medien"
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://challengehub.de/wissen/social-media-detox-sinnvoll"
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Ist Social Media Detox sinnvoll/);

  const articleSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.map((script) => JSON.parse(script.textContent ?? "{}"))
      .flatMap((schema) => schema["@graph"] ?? [schema])
      .find((entry) => entry["@type"] === "Article")
  );
  expect(articleSchema.citation).toContain("https://pubmed.ncbi.nlm.nih.gov/40038410/");
  expect(articleSchema.citation).toContain("https://pubmed.ncbi.nlm.nih.gov/40150185/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();

  const sitemapResponse = await page.request.get("/sitemap.xml");
  expect(sitemapResponse.status()).toBe(200);
  expect(await sitemapResponse.text()).toContain(
    "https://challengehub.de/wissen/social-media-detox-sinnvoll"
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: /Social Media Detox/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test("Gewohnheitsdauer-Artikel beantwortet die Suchintention ohne starre Tagesregel", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/wissen/wie-lange-dauert-gewohnheit");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Wie lange dauert es, eine Gewohnheit aufzubauen?" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Sind 21 oder 66 Tage eine feste Regel?" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Was passiert, wenn du einen Tag auslässt?" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Singh et al/ })).toHaveAttribute(
    "href",
    "https://pubmed.ncbi.nlm.nih.gov/39685110/"
  );
  await expect(page.getByRole("link", { name: /Change your life in 90 Tagen/ })).toHaveAttribute(
    "href",
    "/challenges/change-your-life-in-90-tagen"
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://challengehub.de/wissen/wie-lange-dauert-gewohnheit"
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /21-Tage-Mythos/);

  const articleSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.map((script) => JSON.parse(script.textContent ?? "{}"))
      .flatMap((schema) => schema["@graph"] ?? [schema])
      .find((entry) => entry["@type"] === "Article")
  );
  expect(articleSchema.citation).toContain("https://pubmed.ncbi.nlm.nih.gov/39685110/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();

  const sitemapResponse = await page.request.get("/sitemap.xml");
  expect(sitemapResponse.status()).toBe(200);
  expect(await sitemapResponse.text()).toContain(
    "https://challengehub.de/wissen/wie-lange-dauert-gewohnheit"
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: /Wie lange dauert es/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test("Habit-Loop-Artikel kennzeichnet Modellgrenzen und aktuelle Forschungsquellen crawlbar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/wissen/cue-routine-reward-challengehub");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: /Was die Habit Loop wirklich leistet/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Was das Drei-Schritte-Modell leisten kann" })).toBeVisible();
  await expect(page.getByText(/keine vollständige wissenschaftliche Theorie/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Zhu et al/ })).toHaveAttribute(
    "href",
    "https://pubmed.ncbi.nlm.nih.gov/38787601/"
  );
  await expect(page.getByRole("link", { name: /Keller et al/ })).toHaveAttribute(
    "href",
    "https://pubmed.ncbi.nlm.nih.gov/33405284/"
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://challengehub.de/wissen/cue-routine-reward-challengehub"
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /warum Wiederholung entscheidend ist/);

  const articleSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.map((script) => JSON.parse(script.textContent ?? "{}"))
      .flatMap((schema) => schema["@graph"] ?? [schema])
      .find((entry) => entry["@type"] === "Article")
  );
  expect(articleSchema.dateModified).toBe("2026-08-30");
  expect(articleSchema.citation).toEqual([
    "https://pubmed.ncbi.nlm.nih.gov/38787601/",
    "https://pubmed.ncbi.nlm.nih.gov/33405284/",
    "https://pubmed.ncbi.nlm.nih.gov/30572936/"
  ]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: /Was die Habit Loop wirklich leistet/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test("Habit-Rules-Artikel zeigt Evidenzgrenzen und stabile SEO-Marker", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/wissen/habit-rules-fuer-challenges");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: /7 Habit Rules/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "1. Verstehe die Regeln als Planungswerkzeuge" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "7. Plane die Rückkehr statt Perfektion" })).toBeVisible();
  await expect(page.getByText(/keine sieben wissenschaftlichen Gesetze/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Singh et al/ })).toHaveAttribute(
    "href",
    "https://pubmed.ncbi.nlm.nih.gov/39685110/"
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://challengehub.de/wissen/habit-rules-fuer-challenges"
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /evidenzbasiert/);

  const articleSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.map((script) => JSON.parse(script.textContent ?? "{}"))
      .flatMap((schema) => schema["@graph"] ?? [schema])
      .find((entry) => entry["@type"] === "Article")
  );
  expect(articleSchema.dateModified).toBe("2026-08-30");
  expect(articleSchema.citation).toEqual([
    "https://pubmed.ncbi.nlm.nih.gov/39685110/",
    "https://pubmed.ncbi.nlm.nih.gov/38787601/",
    "https://pubmed.ncbi.nlm.nih.gov/35756236/",
    "https://pubmed.ncbi.nlm.nih.gov/34054628/"
  ]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: /7 Habit Rules/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test("Tiny-Habits-Artikel trennt Methode und Evidenz bei stabiler SEO-Ausgabe", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/wissen/tiny-habits-challenges");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: /Tiny Habits/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Methode und Evidenz auseinanderhalten" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Klein anfangen, später bewusst erweitern" })).toBeVisible();
  await expect(page.getByText(/keinen direkten Wirksamkeitsnachweis für die gesamte Tiny-Habits-Methode/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Zhu et al/ })).toHaveAttribute(
    "href",
    "https://pubmed.ncbi.nlm.nih.gov/38787601/"
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://challengehub.de/wissen/tiny-habits-challenges"
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Evidenz und Grenzen/);

  const articleSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.map((script) => JSON.parse(script.textContent ?? "{}"))
      .flatMap((schema) => schema["@graph"] ?? [schema])
      .find((entry) => entry["@type"] === "Article")
  );
  expect(articleSchema.dateModified).toBe("2026-08-31");
  expect(articleSchema.citation).toEqual([
    "https://behaviordesign.stanford.edu/resources/fogg-behavior-model",
    "https://pubmed.ncbi.nlm.nih.gov/38787601/",
    "https://pubmed.ncbi.nlm.nih.gov/39387277/",
    "https://pubmed.ncbi.nlm.nih.gov/30572936/"
  ]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: /Tiny Habits/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test("Streak-Rückkehr-Artikel ist evidenztreu, intern verlinkt und crawlbar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/wissen/streak-verloren-wie-weitermachen");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Streak verloren: Wie du sinnvoll weitermachst" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Streak verloren: neu starten oder weitermachen?" })).toBeVisible();
  await expect(page.getByText(/kein Wirksamkeitsnachweis für Streaks/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Curran et al/ })).toHaveAttribute(
    "href",
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC11494719/"
  );
  await expect(page.getByRole("link", { name: /10 000 Schritte am Tag Challenge/ })).toHaveAttribute(
    "href",
    "/challenges/10000-schritte-am-tag"
  );
  const relatedReading = page.getByRole("navigation", { name: "Passend weiterlesen" });
  await expect(relatedReading.getByRole("link", { name: /Wie lange dauert es/ })).toHaveAttribute(
    "href",
    "/wissen/wie-lange-dauert-gewohnheit"
  );
  await expect(relatedReading.getByRole("link", { name: /7 Habit Rules/ })).toHaveAttribute(
    "href",
    "/wissen/habit-rules-fuer-challenges"
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://challengehub.de/wissen/streak-verloren-wie-weitermachen"
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Streak verloren/);

  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.map((script) => JSON.parse(script.textContent ?? "{}"))
      .flatMap((schema) => schema["@graph"] ?? [schema])
  );
  const articleSchema = schemas.find((entry) => entry["@type"] === "Article");
  const breadcrumbSchema = schemas.find((entry) => entry["@type"] === "BreadcrumbList");
  expect(articleSchema.dateModified).toBe("2026-08-31");
  expect(articleSchema.citation).toEqual([
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC11494719/",
    "https://pubmed.ncbi.nlm.nih.gov/28810473/",
    "https://pubmed.ncbi.nlm.nih.gov/39685110/"
  ]);
  expect(articleSchema.relatedLink).toEqual([
    "https://challengehub.de/wissen/wie-lange-dauert-gewohnheit",
    "https://challengehub.de/wissen/habit-rules-fuer-challenges"
  ]);
  expect(breadcrumbSchema.itemListElement.at(-1).item).toBe(
    "https://challengehub.de/wissen/streak-verloren-wie-weitermachen"
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();

  const sitemapResponse = await page.request.get("/sitemap.xml");
  expect(sitemapResponse.status()).toBe(200);
  expect(await sitemapResponse.text()).toContain(
    "https://challengehub.de/wissen/streak-verloren-wie-weitermachen"
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: /Streak verloren/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});