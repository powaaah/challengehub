"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { challenges, levelLabels, type ChallengeLevel } from "@/data/challenges";
import type { CurrentUser } from "@/lib/auth";
import type { PublicChallenge } from "@/domain/challenges/public-challenge";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import { SiteFooter, SiteHeader } from "./site-shell";
import {
  readUserChallenges,
  subscribeToUserChallenges,
  type UserChallenge
} from "./user-challenges-storage";
import styles from "./challenge-hub-app.module.css";

type Dialog = "filter" | null;
export type SortKey = "standard" | "newest" | "participants";

const levelOptions: ChallengeLevel[] = ["User", "Beginner", "Advanced", "Premium"];
const CATALOG_PAGE_SIZE = 12;

export function ChallengeHubApp({
  participantCounts,
  user
}: {
  participantCounts: Record<string, number>;
  user: CurrentUser | null;
}) {
  const stepsParticipants = participantCounts["10000-schritte-am-tag"] ?? 0;

  return (
    <>
      <SiteHeader user={user} />

      <main id="main-content" tabIndex={-1} className={styles.homeMain}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Gemeinsam Ziele erreichen</p>
            <h1>Starte eine Challenge. Bleib gemeinsam dran.</h1>
            <p>
              Wähle ein konkretes Ziel, lade einen Freund ein und sieh jeden Tag,
              wer wirklich dranbleibt. Kostenlos, transparent und ohne erfundene Motivationstricks.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/challenges/10000-schritte-am-tag">
                Kostenlos Challenge starten
              </Link>
              <Link className={styles.secondaryButton} href="/challenges">
                Alle Challenges entdecken
              </Link>
            </div>
          </div>
          <div className={styles.productPreview} aria-label="Echte ChallengeHub Produktvorschau">
            <p>Deine Challenge</p>
            <strong>10 000 Schritte am Tag</strong>
            <dl>
              <div><dt>Teilnehmer</dt><dd>{stepsParticipants}</dd></div>
              <div><dt>Heute</dt><dd>Check-in offen</dd></div>
              <div><dt>Ranking</dt><dd>Startet mit echten Check-ins</dd></div>
            </dl>
          </div>
        </section>

        <section className={styles.starterSection} aria-labelledby="starter-title">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>Direkt loslegen</p>
            <h2 id="starter-title">Drei klare Start-Challenges</h2>
            <p>Kein endloses Stöbern: Wähle ein Ziel, das heute verständlich beginnt.</p>
          </div>
          <div className={styles.starterGrid}>
            <Link data-testid="starter-challenge" href="/challenges/10000-schritte-am-tag">
              <span>Bewegung</span><strong>10 000 Schritte am Tag</strong><small>Täglicher Check-in</small>
            </Link>
            <Link data-testid="starter-challenge" href="/challenges/30-tage-ohne-zucker">
              <span>Ernährung</span><strong>30 Tage ohne Zucker</strong><small>Klare 30-Tage-Regel</small>
            </Link>
            <Link data-testid="starter-challenge" href="/challenges/100-tage-ohne-soziale-medien">
              <span>Fokus</span><strong>100 Tage ohne soziale Medien</strong><small>Bewusster digitaler Alltag</small>
            </Link>
          </div>
        </section>

        <section className={styles.stepsSection} aria-labelledby="steps-title">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>Einfacher Produktloop</p>
            <h2 id="steps-title">So funktioniert’s</h2>
          </div>
          <ol className={styles.stepsGrid}>
            <li><span>1</span><strong>Challenge wählen</strong><p>Starte mit einem konkreten Ziel und klaren Regeln.</p></li>
            <li><span>2</span><strong>Freund einladen</strong><p>Teile einen sicheren Einmal-Link mit deinem Challenge Mate.</p></li>
            <li><span>3</span><strong>Täglich einchecken</strong><p>Eure echten Check-ins bilden Fortschritt, Serie und Ranking.</p></li>
          </ol>
        </section>

        <section className={styles.accountabilitySection}>
          <div>
            <p className={styles.kicker}>Challenge Mate</p>
            <h2>Gemeinsam verbindlich</h2>
            <p>
              Ein Ziel wird greifbarer, wenn jemand mitzieht. Nach dem Start erzeugst du im
              privaten Challenge-Raum einen zeitlich begrenzten Einladungslink. Erst echte
              Check-ins füllen euer gemeinsames Ranking.
            </p>
          </div>
          <div className={styles.accountabilityCard} aria-label="Beispiel für den echten Einladungsablauf">
            <span>1. Teilnahme starten</span>
            <span>2. Einladungslink teilen</span>
            <span>3. Gemeinsam einchecken</span>
          </div>
        </section>

        <section className={styles.trustSection}>
          <div>
            <p className={styles.kicker}>Vertrauen</p>
            <h2>Privat und sicher starten</h2>
            <p>
              Passwörter und Einladungen werden geschützt verarbeitet. Öffentliche Community-
              Challenges erscheinen erst nach Prüfung. Du entscheidest, welchen Link du mit wem teilst.
            </p>
            <Link href="/sicherheit">Mehr über Sicherheit erfahren</Link>
          </div>
          <div>
            <strong>Keine erfundenen Erfolge</strong>
            <p>Teilnehmerzahlen, Rankings und Aktivität entstehen ausschließlich aus echten Daten.</p>
          </div>
        </section>

        <section className={styles.finalCta}>
          <h2>Welches Ziel willst du diesmal wirklich durchziehen?</h2>
          <p>Starte mit der 10 000-Schritte-Challenge und lade danach deinen Challenge Mate ein.</p>
          <Link className={styles.primaryButton} href="/challenges/10000-schritte-am-tag">
            Kostenlos Challenge starten
          </Link>
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
  const [dialog, setDialog] = useState<Dialog>(null);
  const [sortKey, setSortKey] = useState<SortKey>(initialSortKey);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedLevels, setSelectedLevels] = useState<ChallengeLevel[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [visibleCount, setVisibleCount] = useState(CATALOG_PAGE_SIZE);

  useEffect(() => {
    function syncUserChallenges() {
      setUserChallenges(readUserChallenges());
    }

    syncUserChallenges();
    return subscribeToUserChallenges(syncUserChallenges);
  }, []);

  const visibleChallenges = useMemo(() => {
    const normalizedSearch = normalizeSearchText(searchQuery);
    const allChallenges = [
      ...serverChallenges.map((challenge) => ({
        ...challenge,
        participants: participantCounts[challenge.slug] ?? 0,
        duration: `${challenge.durationDays} Tage`,
        isUserCreated: true,
        sourceLabel: `Von ${challenge.creatorName}`
      })),
      ...userChallenges.map((challenge) => ({
        ...challenge,
        participants: 0,
        duration: `${challenge.durationDays} Tage`,
        isUserCreated: true,
        sourceLabel: "Lokale User Challenge"
      })),
      ...challenges.map((challenge) => ({
        ...challenge,
        participants: participantCounts[challenge.slug] ?? 0,
        category: "Kuratierte Challenge",
        durationDays: undefined,
        isUserCreated: false,
        sourceLabel: levelLabels[challenge.level]
      }))
    ];
    const filtered = allChallenges.filter((challenge) => {
      const levelMatches = selectedLevels.length === 0 || selectedLevels.includes(challenge.level);
      const searchMatches =
        normalizedSearch.length === 0 ||
        normalizeSearchText(`${challenge.title} ${levelLabels[challenge.level]} ${challenge.category}`).includes(
          normalizedSearch
        );

      return levelMatches && searchMatches;
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
  }, [participantCounts, searchQuery, selectedLevels, sortKey, userChallenges, serverChallenges]);

  function toggleLevel(level: ChallengeLevel) {
    setVisibleCount(CATALOG_PAGE_SIZE);
    setSelectedLevels((current) =>
      current.includes(level) ? current.filter((item) => item !== level) : [...current, level]
    );
  }

  return (
    <>
      <SiteHeader user={user} />

      <main id="main-content" tabIndex={-1} className={styles.catalogPage}>
        <section className={styles.catalogHero}>
          <p className={styles.kicker}>Challenge-Katalog</p>
          <h1>Finde deine nächste Challenge</h1>
          <p>
            Suche nach kuratierten und öffentlichen Challenges, filtere nach Level
            und starte die Aufgabe, bei der du dich messen willst.
          </p>
        </section>

        <section className={styles.challengeSection} id="challenges">
          <div className={styles.toolbar}>
            <button className={styles.filterButton} type="button" onClick={() => setDialog("filter")}>
              Filter
            </button>
            <label className={styles.searchLabel}>
              <span>Suche:</span>
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
              <span>Sortieren nach:</span>
              <select value={sortKey} onChange={(event) => {
                setSortKey(event.target.value as SortKey);
                setVisibleCount(CATALOG_PAGE_SIZE);
              }}>
                <option value="standard">Standard</option>
                <option value="newest">Neueste</option>
                <option value="participants">Teilnehmer</option>
              </select>
            </label>
            <Link className={styles.addButton} href="/challenges/neu">
              Neue Challenge hinzufügen
            </Link>
          </div>

          <p className={styles.resultSummary} aria-live="polite">
            {visibleChallenges.length} Challenges gefunden
          </p>
          <div className={styles.grid}>
            {visibleChallenges.slice(0, visibleCount).map((challenge) => (
              <Link data-testid="challenge-card" className={styles.tileLink} href={`/challenges/${challenge.slug}`} key={challenge.slug}>
                <article className={`${styles.tile} ${styles[challenge.level]}`}>
                  <h2>{challenge.title}</h2>
                  <p>{challenge.sourceLabel}</p>
                  <div className={styles.tileMeta}>
                    <span>
                      <Image src="/images/icon_participants.png" width={24} height={24} alt="" />
                      {challenge.participants}
                    </span>
                    <span>{challenge.duration}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          {visibleCount < visibleChallenges.length && (
            <div className={styles.loadMoreRow}>
              <button className={styles.secondaryButton} type="button" onClick={() => setVisibleCount((count) => count + CATALOG_PAGE_SIZE)}>
                Mehr Challenges laden
              </button>
            </div>
          )}
          {visibleChallenges.length === 0 && <EmptyChallengeState />}
        </section>
      </main>

      <SiteFooter />

      {dialog === "filter" && (
        <Modal title="Filter" onClose={() => setDialog(null)}>
          <div className={styles.filterGroup}>
            <strong>Challenge-Typ:</strong>
            {levelOptions.map((level) => (
              <label className={styles.checkbox} key={level}>
                <input
                  type="checkbox"
                  checked={selectedLevels.includes(level)}
                  onChange={() => toggleLevel(level)}
                />
                {levelLabels[level]}
              </label>
            ))}
          </div>
          <div className={styles.formRow}>
            <button className={styles.primaryButton} type="button" onClick={() => setDialog(null)}>
              Filter anwenden
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => {
                setSelectedLevels([]);
                setVisibleCount(CATALOG_PAGE_SIZE);
              }}
            >
              Zurücksetzen
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function EmptyChallengeState() {
  return (
    <div className={styles.emptyState}>
      <p>Keine Challenge passt zu deiner Suche oder den aktiven Filtern.</p>
      <Link href="/challenges/neu">Keine passende Challenge gefunden? Neue Challenge vorschlagen</Link>
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

function Modal({
  title,
  children,
  onClose
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const dialogFocus = useDialogFocus({ containerRef: dialogRef, initialFocusRef, onClose });

  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={dialogFocus.onKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button ref={initialFocusRef} className={styles.closeButton} type="button" aria-label="Dialog schließen" onClick={onClose}>
          x
        </button>
        <Image src="/logo.png" width={150} height={49} alt="ChallengeHub" />
        <h2 id="modal-title">{title}</h2>
        {children}
      </section>
    </div>
  );
}
