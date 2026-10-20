"use client";

import { useRef, useState, type CSSProperties } from "react";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import { emptyCatalogFilters, ratingFromSlider, type CatalogFilters, type ChallengeFormat } from "@/domain/challenges/catalog-filters";
import styles from "./catalog-filter.module.css";

const formats: Array<[ChallengeFormat, string]> = [["once", "Einmalig"], ["period", "Zeitraum"], ["ongoing", "Dauer-Challenge"]];
const participantOptions = [0, 1, 5, 10, 25, 50, 100, 250, 500, 1000];

export function CatalogFilter({ value, countResults, onApply, onClose }: {
  value: CatalogFilters;
  countResults: (filters: CatalogFilters) => number;
  onApply: (filters: CatalogFilters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const focus = useDialogFocus({ containerRef: dialogRef, initialFocusRef: closeRef, onClose });
  const invalidBounds = draft.minimumParticipants !== null && draft.maximumParticipants !== null
    && draft.minimumParticipants > draft.maximumParticipants;
  const count = invalidBounds ? 0 : countResults(draft);
  const sliderValue = draft.minimumRating === 0 ? 0 : draft.minimumRating * 2 - 1;
  const ratingLabel = draft.minimumRating === 0 ? "Alle Bewertungen" : `Mindestens ${draft.minimumRating.toLocaleString("de-DE", { minimumFractionDigits: 1 })} Sterne`;

  return (
    <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="catalog-filter-title" onKeyDown={focus.onKeyDown}>
        <header className={styles.header}>
          <h2 id="catalog-filter-title">Challenges filtern</h2>
          <button ref={closeRef} type="button" className={styles.close} aria-label="Dialog schließen" onClick={onClose}>×</button>
        </header>
        <div className={styles.body}>
          <fieldset className={styles.group}>
            <legend>Format</legend><span className={styles.hint}>Mehrfachauswahl</span>
            <div className={styles.chips}>
              {formats.map(([key, label]) => <button key={key} type="button" className={styles.chip} aria-pressed={draft.formats.includes(key)} onClick={() => setDraft({ ...draft, formats: toggle(draft.formats, key) })}>
                {draft.formats.includes(key) && <span aria-hidden="true">✓ </span>}{label}
              </button>)}
            </div>
          </fieldset>
          <fieldset className={styles.group}>
            <legend>Schwierigkeit</legend><span className={styles.hint}>Mehrfachauswahl</span>
            <div className={styles.chips}>
              {(["Beginner", "Advanced"] as const).map(level => <button key={level} type="button" className={styles.chip} aria-pressed={draft.levels.includes(level)} onClick={() => setDraft({ ...draft, levels: toggle(draft.levels, level) })}>
                {draft.levels.includes(level) && <span aria-hidden="true">✓ </span>}{level}
              </button>)}
            </div>
          </fieldset>
          <div className={styles.group}>
            <label className={styles.groupTitle} htmlFor="minimum-rating">Mindestbewertung</label>
            <output className={styles.ratingValue} htmlFor="minimum-rating">{draft.minimumRating === 0 ? "Alle Bewertungen" : <>Mindestens {draft.minimumRating.toLocaleString("de-DE", { minimumFractionDigits: 1 })} <span aria-hidden="true">★</span></>}</output>
            <input id="minimum-rating" className={styles.slider} type="range" min={0} max={9} step={1} value={sliderValue}
              style={{ "--rating-progress": `${sliderValue / 9 * 100}%` } as CSSProperties}
              aria-valuetext={ratingLabel} aria-describedby="rating-help"
              onChange={event => setDraft({ ...draft, minimumRating: ratingFromSlider(Number(event.target.value)) })} />
            <div className={styles.ticks} aria-hidden="true">{[[0,"Alle"],[1,"1"],[3,"2"],[5,"3"],[7,"4"],[9,"5 ★"]].map(([position,label]) => <span key={position} style={{ left: `${Number(position) / 9 * 100}%` }}>{label}</span>)}</div>
            <p className={styles.help} id="rating-help">Alle schließt unbewertete Challenges ein.</p>
          </div>
          <fieldset className={styles.group}>
            <legend>Teilnehmerzahl</legend>
            <div className={styles.bounds}>
              {([['minimumParticipants', 'Mindestens'], ['maximumParticipants', 'Höchstens']] as const).map(([key,label]) => <div key={key}>
                <label htmlFor={key}>{label}</label>
                <select id={key} value={draft[key] ?? ""} aria-invalid={invalidBounds || undefined} aria-describedby={invalidBounds ? "participant-error" : undefined} onChange={event => setDraft({ ...draft, [key]: event.target.value === "" ? null : Number(event.target.value) })}>
                  <option value="">Egal</option>{participantOptions.map(number => <option key={number} value={number}>{number.toLocaleString("de-DE")}</option>)}
                </select>
              </div>)}
            </div>
            {invalidBounds && <p id="participant-error" className={styles.error} role="alert">Das Maximum darf nicht kleiner als das Minimum sein.</p>}
          </fieldset>
        </div>
        <footer className={styles.footer}>
          <p className={styles.result} aria-live="polite">{invalidBounds ? "Bitte Teilnehmergrenzen korrigieren." : count === 0 ? "Keine passenden Challenges. Passe deine Filter an." : `${count} ${count === 1 ? "Challenge passt" : "Challenges passen"} zu deiner Auswahl.`}</p>
          <button type="button" className={styles.reset} onClick={() => setDraft(emptyCatalogFilters)}>Zurücksetzen</button>
          <button type="button" className={styles.apply} disabled={invalidBounds} onClick={() => onApply(draft)}>Challenges anzeigen</button>
        </footer>
      </section>
    </div>
  );
}

function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
}
