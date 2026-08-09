"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { levelLabels, type ChallengeLevel } from "@/data/challenges";
import type { ChallengeType, MeasurementDirection, MetricUnit } from "@/domain/challenges/challenge-definition";
import { INPUT_LIMITS } from "@/domain/security/input-limits";
import type { CurrentUser } from "@/lib/auth";
import type { CreateChallengeState } from "@/app/challenges/neu/actions";
import { LoginModal } from "./login-modal";
import { SiteFooter, SiteHeader } from "./site-shell";
import styles from "./challenge-create-app.module.css";

const levelOptions: ChallengeLevel[] = ["User"];

const categoryOptions = ["Fitness", "Ernährung", "Fokus", "Schlaf", "Produktivität", "Mindset", "Digital Detox"];
const challengeTypeOptions: Array<{ value: ChallengeType; label: string }> = [
  { value: "daily_boolean", label: "Täglich erledigt / nicht erledigt" },
  { value: "cumulative_metric", label: "Messwert über die Laufzeit sammeln" },
  { value: "one_time_result", label: "Ein einmaliges Ergebnis erreichen" }
];
const metricUnitOptions: Array<{ value: Exclude<MetricUnit, "completion">; label: string }> = [
  { value: "repetitions", label: "Wiederholungen" },
  { value: "steps", label: "Schritte" },
  { value: "kilograms", label: "Kilogramm" },
  { value: "kilocalories", label: "Kilokalorien" },
  { value: "seconds", label: "Sekunden" },
  { value: "minutes", label: "Minuten" },
  { value: "kilometers", label: "Kilometer" }
];

const initialState = {
  error: "",
  duplicates: [],
  submitted: false
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
  const [challengeType, setChallengeType] = useState<ChallengeType>("daily_boolean");
  const [metricUnit, setMetricUnit] = useState<Exclude<MetricUnit, "completion">>("repetitions");
  const [targetValue, setTargetValue] = useState(100);
  const [direction, setDirection] = useState<MeasurementDirection>("at_least");
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
      <main id="main-content" tabIndex={-1} className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Qualität vor Veröffentlichung</p>
        <h1>Challenge erstellen</h1>
        <p>
          Erstelle eine Challenge mit klarer Aufgabe, Dauer und Regeln. Nach dem Einreichen wird sie
          geprüft und erst nach der Freigabe öffentlich sichtbar.
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
          {formState.submitted && (
            <div className={styles.notice} role="status">
              <strong>Zur Moderation eingereicht.</strong>
              <p>Deine Challenge ist gespeichert, aber bis zur Freigabe nicht öffentlich sichtbar.</p>
            </div>
          )}
          <label>
            Titel
            <input
              name="title"
              value={title}
              maxLength={INPUT_LIMITS.challengeTitleChars}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label>
            Aufgabe
            <input
              name="goal"
              value={goal}
              maxLength={INPUT_LIMITS.challengeGoalChars}
              onChange={(event) => setGoal(event.target.value)}
            />
          </label>
          <label>
            Beschreibung
            <textarea
              name="description"
              value={description}
              rows={4}
              maxLength={INPUT_LIMITS.challengeDescriptionChars}
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
              Schwierigkeitsgrad
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
            Fortschrittsart
            <select
              name="challengeType"
              value={challengeType}
              onChange={(event) => setChallengeType(event.target.value as ChallengeType)}
            >
              {challengeTypeOptions.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          {challengeType !== "daily_boolean" ? (
            <div className={styles.split}>
              <label>
                Einheit
                <select
                  name="metricUnit"
                  value={metricUnit}
                  onChange={(event) => setMetricUnit(event.target.value as Exclude<MetricUnit, "completion">)}
                >
                  {metricUnitOptions.map((option) => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Zielwert
                <input
                  type="number"
                  name="targetValue"
                  min="0.01"
                  step="any"
                  value={targetValue}
                  onChange={(event) => setTargetValue(Number(event.target.value))}
                />
              </label>
              {challengeType === "one_time_result" ? (
                <label>
                  Zielrichtung
                  <select
                    name="direction"
                    value={direction}
                    onChange={(event) => setDirection(event.target.value as MeasurementDirection)}
                  >
                    <option value="at_least">Mindestens</option>
                    <option value="at_most">Höchstens</option>
                  </select>
                </label>
              ) : <input type="hidden" name="direction" value="at_least" />}
            </div>
          ) : (
            <>
              <input type="hidden" name="metricUnit" value="completion" />
              <input type="hidden" name="targetValue" value="1" />
              <input type="hidden" name="direction" value="at_least" />
            </>
          )}
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
            {pending ? "Wird eingereicht…" : "Zur Prüfung einreichen"}
          </button>
        </form>

        <aside className={`${styles.preview} ${styles[level]}`} aria-label="Challenge Vorschau">
          <p className={styles.previewKicker}>Vorschau | {levelLabels[level]} | {category}</p>
          <h2>{title || "Deine neue Challenge"}</h2>
          <p>{description || "Beschreibe kurz, warum diese Challenge sinnvoll ist und was man jeden Tag tun soll."}</p>
          <div className={styles.previewMeta}>
            <span>{durationDays || 1} Tage</span>
            <span>{challengeTypeOptions.find((option) => option.value === challengeType)?.label}</span>
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
