"use client";

import { useMemo, useState } from "react";
import styles from "@/app/challenges/[slug]/page.module.css";

const rankingRows = [
  { rank: 1, name: "Mara", streak: 184, completedDays: 219 },
  { rank: 2, name: "Jonas", streak: 172, completedDays: 201 },
  { rank: 3, name: "Nina", streak: 149, completedDays: 190 },
  { rank: 4, name: "Tarek", streak: 131, completedDays: 177 },
  { rank: 5, name: "Lea", streak: 118, completedDays: 141 },
  { rank: 6, name: "Chris", streak: 101, completedDays: 132 },
  { rank: 7, name: "Sven", streak: 96, completedDays: 120 },
  { rank: 8, name: "Aylin", streak: 88, completedDays: 116 },
  { rank: 9, name: "Mika", streak: 81, completedDays: 109 },
  { rank: 10, name: "Karo", streak: 74, completedDays: 98 },
  { rank: 11, name: "Ben", streak: 69, completedDays: 90 },
  { rank: 12, name: "Jule", streak: 61, completedDays: 85 },
  { rank: 13, name: "Olli", streak: 55, completedDays: 76 },
  { rank: 14, name: "Sam", streak: 48, completedDays: 68 },
  { rank: 15, name: "Rina", streak: 43, completedDays: 57 },
  { rank: 16, name: "Noah", streak: 39, completedDays: 51 },
  { rank: 17, name: "Elli", streak: 34, completedDays: 49 },
  { rank: 18, name: "Malik", streak: 30, completedDays: 44 },
  { rank: 19, name: "Lena", streak: 26, completedDays: 39 },
  { rank: 20, name: "Tom", streak: 24, completedDays: 36 }
];

const ownRankingRows = [
  { rank: 42, name: "Paula", streak: 13, completedDays: 19 },
  { rank: 43, name: "Du", streak: 12, completedDays: 18, isOwn: true },
  { rank: 44, name: "Marco", streak: 11, completedDays: 17 }
];

export function StepsRankingSection() {
  return (
    <section className={styles.rankingSection} aria-labelledby="steps-ranking">
      <div className={styles.textPanel}>
        <p className={styles.eyebrow}>Ranking</p>
        <h2 id="steps-ranking">Wer hält den Streak?</h2>
        <p>
          Bei dieser Challenge zählt nicht Talent, sondern Dranbleiben. Die Top 20
          führen das Feld an; darunter siehst du deine Position mit der Person vor
          und hinter dir.
        </p>

        <div className={styles.rankingTable} role="table" aria-label="Top 20 Streak Ranking">
          <div role="row" className={styles.rankingHeader}>
            <span>Platz</span>
            <span>Name</span>
            <span>Streak</span>
            <span>Tage</span>
          </div>
          {rankingRows.map((row) => (
            <div role="row" className={styles.rankingRow} key={row.rank}>
              <span>#{row.rank}</span>
              <strong>{row.name}</strong>
              <span>{row.streak} Tage</span>
              <span>{row.completedDays}</span>
            </div>
          ))}
        </div>

        <div className={styles.ownRankBlock}>
          <span aria-hidden="true">...</span>
          {ownRankingRows.map((row) => (
            <div className={`${styles.rankingRow} ${row.isOwn ? styles.ownRank : ""}`} key={row.rank}>
              <span>#{row.rank}</span>
              <strong>{row.name}</strong>
              <span>{row.streak} Tage</span>
              <span>{row.completedDays}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StepsChallengeTools() {
  const [currentSteps, setCurrentSteps] = useState(8000);
  const [stepLength, setStepLength] = useState(70);
  const [weight, setWeight] = useState(80);

  const remainingSteps = Math.max(10000 - currentSteps, 0);
  const remainingKm = (remainingSteps * stepLength) / 100000;
  const dailyKm = (10000 * stepLength) / 100000;
  const estimatedMinutes = remainingKm > 0 ? Math.max(Math.round((remainingKm / 4.8) * 60), 1) : 0;
  const dailyCalories = Math.round(weight * dailyKm * 0.53);
  const yearlyCalories = dailyCalories * 365;
  const yearlyFatKg = yearlyCalories / 7700;

  const completionText = useMemo(() => {
    if (remainingSteps === 0) {
      return "Fertig. Heute ist abgehakt.";
    }

    return `Noch ${formatNumber(remainingSteps)} Schritte. Das ist keine Raketenwissenschaft: Schuhe an, Runde drehen, vollmachen.`;
  }, [remainingSteps]);

  return (
    <section className={styles.stepsToolsGrid} aria-label="Schritte Rechner">
      <div className={styles.textPanel}>
        <p className={styles.eyebrow}>Heute noch offen?</p>
        <h2>Mach die 10.000 voll</h2>
        <p>{completionText}</p>

        <div className={styles.calculatorGrid}>
          <label>
            Schritte aktuell
            <input
              type="number"
              min="0"
              max="50000"
              step="100"
              value={currentSteps}
              onChange={(event) => setCurrentSteps(Number(event.target.value))}
            />
          </label>
          <label>
            Schrittlänge in cm
            <input
              type="number"
              min="40"
              max="110"
              value={stepLength}
              onChange={(event) => setStepLength(Number(event.target.value))}
            />
          </label>
        </div>

        <div className={styles.resultGrid}>
          <article>
            <span>Noch offen</span>
            <strong>{formatNumber(remainingSteps)}</strong>
            <small>Schritte</small>
          </article>
          <article>
            <span>Entfernung</span>
            <strong>{remainingKm.toFixed(1)} km</strong>
            <small>ungefähr</small>
          </article>
          <article>
            <span>Zeit</span>
            <strong>{estimatedMinutes} Min.</strong>
            <small>bei lockerem Tempo</small>
          </article>
        </div>
      </div>

      <div className={styles.textPanel}>
        <p className={styles.eyebrow}>Kalorien grob gerechnet</p>
        <h2>Was kommt zusammen?</h2>
        <p>
          Nur als Orientierung, nicht als exakte Fitness-Formel. Verbrauch hängt von
          Tempo, Körper, Strecke und Alltag ab.
        </p>

        <label className={styles.weightInput}>
          Gewicht in kg
          <input
            type="number"
            min="40"
            max="200"
            value={weight}
            onChange={(event) => setWeight(Number(event.target.value))}
          />
        </label>

        <div className={styles.factNumbers}>
          <article>
            <span>10.000 Schritte</span>
            <strong>{dailyKm.toFixed(1)} km</strong>
            <small>bei {stepLength} cm Schrittlänge</small>
          </article>
          <article>
            <span>Pro Tag</span>
            <strong>{dailyCalories} kcal</strong>
            <small>grob geschätzt</small>
          </article>
          <article>
            <span>Pro Jahr</span>
            <strong>{formatNumber(yearlyCalories)} kcal</strong>
            <small>rechnerisch ca. {yearlyFatKg.toFixed(1)} kg Fettenergie</small>
          </article>
        </div>
      </div>
    </section>
  );
}

export function StepsKnowledgeSection() {
  return (
    <section className={styles.evidenceSection} aria-labelledby="steps-knowledge">
      <div className={styles.textPanel}>
        <p className={styles.eyebrow}>Wissenswertes</p>
        <h2 id="steps-knowledge">Wissenswertes zu 10.000 Schritten</h2>
        <div className={styles.knowledgeGrid}>
          <article>
            <h3>10.000 Schritte sind meistens 6 bis 8 km</h3>
            <p>
              Je nach Schrittlänge. Kleine Schritte ergeben eher 6 km, lange Schritte
              eher 8 km. Darum ist ein Rechner sinnvoller als eine fixe Zahl.
            </p>
          </article>
          <article>
            <h3>200 bis 400 kcal sind realistisch</h3>
            <p>
              Je nach Gewicht, Tempo und Strecke. Es geht hier nicht um Präzision,
              sondern um ein Gefühl dafür, was sich über viele Tage summiert.
            </p>
          </article>
          <article>
            <h3>Die Zahl ist simpel, und genau das ist gut</h3>
            <p>
              Keine Trainingslehre, kein Plan, keine Ausrede. Du schaust auf deinen
              Stand und machst die 10.000 voll.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("de-DE").format(Math.round(value));
}
