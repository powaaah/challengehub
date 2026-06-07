"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { challenges, levelLabels, type ChallengeLevel } from "@/data/challenges";
import styles from "./challenge-hub-app.module.css";

type Dialog = "login" | "register" | "forgot" | "filter" | null;
type SortKey = "standard" | "newest" | "participants" | "rating";

const levelOptions: ChallengeLevel[] = ["User", "Beginner", "Advanced", "Premium"];

export function ChallengeHubApp() {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("standard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<ChallengeLevel[]>([]);
  const [minimumRating, setMinimumRating] = useState(0);

  const visibleChallenges = useMemo(() => {
    const normalizedSearch = normalizeSearchText(searchQuery);
    const filtered = challenges.filter((challenge) => {
      const levelMatches = selectedLevels.length === 0 || selectedLevels.includes(challenge.level);
      const ratingMatches = challenge.rating >= minimumRating;
      const searchMatches =
        normalizedSearch.length === 0 ||
        normalizeSearchText(`${challenge.title} ${levelLabels[challenge.level]}`).includes(normalizedSearch);

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
  }, [minimumRating, searchQuery, selectedLevels, sortKey]);

  function toggleLevel(level: ChallengeLevel) {
    setSelectedLevels((current) =>
      current.includes(level) ? current.filter((item) => item !== level) : [...current, level]
    );
  }

  function handleHeroSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("challenges")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
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
          <a href="#challenges">Challenges</a>
          <Link href="/meine-challenges">Meine Challenges</Link>
          <Link href="/wissen">Wissen</Link>
          <a href="#ranking">Ranking</a>
          <button className={styles.primaryButton} type="button" onClick={() => setDialog("login")}>
            Login
          </button>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Reach. Your. Goals.</p>
            <h1>Unleash Your Potential and Reach Your Goals</h1>
            <p>
              Wir wollen, dass jeder Mensch happy ist. Als Gemeinschaft halten wir zusammen,
              motivieren uns gegenseitig und bewältigen dadurch auch große Herausforderungen.
            </p>
            <form className={styles.heroSearch} role="search" onSubmit={handleHeroSearchSubmit}>
              <label className={styles.visuallyHidden} htmlFor="hero-challenge-search">
                Challenge suchen
              </label>
              <input
                id="hero-challenge-search"
                type="search"
                value={searchQuery}
                placeholder="Welche Challenge suchst du?"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <button className={styles.primaryButton} type="submit">
                Find your challenge
              </button>
            </form>
            <div className={styles.heroActions}>
              <button className={styles.primaryButton} type="button" onClick={() => setDialog("register")}>
                Registriere dich jetzt
              </button>
              <a className={styles.secondaryButton} href="#challenges">
                Challenges
              </a>
            </div>
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

        <section className={styles.challengeIntro} id="ranking">
          <blockquote>
            &quot;Die beste Moeglichkeit, die Zukunft vorauszusagen, ist, sie zu erschaffen.&quot;
            <cite>Peter Drucker</cite>
          </blockquote>
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
            <button className={styles.addButton} type="button" onClick={() => setDialog("login")}>
              Add new Challenge
            </button>
          </div>

          <div className={styles.grid}>
            {visibleChallenges.map((challenge) => (
              <Link className={styles.tileLink} href={`/challenges/${challenge.slug}`} key={challenge.slug}>
                <article className={`${styles.tile} ${styles[challenge.level]}`}>
                  <h2>{challenge.title}</h2>
                  <p>{levelLabels[challenge.level]}</p>
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
          {visibleChallenges.length === 0 && (
            <p className={styles.emptyState}>Keine Challenge passt zu deiner Suche oder den aktiven Filtern.</p>
          )}
        </section>
      </main>

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

      {dialog === "login" && (
        <Modal title="Login" onClose={() => setDialog(null)}>
          <form className={styles.form}>
            <label>
              Benutzername oder E-Mail:
              <input type="email" required />
            </label>
            <label>
              Passwort:
              <input type="password" required />
            </label>
            <div className={styles.formRow}>
              <button className={styles.primaryButton} type="button">
                Login
              </button>
              <button className={styles.linkButton} type="button" onClick={() => setDialog("forgot")}>
                Passwort vergessen?
              </button>
            </div>
          </form>
          <p>
            Du hast noch keinen Account?{" "}
            <button className={styles.inlineButton} type="button" onClick={() => setDialog("register")}>
              Registrieren
            </button>
          </p>
        </Modal>
      )}

      {dialog === "register" && (
        <Modal title="Registrieren" onClose={() => setDialog(null)}>
          <form className={styles.form}>
            <label>
              E-Mail:
              <input type="email" required />
            </label>
            <label>
              Passwort:
              <input type="password" required />
            </label>
            <button className={styles.primaryButton} type="button">
              Registrieren
            </button>
          </form>
        </Modal>
      )}

      {dialog === "forgot" && (
        <Modal title="Passwort vergessen" onClose={() => setDialog(null)}>
          <p>
            Gib bitte deine E-Mail-Adresse ein, mit der du dich auf ChallengeHub registriert hast.
            Dann senden wir dir einen Link zur Erneuerung deines Passworts.
          </p>
          <form className={styles.form}>
            <label>
              E-Mail:
              <input type="email" required />
            </label>
            <button className={styles.primaryButton} type="button">
              Passwort wiederherstellen starten
            </button>
          </form>
        </Modal>
      )}

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
