"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { levelLabels, type ChallengeLevel } from "@/data/challenges";
import type { CurrentUser } from "@/lib/auth";
import type { CreateChallengeState } from "@/app/challenges/neu/actions";
import { LoginModal } from "./login-modal";
import { SiteFooter, SiteHeader } from "./site-shell";
import styles from "./challenge-create-app.module.css";

const levelOptions: ChallengeLevel[] = ["User"];

const categoryOptions = ["Fitness", "Ernährung", "Fokus", "Schlaf", "Produktivität", "Mindset", "Digital Detox"];

const initialState = {
  error: "",
  duplicates: []
};

type ChallengeCreateAppProps = {
  user: CurrentUser | null;
  createChallenge: (state: CreateChallengeState, formData: FormData) => Promise<CreateChallengeState>;
};

export function ChallengeCreateApp({ createChallenge, user }: ChallengeCreateAppProps) {
  const [formState, formAction, pending] = useActionState(createChallenge, initialState);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [level, setLevel] = useState<ChallengeLevel>("User");
  const [durationDays, setDurationDays] = useState(30);
  const [goal, setGoal] = useState("");
  const [description, setDescription] = useState("");
  const [rulesText, setRulesText] = useState("");
  const [tipsText, setTipsText] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const previewRules = useMemo(() => parseLines(rulesText), [rulesText]);
  const previewTips = useMemo(() => parseLines(tipsText), [tipsText]);

  return (
    <>
      <SiteHeader user={user} />
      <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Public by default</p>
        <h1>Challenge erstellen</h1>
        <p>
          Erstelle eine öffentliche Challenge mit klarer Aufgabe, Dauer und Regeln. Eingeloggt wird
          sie serverseitig gespeichert und erscheint direkt im Katalog.
        </p>
      </section>

      <section className={styles.workspace}>
        <form className={styles.form} action={formAction}>
          {!user && (
            <div className={styles.notice}>
              <strong>Account erforderlich.</strong>
              <p>Neue Challenges werden ab jetzt serverseitig gespeichert. Logge dich ein oder erstelle einen Account.</p>
              <button type="button" onClick={() => setIsLoginOpen(true)}>Zum Login</button>
            </div>
          )}
          {formState.error && (
            <div className={styles.error} role="alert">
              <p>{formState.error}</p>
              {formState.duplicates.length > 0 && (
                <ul>
                  {formState.duplicates.map((duplicate) => (
                    <li key={duplicate.slug}>
                      <Link href={`/challenges/${duplicate.slug}`}>{duplicate.title}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <label>
            Titel
            <input name="title" value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Aufgabe
            <input name="goal" value={goal} maxLength={140} onChange={(event) => setGoal(event.target.value)} />
          </label>
          <label>
            Beschreibung
            <textarea
              name="description"
              value={description}
              rows={4}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <div className={styles.split}>
            <label>
              Kategorie
              <select name="category" value={category} onChange={(event) => setCategory(event.target.value)}>
                {categoryOptions.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Challenge-Typ
              <select name="level" value={level} onChange={(event) => setLevel(event.target.value as ChallengeLevel)}>
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
              name="durationDays"
              min="1"
              max="365"
              value={durationDays}
              onChange={(event) => setDurationDays(Number(event.target.value))}
            />
          </label>
          <label>
            Regeln, eine pro Zeile
            <textarea name="rules" value={rulesText} rows={5} onChange={(event) => setRulesText(event.target.value)} />
          </label>
          <label>
            Tipps, optional eine pro Zeile
            <textarea name="tips" value={tipsText} rows={4} onChange={(event) => setTipsText(event.target.value)} />
          </label>
          <button className={styles.primaryButton} type="submit" disabled={!user || pending}>
            {pending ? "Speichert..." : "Öffentlich speichern"}
          </button>
        </form>

        <aside className={`${styles.preview} ${styles[level]}`} aria-label="Challenge Vorschau">
          <p className={styles.previewKicker}>Öffentlich | {levelLabels[level]} | {category}</p>
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
      <SiteFooter />
      {isLoginOpen && (
        <LoginModal next="/challenges/neu" onClose={() => setIsLoginOpen(false)} />
      )}
    </>
  );
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
