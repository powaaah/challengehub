"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { logoutAction } from "@/app/auth/actions";
import { challenges, levelLabels, type ChallengeLevel } from "@/data/challenges";
import type { CurrentUser } from "@/lib/auth";
import type { DbPublicChallenge } from "@/lib/db";
import {
  readUserChallenges,
  subscribeToUserChallenges,
  type UserChallenge
} from "./user-challenges-storage";
import styles from "./challenge-hub-app.module.css";

type Dialog = "filter" | null;
export type SortKey = "standard" | "newest" | "participants" | "rating";

const levelOptions: ChallengeLevel[] = ["User", "Beginner", "Advanced", "Premium"];

export function ChallengeHubApp({ user }: { user: CurrentUser | null }) {
  return (
    <>
      <SiteHeader user={user} />

      <main className={styles.homeMain}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Reach. Your. Goals.</p>
            <h1>Unleash Your Potential and Reach Your Goals</h1>
            <p>
              Wir wollen, dass jeder Mensch happy ist. Als Gemeinschaft halten wir zusammen,
              motivieren uns gegenseitig und meistern dadurch auch grosse Herausforderungen.
            </p>
            <form className={styles.heroSearch} role="search" action="/challenges">
              <label className={styles.visuallyHidden} htmlFor="hero-challenge-search">
                Challenge suchen
              </label>
              <input
                id="hero-challenge-search"
                name="suche"
                type="search"
                placeholder="Welche Challenge suchst du?"
              />
              <button className={styles.primaryButton} type="submit">
                Find your challenge
              </button>
            </form>
          </div>
          <div className={styles.heroPanel} aria-label="ChallengeHub Auszug">
            <div className={styles.goalCard}>
              <span>Heute</span>
              <strong>10.000 Schritte am Tag</strong>
              <small>65 Teilnehmer | 4.8/5 Bewertung</small>
            </div>
            <div className={styles.goalCard}>
              <span>30 Tage</span>
              <strong>Ohne Zucker</strong>
              <small>Premium Challenge</small>
            </div>
            <div className={styles.goalCard}>
              <span>Fokus</span>
              <strong>100 Tage ohne soziale Medien</strong>
              <small>Advanced Challenge</small>
            </div>
          </div>
        </section>

        <section className={styles.socialBar} aria-label="ChallengeHub Social Links">
          <a href="https://www.instagram.com/challengehub_de/" target="_blank" rel="noreferrer">
            <Image src="/images/instagram.svg" width={38} height={38} alt="Instagram" />
          </a>
          <a href="https://www.youtube.com/@ChallengeHub_DE" target="_blank" rel="noreferrer">
            <Image src="/images/youtube.svg" width={48} height={48} alt="YouTube" />
          </a>
          <a href="https://www.tiktok.com/@ChallengeHub_de" target="_blank" rel="noreferrer">
            <Image src="/images/tiktok.svg" width={40} height={40} alt="TikTok" />
          </a>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

type ChallengeCatalogAppProps = {
  user: CurrentUser | null;
  serverChallenges: DbPublicChallenge[];
  initialSearchQuery?: string;
  initialSortKey?: SortKey;
};

export function ChallengeCatalogApp({
  user,
  serverChallenges,
  initialSearchQuery = "",
  initialSortKey = "standard"
}: ChallengeCatalogAppProps) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [sortKey, setSortKey] = useState<SortKey>(initialSortKey);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedLevels, setSelectedLevels] = useState<ChallengeLevel[]>([]);
  const [minimumRating, setMinimumRating] = useState(0);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);

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
        participants: 0,
        rating: 0,
        duration: `${challenge.durationDays} Tage`,
        isUserCreated: true,
        sourceLabel: `Von ${challenge.creatorName}`
      })),
      ...userChallenges.map((challenge) => ({
        ...challenge,
        participants: 0,
        rating: 0,
        duration: `${challenge.durationDays} Tage`,
        isUserCreated: true,
        sourceLabel: "Lokale User Challenge"
      })),
      ...challenges.map((challenge) => ({
        ...challenge,
        category: "Kuratierte Challenge",
        durationDays: undefined,
        isUserCreated: false,
        sourceLabel: levelLabels[challenge.level]
      }))
    ];
    const filtered = allChallenges.filter((challenge) => {
      const levelMatches = selectedLevels.length === 0 || selectedLevels.includes(challenge.level);
      const ratingMatches = challenge.rating >= minimumRating;
      const searchMatches =
        normalizedSearch.length === 0 ||
        normalizeSearchText(`${challenge.title} ${levelLabels[challenge.level]} ${challenge.category}`).includes(
          normalizedSearch
        );

      return levelMatches && ratingMatches && searchMatches;
    });

    return [...filtered].sort((left, right) => {
      if (sortKey === "newest") {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }

      if (sortKey === "participants") {
        return right.participants - left.participants;
      }

      if (sortKey === "rating") {
        return right.rating - left.rating;
      }

      return 0;
    });
  }, [minimumRating, searchQuery, selectedLevels, sortKey, userChallenges, serverChallenges]);

  function toggleLevel(level: ChallengeLevel) {
    setSelectedLevels((current) =>
      current.includes(level) ? current.filter((item) => item !== level) : [...current, level]
    );
  }

  return (
    <>
      <SiteHeader user={user} />

      <main className={styles.catalogPage}>
        <section className={styles.catalogHero}>
          <p className={styles.kicker}>Challenge-Katalog</p>
          <h1>Finde deine nächste Challenge</h1>
          <p>
            Suche nach kuratierten und öffentlichen Challenges, filtere nach Level
            und starte die Aufgabe, die zu deinem Ziel passt.
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
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
            <label className={styles.sortLabel}>
              <span>Sortieren nach:</span>
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
                <option value="standard">Standard</option>
                <option value="newest">Neueste</option>
                <option value="participants">Teilnehmer</option>
                <option value="rating">Bewertung</option>
              </select>
            </label>
            <Link className={styles.addButton} href="/challenges/neu">
              Neue Challenge hinzufügen
            </Link>
          </div>

          <div className={styles.grid}>
            {visibleChallenges.map((challenge) => (
              <Link className={styles.tileLink} href={`/challenges/${challenge.slug}`} key={challenge.slug}>
                <article className={`${styles.tile} ${styles[challenge.level]}`}>
                  <h2>{challenge.title}</h2>
                  <p>{challenge.sourceLabel}</p>
                  <div className={styles.tileMeta}>
                    <span>
                      <Image src="/images/icon_participants.png" width={24} height={24} alt="" />
                      {challenge.participants}
                    </span>
                    <span>
                      <Image src="/images/icon_stern.png" width={24} height={24} alt="" />
                      {challenge.rating.toFixed(1)}/5
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          {visibleChallenges.length === 0 && <EmptyChallengeState />}
        </section>
      </main>

      <SiteFooter />

      {dialog === "filter" && (
        <Modal title="Filter" onClose={() => setDialog(null)}>
          <div className={styles.filterGroup}>
            <strong>Schwierigkeitsgrad:</strong>
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
          <label className={styles.rangeLabel}>
            Bewertung ab {minimumRating.toFixed(1)}
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={minimumRating}
              onChange={(event) => setMinimumRating(Number(event.target.value))}
            />
          </label>
          <div className={styles.formRow}>
            <button className={styles.primaryButton} type="button" onClick={() => setDialog(null)}>
              Filter anwenden
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => {
                setSelectedLevels([]);
                setMinimumRating(0);
              }}
            >
              Zuruecksetzen
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

export function SiteHeader({ user }: { user: CurrentUser | null }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <Link className={styles.logoLink} href="/" aria-label="ChallengeHub Startseite">
        <Image src="/logo.png" width={214} height={70} alt="ChallengeHub" priority />
      </Link>
      <button
        className={styles.menuButton}
        type="button"
        aria-label="Navigation oeffnen"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`} aria-label="Hauptnavigation">
        <Link href="/challenges">Challenges</Link>
        <Link href="/challenges?sort=rating">Ranking</Link>
        {user ? <ProfileMenu user={user} /> : <Link className={styles.primaryButton} href="/auth">Login</Link>}
      </nav>
    </header>
  );
}

function ProfileMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const initials = getUserInitials(user.name || user.email);

  return (
    <div className={styles.profileMenu}>
      <button
        className={styles.profileButton}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">{initials}</span>
        <span className={styles.visuallyHidden}>Profilmenue oeffnen</span>
      </button>
      {open && (
        <div className={styles.profileDropdown} role="menu">
          <div className={styles.profileSummary}>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <Link href="/auth" role="menuitem">
            Konto
          </Link>
          <Link href="/meine-challenges" role="menuitem">
            Meine Challenges
          </Link>
          <Link href="/challenge-mate" role="menuitem">
            Challenge Mate finden
          </Link>
          <form action={logoutAction}>
            <button type="submit" role="menuitem">
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Link href="/meine-challenges">Meine Challenges</Link>
      <Link href="/wissen">Wissen</Link>
      <Link href="/sicherheit">Sicherheit</Link>
      <Link href="/datenschutz">Datenschutz</Link>
      <Link href="/impressum">Impressum</Link>
      <Link href="/karriere">Karriere</Link>
      <a href="https://www.amazon.de/s?rh=n%3A77028031%2Cp_4%3ACHub+by+ChallengeHub&ref=bl_sl_s_ap_web_77028031">
        Merch
      </a>
    </footer>
  );
}

function getUserInitials(value: string) {
  const parts = value
    .split(/[\s@._-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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
  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className={styles.closeButton} type="button" aria-label="Dialog schliessen" onClick={onClose}>
          x
        </button>
        <Image src="/logo.png" width={150} height={49} alt="ChallengeHub" />
        <h2 id="modal-title">{title}</h2>
        {children}
      </section>
    </div>
  );
}
