"use client";

import { useMemo, useState } from "react";
import styles from "@/app/challenges/[slug]/page.module.css";

export function StepsChallengeTools() {
  const [currentSteps, setCurrentSteps] = useState(8000);
  const [height, setHeight] = useState(176);
  const [weight, setWeight] = useState(80);

  const stepLength = height * 0.414;
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
            Körpergröße in cm
            <input
              type="number"
              min="120"
              max="220"
              value={height}
              onChange={(event) => setHeight(Number(event.target.value))}
            />
          </label>
        </div>
        <p className={styles.formulaNote}>
          Näherung: Schrittlänge = Körpergröße × 0,414. Für die Challenge reicht
          das völlig, weil es um Orientierung statt Vermessung geht.
        </p>

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
            <small>bei ca. {Math.round(stepLength)} cm Schrittlänge</small>
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
