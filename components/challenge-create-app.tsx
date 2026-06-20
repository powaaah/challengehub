"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { challenges, levelLabels, type ChallengeLevel } from "@/data/challenges";
import {
  createSlug,
  readUserChallenges,
  type UserChallenge,
  writeUserChallenges
} from "./user-challenges-storage";
import styles from "./challenge-create-app.module.css";

const levelOptions: ChallengeLevel[] = ["User", "Beginner", "Advanced", "Premium"];

const categoryOptions = ["Fitness", "Ernaehrung", "Fokus", "Schlaf", "Produktivitaet", "Mindset", "Digital Detox"];

export function ChallengeCreateApp() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [level, setLevel] = useState<ChallengeLevel>("User");
  const [durationDays, setDurationDays] = useState(30);
  const [goal, setGoal] = useState("");
  const [description, setDescription] = useState("");
  const [rulesText, setRulesText] = useState("");
  const [tipsText, setTipsText] = useState("");
  const [error, setError] = useState("");

  const previewRules = useMemo(() => parseLines(rulesText), [rulesText]);
  const previewTips = useMemo(() => parseLines(tipsText), [tipsText]);

  function saveChallenge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const rules = parseLines(rulesText);

    if (!title.trim() || !goal.trim() || !description.trim() || rules.length === 0) {
      setError("Titel, Ziel, Beschreibung und mindestens eine Regel sind Pflicht.");
      return;
    }

    const userChallenges = readUserChallenges();
    const existingSlugs = [...challenges.map((challenge) => challenge.slug), ...userChallenges.map((challenge) => challenge.slug)];
    const slug = createSlug(title, existingSlugs);
    const nextChallenge: UserChallenge = {
      slug,
      title: title.trim(),
      level,
      category,
      durationDays,
      goal: goal.trim(),
      description: description.trim(),
      rules,
      tips: parseLines(tipsText),
      createdAt: new Date().toISOString()
    };

    writeUserChallenges([nextChallenge, ...userChallenges]);
    router.push(`/challenges/${slug}`);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.logoLink} href="/" aria-label="ChallengeHub Startseite">
          <Image src="/logo.png" width={214} height={70} alt="ChallengeHub" priority />
        </Link>
        <nav className={styles.nav} aria-label="Challenge erstellen Navigation">
          <Link href="/#challenges">Challenges</Link>
          <Link href="/meine-challenges">Meine Challenges</Link>
          <Link href="/wissen">Wissen</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <p className={styles.kicker}>Public by default</p>
        <h1>Challenge erstellen</h1>
        <p>
          Erstelle eine oeffentliche Challenge mit klarer Aufgabe, Dauer und Regeln. Nach dem Speichern
          erscheint sie direkt im Katalog und kann gestartet werden.
        </p>
      </section>

      <section className={styles.workspace}>
        <form className={styles.form} onSubmit={saveChallenge}>
          {error && <p className={styles.error}>{error}</p>}
          <label>
            Titel
            <input value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Ziel
            <input value={goal} maxLength={140} onChange={(event) => setGoal(event.target.value)} />
          </label>
          <label>
            Beschreibung
            <textarea value={description} rows={4} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <div className={styles.split}>
            <label>
              Kategorie
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categoryOptions.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Schwierigkeit
              <select value={level} onChange={(event) => setLevel(event.target.value as ChallengeLevel)}>
                {levelOptions.map((option) => (
                  <option value={option} key={option}>
                    {levelLabels[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Dauer in Tagen
            <input
              type="number"
              min="1"
              max="365"
              value={durationDays}
              onChange={(event) => setDurationDays(Number(event.target.value))}
            />
          </label>
          <label>
            Regeln, eine pro Zeile
            <textarea value={rulesText} rows={5} onChange={(event) => setRulesText(event.target.value)} />
          </label>
          <label>
            Tipps, optional eine pro Zeile
            <textarea value={tipsText} rows={4} onChange={(event) => setTipsText(event.target.value)} />
          </label>
          <button className={styles.primaryButton} type="submit">
            Oeffentlich speichern
          </button>
        </form>

        <aside className={`${styles.preview} ${styles[level]}`} aria-label="Challenge Vorschau">
          <p className={styles.previewKicker}>{levelLabels[level]} | {category}</p>
          <h2>{title || "Deine neue Challenge"}</h2>
          <p>{description || "Beschreibe kurz, warum diese Challenge sinnvoll ist und was man jeden Tag tun soll."}</p>
          <div className={styles.previewMeta}>
            <span>{durationDays || 1} Tage</span>
            <span>0 Teilnehmer</span>
          </div>
          <h3>Regeln</h3>
          <ol>
            {(previewRules.length > 0 ? previewRules : ["Eine klare Tagesregel definieren."]).map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
          {previewTips.length > 0 && (
            <>
              <h3>Tipps</h3>
              <ul>
                {previewTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
