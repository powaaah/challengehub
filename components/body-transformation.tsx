"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  bodyScore,
  habitValue,
  navyBodyFat,
  type BodyState,
} from "@/domain/challenges/navy";
import styles from "./body-transformation.module.css";

type Props = {
  id: string;
  state: BodyState;
  window: { start: string; end: string; today: string };
  active: boolean;
  photos: { slot: string; updated_at: string }[];
  children?: ReactNode;
};
const fmt = (n: number | null | undefined) =>
  n == null
    ? "—"
    : n.toLocaleString("de-DE", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      });
function Chart({
  points,
  label,
}: {
  points: { date: string; value: number }[];
  label: string;
}) {
  if (points.length < 2)
    return <p>Ab zwei Messungen erscheint dein Verlauf.</p>;
  const low = Math.min(...points.map((p) => p.value)),
    high = Math.max(...points.map((p) => p.value));
  const first = Date.parse(points[0].date),
    span = Date.parse(points.at(-1)!.date) - first;
  const coords = points
    .map(
      (p) =>
        `${10 + ((Date.parse(p.date) - first) / span) * 580},${140 - ((p.value - low) / (high - low || 1)) * 120}`,
    )
    .join(" ");
  return (
    <svg
      className={styles.chart}
      viewBox="0 0 600 160"
      role="img"
      aria-label={`${label}: ${fmt(points[0].value)} bis ${fmt(points.at(-1)!.value)}. Einzelwerte in der Tabelle.`}
    >
      <line x1="10" y1="145" x2="590" y2="145" stroke="#555" />
      <polyline points={coords} fill="none" stroke="#ff982f" strokeWidth="3" />
    </svg>
  );
}
export function BodyTransformation({
  id,
  state,
  window,
  active,
  photos,
  children,
}: Props) {
  const router = useRouter();
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const [variant, setVariant] = useState(state.profile?.variant ?? "male");
  const date = window.today > window.end ? window.end : window.today;
  const score = bodyScore(state, window.start, window.end, window.today);
  const measurements = state.measurements;
  const latest = measurements.at(-1);
  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/body-transformation/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setMessage("Gespeichert.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Speichern fehlgeschlagen.",
      );
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(Object.fromEntries(new FormData(event.currentTarget)));
  }
  async function photo(event: FormEvent<HTMLFormElement>, slot: string) {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("photo");
    if (!(file instanceof File) || !file.size) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Maximal 5 MB pro Bild.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/body-transformation/${id}/photo/${slot}`, {
        method: "POST",
        body: file,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setMessage("Bild gespeichert.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Upload fehlgeschlagen.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function removePhoto(slot: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/body-transformation/${id}/photo/${slot}`, {
        method: "POST",
        headers: { "x-remove-photo": "yes" },
      });
      if (!res.ok) throw new Error();
      setMessage("Bild gelöscht.");
      router.refresh();
    } catch {
      setMessage("Löschen fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }
  const dateField = (
    <label>
      Datum
      <input
        name="date"
        type="date"
        min={window.start}
        max={date}
        defaultValue={date}
        required
      />
    </label>
  );
  return (
    <main id="main-content" tabIndex={-1} className={styles.room}>
      <Link href="/meine-challenges">← Meine Challenges</Link>
      <p className={styles.kicker}>Deine 100 Tage · Body Transformation</p>
      <h1>
        Fett reduzieren.
        <br />
        Deine Veränderung sehen.
      </h1>
      <p>
        {window.today > window.end
          ? "Deine 100 Tage sind beendet."
          : "Deine 100 Tage laufen bis " + window.end + "."}{" "}
        Zeitraum: {window.start} bis {window.end}.{" "}
        {active
          ? "Du kannst Einträge in diesem Zeitraum ergänzen oder korrigieren."
          : "Diese Teilnahme ist beendet und bleibt lesbar."}
      </p>
      <Link href="/challenge-mate">ChallengeMate finden</Link> ·{" "}
      <Link href="/challenges/100-tage-body-transformation#challenge-ranking">
        Zum Ranking
      </Link>{" "}
      · <Link href="/profil">Sichtbarkeit im Profil</Link>
      {message && (
        <p role="status" className={styles.notice}>
          {message}
        </p>
      )}
      <div className={styles.grid}>
        <section className={styles.panel}>
          <p className={styles.kicker}>
            {score?.final ? "Dein 100-Tage-Ergebnis" : "Dein Zwischenstand"}
          </p>
          <div className={styles.score}>
            {score ? fmt(score.points) : "—"} <small>PP</small>
          </div>
          <p>Abnahme des geschätzten Navy-KFA · Prozentpunkte</p>
          <p>
            Start: {fmt(score?.start)} % → aktuell: {fmt(score?.current)} %
          </p>
          {!score && (
            <p>
              Für die Wertung brauchst du eine vollständige Navy-Messung vom{" "}
              {window.start} (Tag 1) und eine spätere Messung. Für das
              Endergebnis zählt Tag 100 ({window.end}).
            </p>
          )}
          <p>
            Schätzwert aus selbst gemeldeten Umfängen, kein Nachweis für
            Muskelerhalt. Nur dein freigegebener Rankingwert wird öffentlich.
            Fotos und einzelne Messwerte bleiben privat.
          </p>
        </section>
        <section className={styles.panel}>
          <h2>Messwerte eintragen</h2>
          <form onSubmit={submit}>
            <input type="hidden" name="action" value="measurement" />
            <div className={styles.fields}>
              {dateField}
              <label>
                Formelvariante
                <select
                  name="variant"
                  value={variant}
                  onChange={(e) =>
                    setVariant(e.target.value as "male" | "female")
                  }
                  disabled={!!state.profile}
                >
                  <option value="male">Männlich</option>
                  <option value="female">Weiblich</option>
                </select>
                {state.profile && (
                  <input
                    type="hidden"
                    name="variant"
                    value={state.profile.variant}
                  />
                )}
              </label>
              <label>
                Körpergröße (cm)
                <input
                  name="height"
                  type="number"
                  min="100"
                  max="250"
                  step="0.1"
                  defaultValue={state.profile?.height}
                  readOnly={!!state.profile}
                  required
                />
              </label>
              <label>
                Gewicht (kg)
                <input
                  name="weight"
                  type="number"
                  min="25"
                  max="400"
                  step="0.1"
                  required
                />
              </label>
              <label>
                {variant === "male" ? "Bauchumfang (cm)" : "Taillenumfang (cm)"}
                <input
                  name="waist"
                  type="number"
                  min="35"
                  max="250"
                  step="0.1"
                  required
                />
              </label>
              <label>
                Halsumfang (cm)
                <input name="neck" type="number" min="15" max="80" step="0.1" />
              </label>
              {variant === "female" && (
                <label>
                  Hüftumfang (cm)
                  <input
                    name="hip"
                    type="number"
                    min="40"
                    max="250"
                    step="0.1"
                  />
                </label>
              )}
            </div>
            <p>
              Formelvariante und Körpergröße bleiben nach dem ersten Speichern
              fest. Ohne Halsumfang
              {variant === "female" ? " und Hüftumfang" : ""} speichern wir den
              Verlauf ohne KFA. Ein Eintrag ersetzt den bisherigen Wert
              desselben Tages.
            </p>
            <details>
              <summary>So misst du für die Navy-Formel</summary>
              <p>
                Aufrecht stehen, entspannt ausatmen, Bauch nicht einziehen. Das
                Maßband liegt an, ohne die Haut einzudrücken. Hals direkt
                unterhalb des Kehlkopfs messen. Männliche Variante: Bauch
                waagerecht auf Nabelhöhe. Weibliche Variante: Taille an der
                schmalsten Stelle und Hüfte an der breitesten Stelle des
                Gesäßes. Nutze jedes Mal dieselben Messstellen und möglichst
                dieselben Bedingungen.
              </p>
            </details>
            <button disabled={busy || !active}>Messwerte speichern</button>
          </form>
        </section>
        <section className={styles.panel}>
          <h2>Gewicht · {fmt(latest?.weight)} kg</h2>
          <Chart
            label="Gewichtsverlauf in kg"
            points={measurements.map((m) => ({
              date: m.date,
              value: m.weight,
            }))}
          />
        </section>
        <section className={styles.panel}>
          <h2>
            {variant === "male" ? "Bauch" : "Taille"} · {fmt(latest?.waist)} cm
          </h2>
          <Chart
            label="Umfangsverlauf in cm"
            points={measurements.map((m) => ({ date: m.date, value: m.waist }))}
          />
        </section>
        <section className={`${styles.panel} ${styles.wide}`}>
          <h2>Dein Messverlauf</h2>
          <p>
            Fehlende Tage bleiben Lücken. Verbundene Punkte zeigen nur die
            Entwicklung zwischen vorhandenen Messungen.
          </p>
          <div
            className={styles.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Messverlauf"
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Gewicht</th>
                  <th>Bauch / Taille</th>
                  <th>Hals</th>
                  <th>Hüfte</th>
                  <th>Navy-KFA</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.date}>
                    <td>{m.date}</td>
                    <td>{fmt(m.weight)} kg</td>
                    <td>{fmt(m.waist)} cm</td>
                    <td>{fmt(m.neck)}</td>
                    <td>{fmt(m.hip)}</td>
                    <td>
                      {fmt(
                        state.profile ? navyBodyFat(state.profile, m) : null,
                      )}{" "}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!measurements.length && <p>Noch keine Messwerte gespeichert.</p>}
          </div>
        </section>
        <section className={`${styles.panel} ${styles.wide}`}>
          <h2>Startbild & Endbild</h2>
          <p>
            Dein privater Vorher-Nachher-Vergleich. JPG, PNG oder WebP,
            höchstens 5 MB. Die Bilder werden nicht im Ranking veröffentlicht.
          </p>
          <div className={styles.photos}>
            {["start", "end"].map((slot) => {
              const saved = photos.find((p) => p.slot === slot);
              return (
                <div key={slot}>
                  <h3>{slot === "start" ? "Startbild" : "Endbild"}</h3>
                  <div className={styles.photo}>
                    {saved ? (
                      <Image
                        unoptimized
                        width={1200}
                        height={900}
                        src={`/api/body-transformation/${id}/photo/${slot}?v=${encodeURIComponent(saved.updated_at)}`}
                        alt={
                          slot === "start" ? "Dein Startbild" : "Dein Endbild"
                        }
                      />
                    ) : (
                      <span>Noch kein Bild</span>
                    )}
                  </div>
                  <form onSubmit={(e) => void photo(e, slot)}>
                    <label>
                      {slot === "start"
                        ? "Startbild auswählen"
                        : "Endbild auswählen"}
                      <input
                        name="photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        required
                      />
                    </label>
                    <button disabled={busy || !active}>Bild speichern</button>
                    {saved && (
                      <button
                        className={styles.secondary}
                        type="button"
                        onClick={() => void removePhoto(slot)}
                        disabled={busy}
                      >
                        Bild löschen
                      </button>
                    )}
                  </form>
                </div>
              );
            })}
          </div>
        </section>
        <section className={`${styles.panel} ${styles.wide}`}>
          <h2>Deine Teil-Challenges</h2>
          <p>
            Zum Beispiel 7 Stunden Schlaf täglich, Schritte, Radfahren,
            Gym-Besuche pro Woche oder dein persönliches Kalorienziel. Ziele
            sind frei wählbar und verändern den KFA-Ranglistenwert nicht. Ein
            fehlender Eintrag entwertet keine andere Teil-Challenge.
          </p>
          {state.habits.map((h) => (
            <article key={h.id} className={styles.habit}>
              <h3>{h.name}</h3>
              <p>
                {fmt(habitValue(h, date))} / {fmt(h.target)} {h.unit}{" "}
                {h.period === "day"
                  ? "am ausgewählten letzten Challenge-Tag"
                  : "in der letzten Challenge-Woche (Montag bis Sonntag)"}
              </p>
              <form onSubmit={submit}>
                <input type="hidden" name="action" value="habit-entry" />
                <input type="hidden" name="habitId" value={h.id} />
                <div className={styles.fields}>
                  {dateField}
                  <label>
                    Tageswert ({h.unit})
                    <input
                      name="value"
                      type="number"
                      min="0"
                      max="100000"
                      step="0.1"
                      required
                    />
                  </label>
                </div>
                <button disabled={busy || !active}>
                  Teil-Challenge speichern
                </button>
                <button
                  className={styles.secondary}
                  type="button"
                  disabled={busy || !active}
                  onClick={() => {
                    if (confirm("Teil-Challenge und ihren Verlauf löschen?"))
                      void send({ action: "delete-habit", habitId: h.id });
                  }}
                >
                  Entfernen
                </button>
              </form>
              <details>
                <summary>
                  Verlauf ({Object.keys(h.entries).length} Einträge)
                </summary>
                <ul>
                  {Object.entries(h.entries)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([d, v]) => (
                      <li key={d}>
                        {d}: {fmt(v)} {h.unit}
                      </li>
                    ))}
                </ul>
              </details>
            </article>
          ))}
          <details>
            <summary>Teil-Challenge hinzufügen</summary>
            <form onSubmit={submit}>
              <input type="hidden" name="action" value="habit" />
              <div className={styles.fields}>
                <label>
                  Name
                  <input
                    name="name"
                    maxLength={80}
                    required
                    placeholder="Zum Beispiel Schlaf"
                  />
                </label>
                <label>
                  Einheit
                  <input
                    name="unit"
                    maxLength={20}
                    required
                    placeholder="Stunden, Schritte, km, kcal …"
                  />
                </label>
                <label>
                  Zielwert
                  <input
                    name="target"
                    type="number"
                    min="0.1"
                    max="100000"
                    step="0.1"
                    required
                  />
                </label>
                <label>
                  Rhythmus
                  <select name="period">
                    <option value="day">Täglich</option>
                    <option value="week">Wöchentlich (Mo–So)</option>
                  </select>
                </label>
              </div>
              <button disabled={busy || !active}>Teil-Challenge anlegen</button>
            </form>
          </details>
        </section>
      </div>
      {children}
    </main>
  );
}
