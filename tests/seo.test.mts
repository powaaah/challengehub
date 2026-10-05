import * as assert from "node:assert/strict";
import { test } from "node:test";
import { challenges } from "../data/challenges.ts";
import { habitArticles } from "../data/habit-articles.ts";
import {
  buildChallengeBreadcrumbJsonLd,
  buildChallengeCatalogJsonLd,
  buildChallengeSocialImageMetadata,
  buildKnowledgeBreadcrumbJsonLd,
  buildKnowledgeCatalogJsonLd,
  buildKnowledgeSocialImageMetadata,
  buildHomePageJsonLd,
  buildSitemap,
  SITE_URL
} from "../lib/seo.ts";

test("Wissensartikel-Social-Preview nutzt eine kanonische große Bildroute", () => {
  assert.deepEqual(
    buildKnowledgeSocialImageMetadata(
      "Die 7 Habit Rules für Challenges",
      "habit-rules-fuer-challenges"
    ),
    {
      url: `${SITE_URL}/wissen/habit-rules-fuer-challenges/opengraph-image`,
      width: 1200,
      height: 630,
      alt: "Die 7 Habit Rules für Challenges | ChallengeHub Wissen"
    }
  );
});

test("Challenge-Social-Preview nutzt eine kanonische große Bildroute", () => {
  assert.deepEqual(
    buildChallengeSocialImageMetadata(
      "10 000 Schritte am Tag Challenge",
      "10000-schritte-am-tag"
    ),
    {
      url: `${SITE_URL}/challenges/10000-schritte-am-tag/opengraph-image`,
      width: 1200,
      height: 630,
      alt: "10 000 Schritte am Tag Challenge auf ChallengeHub"
    }
  );
});

test("Homepage verknüpft WebSite, Organisation und interne Challenge-Suche kanonisch", () => {
  const jsonLd = buildHomePageJsonLd();
  const organization = jsonLd["@graph"].find((entry) => entry["@type"] === "Organization");
  const website = jsonLd["@graph"].find((entry) => entry["@type"] === "WebSite");

  assert.equal(jsonLd["@context"], "https://schema.org");
  assert.deepEqual(organization, {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "ChallengeHub",
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`
    },
    sameAs: [
      "https://www.instagram.com/challengehub_de/",
      "https://www.youtube.com/@ChallengeHub_DE",
      "https://www.tiktok.com/@ChallengeHub_de"
    ]
  });
  assert.equal(website["@id"], `${SITE_URL}/#website`);
  assert.equal(website.url, `${SITE_URL}/`);
  assert.equal(website.publisher["@id"], `${SITE_URL}/#organization`);
  assert.deepEqual(website.potentialAction, {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/challenges?suche={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  });
});

test("Sitemap enthält alle kuratierten Challenges und Wissensartikel kanonisch", () => {
  const urls = buildSitemap().map((entry) => entry.url);

  for (const challenge of challenges) {
    assert.ok(urls.includes(`${SITE_URL}/challenges/${challenge.slug}`));
  }
  for (const article of habitArticles) {
    assert.ok(urls.includes(`${SITE_URL}/wissen/${article.slug}`));
  }
  assert.ok(urls.includes(`${SITE_URL}/challenges`));
  assert.ok(urls.every((url) => url.startsWith(SITE_URL)));
});

test("Wissensartikel besitzen transparente Aktualisierung und eine gültige interne Challenge-Verlinkung", () => {
  const sitemapByUrl = new Map(buildSitemap().map((entry) => [entry.url, entry]));

  for (const article of habitArticles) {
    assert.equal(article.author, "ChallengeHub Redaktion");
    assert.match(article.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(article.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(article.updatedAt >= article.publishedAt);
    assert.ok(
      challenges.some((challenge) => challenge.slug === article.relatedChallengeSlug),
      `${article.slug}: verknüpfte Challenge fehlt`
    );
    assert.ok(article.sources.length >= 2, `${article.slug}: zu wenige Quellen`);
    assert.equal(
      sitemapByUrl.get(`${SITE_URL}/wissen/${article.slug}`)?.lastModified?.toISOString(),
      `${article.updatedAt}T00:00:00.000Z`
    );
  }
});

test("Wissensartikel bilden einen geschlossenen Cluster mit eindeutigen internen Empfehlungen", () => {
  const knownSlugs = new Set(habitArticles.map(({ slug }) => slug));
  const inboundLinks = new Map(habitArticles.map(({ slug }) => [slug, 0]));

  for (const article of habitArticles) {
    assert.equal(article.relatedArticleSlugs.length, 2, `${article.slug}: genau zwei Empfehlungen erwartet`);
    assert.equal(
      new Set(article.relatedArticleSlugs).size,
      article.relatedArticleSlugs.length,
      `${article.slug}: doppelte Empfehlung`
    );

    for (const relatedSlug of article.relatedArticleSlugs) {
      assert.notEqual(relatedSlug, article.slug, `${article.slug}: Selbstlink ist nicht zulässig`);
      assert.ok(knownSlugs.has(relatedSlug), `${article.slug}: unbekannter Wissensartikel ${relatedSlug}`);
      inboundLinks.set(relatedSlug, (inboundLinks.get(relatedSlug) ?? 0) + 1);
    }
  }

  for (const [slug, inboundCount] of inboundLinks) {
    assert.ok(inboundCount > 0, `${slug}: keine eingehende Empfehlung`);
  }
});

test("Schritte-Suchintention wird mit Primärquellen, ehrlicher Einordnung und Challenge-Einstieg beantwortet", () => {
  const article = habitArticles.find(({ slug }) => slug === "wie-viele-schritte-am-tag");

  assert.ok(article);
  assert.equal(article.relatedChallengeSlug, "10000-schritte-am-tag");
  assert.match(article.title, /Wie viele Schritte am Tag/);
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/40713949/"));
  assert.ok(article.sources.some(({ url }) => url.startsWith("https://www.who.int/")));
  assert.ok(article.sections.some(({ heading }) => heading === "Sind 10.000 Schritte am Tag notwendig?"));
  assert.ok(article.sections.some(({ heading }) => heading === "Sicher starten"));
  assert.ok(
    article.sections.flatMap(({ body }) => body).some((paragraph) =>
      paragraph.includes("keine medizinisch festgelegte Mindestgrenze")
    )
  );
});

test("Social-Media-Detox-Suchintention ordnet widersprüchliche Evidenz ein und führt zur passenden Challenge", () => {
  const article = habitArticles.find(({ slug }) => slug === "social-media-detox-sinnvoll");

  assert.ok(article);
  assert.equal(article.relatedChallengeSlug, "100-tage-ohne-soziale-medien");
  assert.match(article.title, /Social Media Detox/);
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/40038410/"));
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/40150185/"));
  assert.ok(article.sections.some(({ heading }) => heading === "Ist Social Media Detox sinnvoll?"));
  assert.ok(article.sections.some(({ heading }) => heading === "Wann eine Pause nicht ausreicht"));
  assert.ok(
    article.sections.flatMap(({ body }) => body).some((paragraph) =>
      paragraph.includes("keine garantierte Verbesserung")
    )
  );
});

test("Gewohnheitsdauer-Suchintention widerlegt starre Tagesregeln und führt in einen realistischen Challenge-Einstieg", () => {
  const article = habitArticles.find(({ slug }) => slug === "wie-lange-dauert-gewohnheit");

  assert.ok(article);
  assert.equal(article.relatedChallengeSlug, "change-your-life-in-90-tagen");
  assert.match(article.title, /Wie lange dauert es/);
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/39685110/"));
  assert.ok(article.sources.some(({ url }) => url === "https://pmc.ncbi.nlm.nih.gov/articles/PMC9226889/"));
  assert.ok(article.sections.some(({ heading }) => heading === "Sind 21 oder 66 Tage eine feste Regel?"));
  assert.ok(article.sections.some(({ heading }) => heading === "Was passiert, wenn du einen Tag auslässt?"));
  assert.ok(
    article.sections.flatMap(({ body }) => body).some((paragraph) =>
      paragraph.includes("59 bis 66 Tagen")
    )
  );
});

test("Habit-Loop-Artikel trennt das populäre Modell von belastbarer Habit-Forschung", () => {
  const article = habitArticles.find(({ slug }) => slug === "cue-routine-reward-challengehub");

  assert.ok(article);
  assert.equal(article.updatedAt, "2026-08-30");
  assert.equal(article.relatedChallengeSlug, "100-tage-ohne-soziale-medien");
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/38787601/"));
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/33405284/"));
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/30572936/"));
  assert.ok(article.sections.some(({ heading }) => heading === "Was das Drei-Schritte-Modell leisten kann"));
  assert.ok(
    article.sections.flatMap(({ body }) => body).some((paragraph) =>
      paragraph.includes("keine vollständige wissenschaftliche Theorie")
    )
  );
  assert.ok(
    article.sections.flatMap(({ body }) => body).some((paragraph) =>
      paragraph.includes("wiederholte Ausführung")
    )
  );
});

test("Habit-Rules-Artikel kennzeichnet Faustregeln und ersetzt pauschale Wirkversprechen durch Evidenzgrenzen", () => {
  const article = habitArticles.find(({ slug }) => slug === "habit-rules-fuer-challenges");

  assert.ok(article);
  assert.equal(article.updatedAt, "2026-08-30");
  assert.equal(article.relatedChallengeSlug, "change-your-life-in-90-tagen");
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/39685110/"));
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/38787601/"));
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/35756236/"));
  assert.equal(article.sections.length, 7);
  assert.ok(article.sections.some(({ heading }) => heading === "1. Verstehe die Regeln als Planungswerkzeuge"));
  assert.ok(article.sections.some(({ heading }) => heading === "7. Plane die Rückkehr statt Perfektion"));
  const content = article.sections.flatMap(({ body }) => body).join(" ");
  assert.match(content, /keine sieben wissenschaftlichen Gesetze/);
  assert.match(content, /beweist nicht, dass Tracking allein/);
  assert.doesNotMatch(content, /nie zweimal/i);
  assert.doesNotMatch(content, /Identitätsformel/i);
});

test("Tiny-Habits-Artikel trennt die Methode von der Forschung und begrenzt Belohnungsversprechen", () => {
  const article = habitArticles.find(({ slug }) => slug === "tiny-habits-challenges");

  assert.ok(article);
  assert.equal(article.updatedAt, "2026-08-31");
  assert.equal(article.relatedChallengeSlug, "10000-schritte-am-tag");
  assert.ok(article.sources.some(({ url }) => url === "https://behaviordesign.stanford.edu/resources/fogg-behavior-model"));
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/38787601/"));
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/39387277/"));
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/30572936/"));
  assert.ok(article.sections.some(({ heading }) => heading === "Methode und Evidenz auseinanderhalten"));
  assert.ok(article.sections.some(({ heading }) => heading === "Klein anfangen, später bewusst erweitern"));
  const content = article.sections.flatMap(({ body }) => body).join(" ");
  assert.match(content, /nicht als vollständige wissenschaftliche Gewohnheitstheorie/);
  assert.match(content, /keinen direkten Wirksamkeitsnachweis für die gesamte Tiny-Habits-Methode/);
  assert.match(content, /keinen Beleg dafür, dass jede direkte Selbstbelohnung/);
  assert.doesNotMatch(content, /Motivation schwankt, Design bleibt/);
});

test("Streak-Rückkehr-Artikel begrenzt Serienversprechen und führt zu einem konkreten Wiedereinstieg", () => {
  const article = habitArticles.find(({ slug }) => slug === "streak-verloren-wie-weitermachen");

  assert.ok(article);
  assert.equal(article.publishedAt, "2026-08-31");
  assert.equal(article.updatedAt, "2026-08-31");
  assert.equal(article.relatedChallengeSlug, "10000-schritte-am-tag");
  assert.deepEqual(article.relatedArticleSlugs, [
    "wie-lange-dauert-gewohnheit",
    "habit-rules-fuer-challenges"
  ]);
  assert.ok(article.sources.some(({ url }) => url === "https://pmc.ncbi.nlm.nih.gov/articles/PMC11494719/"));
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/28810473/"));
  assert.ok(article.sources.some(({ url }) => url === "https://pubmed.ncbi.nlm.nih.gov/39685110/"));
  assert.ok(article.sections.some(({ heading }) => heading === "Streak verloren: neu starten oder weitermachen?"));
  assert.ok(article.sections.some(({ heading }) => heading === "Ein einfacher Plan für den nächsten Check-in"));
  const content = article.sections.flatMap(({ body }) => body).join(" ");
  assert.match(content, /kein Wirksamkeitsnachweis für Streaks/);
  assert.match(content, /21 sehr erfahrene Freizeitläufer/);
  assert.match(content, /sieben Studien/);
  assert.doesNotMatch(content, /nie zweimal/i);
  assert.doesNotMatch(content, /Streak.*garantiert/i);
});

test("Sitemap nimmt veröffentlichte Challenges auf und entfernt Duplikate", () => {
  const existing = challenges[0];
  const sitemap = buildSitemap([
    { slug: existing.slug, createdAt: existing.createdAt },
    { slug: "neue-oeffentliche-challenge", createdAt: "2026-07-12T10:00:00.000Z" }
  ]);
  const urls = sitemap.map((entry) => entry.url);

  assert.equal(urls.filter((url) => url.endsWith(`/challenges/${existing.slug}`)).length, 1);
  assert.ok(urls.includes(`${SITE_URL}/challenges/neue-oeffentliche-challenge`));
  assert.ok(urls.every((url) => !url.includes("/meine-challenges")));
});

test("Challenge-Breadcrumbs verlinken die kanonische Hierarchie als strukturierte Daten", () => {
  const breadcrumb = buildChallengeBreadcrumbJsonLd(
    "10 000 Schritte am Tag Challenge",
    "10000-schritte-am-tag"
  );

  assert.equal(breadcrumb["@type"], "BreadcrumbList");
  assert.equal(
    breadcrumb["@id"],
    `${SITE_URL}/challenges/10000-schritte-am-tag#breadcrumb`
  );
  assert.deepEqual(
    breadcrumb.itemListElement.map(({ position, name, item }) => ({ position, name, item })),
    [
      { position: 1, name: "Startseite", item: SITE_URL },
      { position: 2, name: "Challenges", item: `${SITE_URL}/challenges` },
      {
        position: 3,
        name: "10 000 Schritte am Tag Challenge",
        item: `${SITE_URL}/challenges/10000-schritte-am-tag`
      }
    ]
  );
});

test("Wissensartikel-Breadcrumbs verlinken die kanonische Hierarchie als strukturierte Daten", () => {
  const breadcrumb = buildKnowledgeBreadcrumbJsonLd(
    "Die 7 Habit Rules für Challenges",
    "habit-rules-fuer-challenges"
  );

  assert.equal(breadcrumb["@type"], "BreadcrumbList");
  assert.equal(
    breadcrumb["@id"],
    `${SITE_URL}/wissen/habit-rules-fuer-challenges#breadcrumb`
  );
  assert.deepEqual(
    breadcrumb.itemListElement.map(({ position, name, item }) => ({ position, name, item })),
    [
      { position: 1, name: "Startseite", item: SITE_URL },
      { position: 2, name: "Wissen", item: `${SITE_URL}/wissen` },
      {
        position: 3,
        name: "Die 7 Habit Rules für Challenges",
        item: `${SITE_URL}/wissen/habit-rules-fuer-challenges`
      }
    ]
  );
});

test("Challenge-Katalog zeichnet eindeutige kanonische Detailseiten als ItemList aus", () => {
  const itemList = buildChallengeCatalogJsonLd([
    { slug: "10000-schritte-am-tag", title: "10 000 Schritte am Tag Challenge" },
    { slug: "community-lauf", title: "Community-Lauf" },
    { slug: "10000-schritte-am-tag", title: "Doppelter Eintrag" }
  ]);

  assert.equal(itemList["@context"], "https://schema.org");
  assert.equal(itemList["@type"], "ItemList");
  assert.equal(itemList["@id"], `${SITE_URL}/challenges#challenge-list`);
  assert.equal(itemList.numberOfItems, 2);
  assert.deepEqual(
    itemList.itemListElement.map(({ position, item }) => ({
      position,
      name: item.name,
      url: item.url
    })),
    [
      {
        position: 1,
        name: "10 000 Schritte am Tag Challenge",
        url: `${SITE_URL}/challenges/10000-schritte-am-tag`
      },
      {
        position: 2,
        name: "Community-Lauf",
        url: `${SITE_URL}/challenges/community-lauf`
      }
    ]
  );
});

test("Wissenskatalog zeichnet alle Artikel in stabiler Reihenfolge kanonisch als ItemList aus", () => {
  const itemList = buildKnowledgeCatalogJsonLd([
    { slug: "habit-rules-fuer-challenges", title: "Die 7 Habit Rules für Challenges" },
    { slug: "tiny-habits-challenges", title: "Tiny Habits für Challenges" }
  ]);

  assert.equal(itemList["@context"], "https://schema.org");
  assert.equal(itemList["@type"], "ItemList");
  assert.equal(itemList["@id"], `${SITE_URL}/wissen#article-list`);
  assert.equal(itemList.numberOfItems, 2);
  assert.deepEqual(
    itemList.itemListElement.map(({ position, item }) => ({
      position,
      name: item.name,
      url: item.url
    })),
    [
      {
        position: 1,
        name: "Die 7 Habit Rules für Challenges",
        url: `${SITE_URL}/wissen/habit-rules-fuer-challenges`
      },
      {
        position: 2,
        name: "Tiny Habits für Challenges",
        url: `${SITE_URL}/wissen/tiny-habits-challenges`
      }
    ]
  );
});
