"use client";

import { pageContent } from "@/data/pages.generated";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { challenges, levelLabels } from "@/data/challenges";
import type { CurrentUser } from "@/lib/auth";
import type { PublicChallenge } from "@/domain/challenges/public-challenge";
import { CatalogFilter } from "./catalog-filter";
import { emptyCatalogFilters, getChallengeFormat, matchesCatalogFilters, type CatalogFilters } from "@/domain/challenges/catalog-filters";
import { SiteFooter, SiteHeader } from "./site-shell";
import {
  readUserChallenges,
  subscribeToUserChallenges,
  type UserChallenge
} from "./user-challenges-storage";
import styles from "./challenge-hub-app.module.css";

type Dialog = "filter" | null;
export type SortKey = "standard" | "newest" | "participants";

const CATALOG_PAGE_SIZE = 12;

export function ChallengeHubApp({ user }: { user: CurrentUser | null }) {
  const copy = pageContent.startseite;

  return (
    <>
      <SiteHeader user={user} />

      <main id="main-content" tabIndex={-1} className={styles.homeMain}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>{copy["gemeinsam-ziele-erreichen"]}</p>
            <h1>{copy["starte-eine-challenge-bleib-gemeinsam-dran"]}</h1>
            <p>{copy["wahle-ein-konkretes-ziel-lade-einen"]}</p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/challenges">{copy["alle-challenges-entdecken"]}</Link>
            </div>
          </div>
        </section>

        <section className={styles.starterSection} aria-labelledby="variants-title">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>{copy["varianten-kicker"]}</p>
            <h2 id="variants-title">{copy["drei-challenge-varianten"]}</h2>
            <p>{copy["varianten-intro"]}</p>
          </div>
          <div className={styles.variantsGrid}>
            <article className={styles.variantCard} data-testid="challenge-variant">
              <p className={styles.variantLabel}>{copy["einmalchallenge"]}</p>
              <h3>{copy["einmal-ziel"]}</h3>
              <p>{copy["einmal-beschreibung"]}</p>
            </article>
            <article className={styles.variantCard} data-testid="challenge-variant">
              <p className={styles.variantLabel}>{copy["zeitraum-titel"]}</p>
              <h3>{copy["zeitraum-ziel"]}</h3>
              <p>{copy["zeitraum-beschreibung"]}</p>
            </article>
            <article className={styles.variantCard} data-testid="challenge-variant">
              <p className={styles.variantLabel}>{copy["dauer-titel"]}</p>
              <h3>{copy["dauer-ziel"]}</h3>
              <p>{copy["dauer-beschreibung"]}</p>
            </article>
          </div>
        </section>

        <section id="so-funktionierts" className={styles.stepsSection} aria-labelledby="steps-title">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>{copy["einfacher-produktloop"]}</p>
            <h2 id="steps-title">{copy["so-funktionierts"]}</h2>
          </div>
          <ol className={styles.stepsGrid}>
            <li><span>{copy["1"]}</span><strong>{copy["challenge-wahlen"]}</strong><p>{copy["starte-mit-einem-konkreten-ziel-und"]}</p></li>
            <li><span>{copy["2"]}</span><strong>{copy["freund-einladen"]}</strong><p>{copy["teile-einen-sicheren-einmal-link-mit"]}</p></li>
            <li><span>{copy["3"]}</span><strong>{copy["taglich-einchecken"]}</strong><p>{copy["eure-echten-check-ins-bilden-fortschritt"]}</p></li>
          </ol>
        </section>

        <section className={styles.accountabilitySection}>
          <div>
            <p className={styles.kicker}>{copy["challenge-mate"]}</p>
            <h2>{copy["gemeinsam-verbindlich"]}</h2>
            <p>{copy["ein-ziel-wird-greifbarer-wenn-jemand"]}</p>
          </div>
          <div className={styles.accountabilityCard} aria-label="Beispiel für den echten Einladungsablauf">
            <span>{copy["1-teilnahme-starten"]}</span>
            <span>{copy["2-einladungslink-teilen"]}</span>
            <span>{copy["3-gemeinsam-einchecken"]}</span>
          </div>
        </section>

        <section className={styles.trustSection}>
          <div>
            <p className={styles.kicker}>{copy["vertrauen"]}</p>
            <h2>{copy["privat-und-sicher-starten"]}</h2>
            <p>{copy["passworter-und-einladungen-werden-geschutzt-verarbeitet"]}</p>
            <Link href="/sicherheit">{copy["mehr-uber-sicherheit-erfahren"]}</Link>
          </div>
          <div>
            <strong>{copy["keine-erfundenen-erfolge"]}</strong>
            <p>{copy["teilnehmerzahlen-rankings-und-aktivitat-entstehen-ausschlielich"]}</p>
          </div>
        </section>

        <section className={styles.finalCta}>
          <h2>{copy["welches-ziel-willst-du-diesmal-wirklich"]}</h2>
          <p>{copy["starte-mit-der-10-000-schritte"]}</p>
          <Link className={styles.primaryButton} href="/challenges/10000-schritte-am-tag">{copy["kostenlos-challenge-starten"]}</Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

type ChallengeCatalogAppProps = {
  participantCounts: Record<string, number>;
  user: CurrentUser | null;
  serverChallenges: PublicChallenge[];
  initialSearchQuery?: string;
  initialSortKey?: SortKey;
};

export function ChallengeCatalogApp({
  participantCounts,
  user,
  serverChallenges,
  initialSearchQuery = "",
  initialSortKey = "standard"
}: ChallengeCatalogAppProps) {
  const copy = pageContent.challenges;
  const [dialog, setDialog] = useState<Dialog>(null);
  const [sortKey, setSortKey] = useState<SortKey>(initialSortKey);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filters, setFilters] = useState<CatalogFilters>(emptyCatalogFilters);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [visibleCount, setVisibleCount] = useState(CATALOG_PAGE_SIZE);

  useEffect(() => {
    function syncUserChallenges() {
      setUserChallenges(readUserChallenges());
    }

    syncUserChallenges();
    return subscribeToUserChallenges(syncUserChallenges);
  }, []);

  const matchingSearchChallenges = useMemo(() => {
    const normalizedSearch = normalizeSearchText(searchQuery);
    const allChallenges = [
      ...serverChallenges.map((challenge) => ({
        ...challenge,
        format: getChallengeFormat(challenge),
        participants: participantCounts[challenge.slug] ?? 0,
        duration: `${challenge.durationDays} Tage`,
        isUserCreated: true,
        sourceLabel: `Von ${challenge.creatorName}`
      })),
      ...userChallenges.map((challenge) => ({
        ...challenge,
        format: getChallengeFormat(challenge),
        participants: 0,
        duration: `${challenge.durationDays} Tage`,
        isUserCreated: true,
        sourceLabel: "Lokale User Challenge"
      })),
      ...challenges.map((challenge) => ({
        ...challenge,
        format: getChallengeFormat(challenge),
        participants: participantCounts[challenge.slug] ?? 0,
        category: "Kuratierte Challenge",
        durationDays: undefined,
        isUserCreated: false,
        sourceLabel: levelLabels[challenge.level]
      }))
    ];
    const filtered = allChallenges.filter((challenge) => {
      const searchMatches =
        normalizedSearch.length === 0 ||
        normalizeSearchText(`${challenge.title} ${levelLabels[challenge.level]} ${challenge.category}`).includes(
          normalizedSearch
        );

      return searchMatches;
    });

    return [...filtered].sort((left, right) => {
      if (sortKey === "newest") {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }

      if (sortKey === "participants") {
        return right.participants - left.participants;
      }

      return 0;
    });
  }, [participantCounts, searchQuery, sortKey, userChallenges, serverChallenges]);

  const visibleChallenges = matchingSearchChallenges.filter(challenge => matchesCatalogFilters(challenge, filters));

  return (
    <>
      <SiteHeader user={user} />

      <main id="main-content" tabIndex={-1} className={styles.catalogPage}>
        <section className={styles.catalogHero}>
          <p className={styles.kicker}>{copy["challenge-katalog"]}</p>
          <h1>{copy["finde-deine-nachste-challenge"]}</h1>
          <p>{copy["suche-nach-kuratierten-und-offentlichen-challenges"]}</p>
        </section>

        <section className={styles.challengeSection} id="challenges">
          <div className={styles.toolbar}>
            <button className={styles.filterButton} type="button" onClick={() => setDialog("filter")}>{copy["filter"]}</button>
            <label className={styles.searchLabel}>
              <span>{copy["suche"]}</span>
              <input
                type="search"
                value={searchQuery}
                placeholder="Challenge suchen"
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setVisibleCount(CATALOG_PAGE_SIZE);
                }}
              />
            </label>
            <label className={styles.sortLabel}>
              <span>{copy["sortieren-nach"]}</span>
              <select value={sortKey} onChange={(event) => {
                setSortKey(event.target.value as SortKey);
                setVisibleCount(CATALOG_PAGE_SIZE);
              }}>
                <option value="standard">{copy["standard"]}</option>
                <option value="newest">{copy["neueste"]}</option>
                <option value="participants">{copy["teilnehmer"]}</option>
              </select>
            </label>
            <Link className={styles.addButton} href="/challenges/neu">{copy["neue-challenge-hinzufugen"]}</Link>
          </div>

          <p className={styles.resultSummary} aria-live="polite">
            {visibleChallenges.length}{" "}{copy["challenges-gefunden"]}</p>
          <div className={styles.grid}>
            {visibleChallenges.slice(0, visibleCount).map((challenge) => (
              <Link data-testid="challenge-card" className={styles.tileLink} href={`/challenges/${challenge.slug}`} key={challenge.slug}>
                <article className={`${styles.tile} ${styles[challenge.level]}`}>
                  <h2>{challenge.title}</h2>
                  <p>{challenge.sourceLabel}</p>
                  <div className={styles.tileMeta}>
                    <span>
                      {challenge.participants}{" "}{copy["teilnehmer"]}</span>
                    <span>{challenge.duration}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          {visibleCount < visibleChallenges.length && (
            <div className={styles.loadMoreRow}>
              <button className={styles.secondaryButton} type="button" onClick={() => setVisibleCount((count) => count + CATALOG_PAGE_SIZE)}>{copy["mehr-challenges-laden"]}</button>
            </div>
          )}
          {visibleChallenges.length === 0 && <EmptyChallengeState />}
        </section>
      </main>

      <SiteFooter />

      {dialog === "filter" && (
        <CatalogFilter
          value={filters}
          countResults={draft => matchingSearchChallenges.filter(challenge => matchesCatalogFilters(challenge, draft)).length}
          onClose={() => setDialog(null)}
          onApply={draft => {
            setFilters(draft);
            setVisibleCount(CATALOG_PAGE_SIZE);
            setDialog(null);
          }}
        />
      )}
    </>
  );
}

function EmptyChallengeState() {
  const copy = pageContent.challenges;
  return (
    <div className={styles.emptyState}>
      <p>{copy["keine-challenge-passt-zu-deiner-suche"]}</p>
      <Link href="/challenges/neu">{copy["keine-passende-challenge-gefunden-neue-challenge"]}</Link>
    </div>
  );
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
