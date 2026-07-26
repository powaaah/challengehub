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
