import type { ChallengeDefinition } from "../domain/challenges/challenge-definition.ts";
import { formatMetricValue } from "../domain/challenges/challenge-outcome.ts";
import { supportsOptionalCompletionTime } from "../domain/challenges/completion-result.ts";

export type ChallengeSeoInput = {
  seoMarkdown?: string;
  slug?: string;
  title: string;
  description: string;
  goal: string;
  duration: string;
  definition: ChallengeDefinition;
  tips: readonly string[];
  faq?: readonly { question: string; answer: string }[];
};

// Pure, versioned content recipe: no clock, randomness, network or ranking data.
export const CHALLENGE_SEO_VERSION = 1;

export function buildChallengeSeoContent(challenge: ChallengeSeoInput) {
  const { definition } = challenge;
  let tracking: string;
  let ranking: string;

  if (challenge.slug === '100-tage-body-transformation') {
    tracking = 'Dokumentiere Gewicht und Umfänge in deinem privaten Verlauf. Vollständige Umfangsmessungen ergeben einen geschätzten Körperfettanteil nach der Navy-Formel. Start- und Endbild zeigen deine Veränderung; persönliche Teil-Challenges begleiten die 100 Tage.';
    ranking = 'Die Abnahme des geschätzten Navy-KFA in Prozentpunkten zählt: Startwert minus Endwert. Eine vollständige Messung an Tag 1 bildet die Basis; Tag 100 liefert das Endergebnis. Laufende Zwischenstände stehen separat. Gleiche auf eine Nachkommastelle gerundete Ergebnisse teilen sich einen Rang. Gewicht, Bilder und Teil-Challenges verändern den Rankingwert nicht. Die Schätzung weist keinen Muskelerhalt nach.';
  } else if (definition.type === "daily_boolean") {
    tracking = "Bestätige mit einem täglichen Check-in, dass du die Aufgabe nach den Regeln erfüllt hast. Aufeinanderfolgende erfüllte Tage bilden deinen Streak. So kannst du verfolgen, wie lange du am Stück drangeblieben bist.";
    ranking = "Im Ranking zählt zuerst dein aktueller Streak. Bei gleichem Streak folgen die Erfüllungsquote und die Anzahl erfüllter Tage. Ein verpasster Tag unterbricht die Serie; deine bisherigen Check-ins bleiben im Verlauf erhalten.";
  } else {
    const target = formatMetricValue(definition.targetValue, definition.unit);
    if (definition.type === "cumulative_metric") {
      tracking = `Sammle insgesamt ${target}. Trage bei jedem Check-in den neu erreichten Wert ein: Die Einträge werden addiert. Du musst das Gesamtziel nicht in einem einzigen Versuch erreichen.`;
      ranking = `Im Ranking zählt die gesammelte Summe; höhere Werte stehen weiter oben. Sobald deine Summe mindestens ${target} erreicht, ist das Ziel geschafft.`;
    } else if (supportsOptionalCompletionTime(definition)) {
      tracking = `Das messbare Ziel beträgt ${definition.direction === "at_most" ? "höchstens" : "mindestens"} ${target} in einem Versuch. Bestätige den erfolgreichen Abschluss, wenn du das Ziel nach den Regeln erreicht hast. Optional kannst du die dafür benötigte Zeit in Sekunden ergänzen.`;
      ranking = "Geschaffte Ziele stehen im Ranking vor offenen Teilnahmen. Unter den Erfolgen zählen kürzere gemeldete Zeiten zuerst. Erfolge ohne Zeit stehen dahinter gemeinsam auf einem Rang. Du kannst deine persönliche Bestzeit nach dem Abschluss weiter verbessern.";
    } else {
      tracking = `Erfasse das Ergebnis eines einzelnen Versuchs. Das Ziel ist bei ${definition.direction === "at_most" ? "höchstens" : "mindestens"} ${target} erreicht. Mehrere Versuche werden nicht addiert; dein bestes Ergebnis zählt.`;
      ranking = `Erreichte Ziele stehen vor offenen Teilnahmen. Bei dieser Zeitwertung sind ${definition.direction === "at_most" ? "kürzere" : "längere"} Zeiten besser. Weitere Versuche können deine persönliche Bestleistung verbessern.`;
    }
  }

  return {
    version: CHALLENGE_SEO_VERSION,
    heading: `${challenge.title}: Ablauf und Wertung`,
    intro: challenge.description.trim(),
    sections: [
      { heading: "Dein Ziel und Zeitrahmen", paragraphs: [challenge.goal.trim(), `Zeitrahmen: ${challenge.duration}. ${tracking}`] },
      { heading: "So zählt dein Ergebnis im Ranking", paragraphs: [ranking, "Die Ergebnisse werden von den Teilnehmenden selbst eingetragen. Im öffentlichen Ranking erscheinen nur freigegebene Teilnahmen."] }
    ],
    tips: [...new Set(challenge.tips.map((tip) => tip.trim()).filter(Boolean))],
    faq: (challenge.faq ?? []).map((item) => ({ ...item })),
  };
}
