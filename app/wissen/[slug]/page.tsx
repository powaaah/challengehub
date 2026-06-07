import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHabitArticleBySlug, habitArticles } from "@/data/habit-articles";
import styles from "./page.module.css";

const siteUrl = "https://challengehub.de";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return habitArticles.map((article) => ({
    slug: article.slug
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getHabitArticleBySlug(slug);

  if (!article) {
    return {
      title: "Wissen nicht gefunden - ChallengeHub"
    };
  }

  const url = `/wissen/${article.slug}`;

  return {
    title: `${article.title} | ChallengeHub Wissen`,
    description: article.seoDescription,
    alternates: {
      canonical: url
    },
    openGraph: {
      type: "article",
      title: `${article.title} | ChallengeHub Wissen`,
      description: article.seoDescription,
      url,
      siteName: "ChallengeHub",
      locale: "de_DE",
      publishedTime: article.publishedAt,
      tags: [article.category, "Habits", "Gewohnheiten", "Challenges"]
    },
    twitter: {
      card: "summary",
      title: `${article.title} | ChallengeHub Wissen`,
      description: article.seoDescription
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getHabitArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const pageUrl = `${siteUrl}/wissen/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: pageUrl,
    author: {
      "@type": "Organization",
      name: "ChallengeHub"
    },
    publisher: {
      "@type": "Organization",
      name: "ChallengeHub",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`
      }
    },
    citation: article.sources.map((source) => source.url)
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <header className={styles.header}>
        <Link className={styles.logoLink} href="/" aria-label="ChallengeHub Startseite">
          <Image src="/logo.png" width={214} height={70} alt="ChallengeHub" priority />
        </Link>
        <nav className={styles.nav} aria-label="Artikel Navigation">
          <Link href="/#challenges">Challenges</Link>
          <Link href="/wissen">Wissen</Link>
        </nav>
      </header>

      <article className={styles.article}>
        <Link className={styles.backLink} href="/wissen">
          Zurueck zum Wissen
        </Link>
        <p className={styles.kicker}>{article.category} | {article.readTime}</p>
        <h1>{article.title}</h1>
        <p className={styles.excerpt}>{article.excerpt}</p>

        <section className={styles.takeaways} aria-labelledby="takeaways">
          <h2 id="takeaways">Kurz gesagt</h2>
          <ul>
            {article.takeaways.map((takeaway) => (
              <li key={takeaway}>{takeaway}</li>
            ))}
          </ul>
        </section>

        {article.sections.map((section) => (
          <section className={styles.section} key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className={styles.sources} aria-labelledby="sources">
          <h2 id="sources">Buecher und Quellen</h2>
          <div>
            {article.sources.map((source) => (
              <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                {source.label}
              </a>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
