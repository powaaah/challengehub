import type { MetadataRoute } from "next";
import { challenges } from "../data/challenges.ts";
import { habitArticles } from "../data/habit-articles.ts";

export const SITE_URL = "https://challengehub.de";

export function buildChallengeSocialImageMetadata(title: string, slug: string) {
  return {
    url: `${SITE_URL}/challenges/${encodeURIComponent(slug)}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: `${title} auf ChallengeHub`
  };
}

export function buildKnowledgeSocialImageMetadata(title: string, slug: string) {
  return {
    url: `${SITE_URL}/wissen/${encodeURIComponent(slug)}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: `${title} | ChallengeHub Wissen`
  };
}

export function buildHomePageJsonLd() {
  const organizationId = `${SITE_URL}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
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
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "ChallengeHub",
        url: `${SITE_URL}/`,
        inLanguage: "de-DE",
        publisher: {
          "@id": organizationId
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/challenges?suche={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };
}

type ChallengeCatalogEntry = {
  slug: string;
  title: string;
};

export function buildChallengeCatalogJsonLd(entries: ChallengeCatalogEntry[]) {
  const seenSlugs = new Set<string>();
  const uniqueEntries = entries.filter((entry) => {
    if (seenSlugs.has(entry.slug)) {
      return false;
    }

    seenSlugs.add(entry.slug);
    return true;
  });

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/challenges#challenge-list`,
    name: "Challenge-Katalog",
    numberOfItems: uniqueEntries.length,
    itemListElement: uniqueEntries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        name: entry.title,
        url: `${SITE_URL}/challenges/${entry.slug}`
      }
    }))
  };
}

type KnowledgeCatalogEntry = {
  slug: string;
  title: string;
};

export function buildKnowledgeCatalogJsonLd(entries: KnowledgeCatalogEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/wissen#article-list`,
    name: "ChallengeHub Wissen",
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Article",
        name: entry.title,
        url: `${SITE_URL}/wissen/${entry.slug}`
      }
    }))
  };
}

export function buildChallengeBreadcrumbJsonLd(title: string, slug: string) {
  const challengeUrl = `${SITE_URL}/challenges/${slug}`;

  return {
    "@type": "BreadcrumbList",
    "@id": `${challengeUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Startseite",
        item: SITE_URL
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Challenges",
        item: `${SITE_URL}/challenges`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: challengeUrl
      }
    ]
  };
}

export function buildKnowledgeBreadcrumbJsonLd(title: string, slug: string) {
  const articleUrl = `${SITE_URL}/wissen/${slug}`;

  return {
    "@type": "BreadcrumbList",
    "@id": `${articleUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Startseite",
        item: SITE_URL
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Wissen",
        item: `${SITE_URL}/wissen`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: articleUrl
      }
    ]
  };
}

const publicStaticRoutes = [
  "",
  "/challenges",
  "/wissen",
  "/sicherheit",
  "/datenschutz",
  "/impressum",
  "/karriere"
] as const;

type PublishedChallenge = {
  slug: string;
  createdAt: string;
};

export function buildSitemap(publishedChallenges: PublishedChallenge[] = []): MetadataRoute.Sitemap {
  const challengeDates = new Map<string, string>();

  for (const challenge of [...challenges, ...publishedChallenges]) {
    const currentDate = challengeDates.get(challenge.slug);
    if (!currentDate || challenge.createdAt > currentDate) {
      challengeDates.set(challenge.slug, challenge.createdAt);
    }
  }

  return [
    ...publicStaticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      changeFrequency: route === "" || route === "/challenges" ? "daily" as const : "monthly" as const,
      priority: route === "" ? 1 : route === "/challenges" ? 0.9 : 0.5
    })),
    ...Array.from(challengeDates, ([slug, createdAt]) => ({
      url: `${SITE_URL}/challenges/${slug}`,
      lastModified: new Date(createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    ...habitArticles.map((article) => ({
      url: `${SITE_URL}/wissen/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6
    }))
  ];
}
