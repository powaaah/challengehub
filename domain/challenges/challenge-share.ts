import type { ChallengeDefinition } from './challenge-definition.ts';
import { formatRankingTime, supportsOptionalCompletionTime } from './completion-result.ts';

export function buildChallengeShare(title: string, definition: ChallengeDefinition, result?: { completed: boolean; rankingTimeSeconds: number | null }) {
  const seconds = result?.completed ? result.rankingTimeSeconds : null;
  const hasTime = typeof seconds === 'number' && Number.isFinite(seconds) && seconds > 0;
  const lowerIsBetter = supportsOptionalCompletionTime(definition) || (definition.type === 'one_time_result' && definition.direction === 'at_most');
  return {
    label: hasTime ? 'Schlage meine Zeit' : 'Jemanden herausfordern',
    text: hasTime
      ? `Ich habe „${title}“ geschafft: ${formatRankingTime(seconds)}. ${lowerIsBetter ? 'Schaffst du es schneller?' : 'Hältst du länger durch?'} Gleiche Regeln, dein Versuch!`
      : `Ich fordere dich heraus: ${title}. Schaffst du die Challenge? Hier findest du die Regeln und kannst dein Ergebnis festhalten.`
  };
}
