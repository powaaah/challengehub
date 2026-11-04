import { createChallengeDefinition as createTargetDefinition, parseChallengeDefinition as parseTargetDefinition, METRIC_UNITS, type ChallengeDefinition as TargetDefinition, type MetricUnit } from './challenge-definition.ts';
import { calculateChallengeOutcome as calculateTargetOutcome, formatMetricValue, type ChallengeCheckIn } from './challenge-outcome.ts';

// Open-ended competition scoring is used by mobile templates and guest duels.
// Existing website targets and public API definitions retain their original schema.
export type MaximumDefinition = {
  type: 'one_time_result';
  unit: Exclude<MetricUnit, 'completion'>;
  targetValue: null;
  frequency: 'once';
  direction: 'maximize';
  completionCriterion: 'best_result';
};
export type ChallengeDefinition = TargetDefinition | MaximumDefinition;

export function createChallengeDefinition(input: { type: unknown; unit?: unknown; targetValue?: unknown; direction?: unknown }): ChallengeDefinition | null {
  if (input.type === 'one_time_result' && input.direction === 'maximize') {
    if (input.targetValue !== null || typeof input.unit !== 'string' || input.unit === 'completion' || !METRIC_UNITS.includes(input.unit as MetricUnit)) return null;
    return { type: 'one_time_result', unit: input.unit as MaximumDefinition['unit'], targetValue: null, frequency: 'once', direction: 'maximize', completionCriterion: 'best_result' };
  }
  return createTargetDefinition(input);
}

export function parseChallengeDefinition(value: unknown): ChallengeDefinition | null {
  if (value && typeof value === 'object' && 'direction' in value && value.direction === 'maximize') {
    const d = value as Record<string, unknown>;
    if (d.frequency !== 'once' || d.completionCriterion !== 'best_result') return null;
    return createChallengeDefinition({ type: d.type, unit: d.unit, targetValue: d.targetValue, direction: d.direction });
  }
  return parseTargetDefinition(value);
}

export function calculateChallengeOutcome(input: { definition: ChallengeDefinition; checkIns: ChallengeCheckIn[] }) {
  if (input.definition.direction !== 'maximize') return calculateTargetOutcome({ ...input, definition: input.definition });
  const values = input.checkIns.map(entry => entry.value).filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0);
  const value = values.reduce((best, next) => Math.max(best, next), 0);
  return { value, completionRate: null, completed: false, label: values.length ? `Bestleistung: ${formatMetricValue(value, input.definition.unit)}` : 'Noch kein Ergebnis' };
}
