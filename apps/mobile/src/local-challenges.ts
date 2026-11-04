import { createChallengeDefinition, parseChallengeDefinition, type ChallengeDefinition } from '../../../domain/challenges/competition-definition';

export type ChallengeForm = { title: string; goal: string; rules: string; days: string; type: string; unit: string; target: string; direction: string };
export const emptyForm: ChallengeForm = { title: '', goal: '', rules: '', days: '30', type: 'daily_boolean', unit: 'repetitions', target: '', direction: 'at_least' };
export type ChallengeInput = { title: string; goal: string; rules: string[]; durationDays: number; definition: ChallengeDefinition };
export type LocalChallenge = ChallengeInput & { id: string; createdAt: string };
export const STORAGE_KEY = 'challengehub.local-challenges.v1';
export const MAX_CHALLENGES = 100;

export function validateForm(form: ChallengeForm): { value: ChallengeInput; error?: never } | { error: string; value?: never } {
  const title = form.title.trim(), goal = form.goal.trim();
  const rules = form.rules.split(/\r?\n/).map(rule => rule.trim()).filter(Boolean);
  if (!title || !goal || rules.length === 0) return { error: 'Bitte gib einen Titel, ein Ziel und mindestens eine Regel ein.' };
  if (Array.from(title).length > 100 || Array.from(goal).length > 200 || rules.length > 20 || rules.some(rule => Array.from(rule).length > 300)) {
    return { error: 'Erlaubt sind 100 Zeichen im Titel, 200 im Ziel und bis zu 20 Regeln mit je 300 Zeichen.' };
  }
  const durationDays = Number(form.days);
  if (!/^\d+$/.test(form.days.trim()) || !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365) return { error: 'Wähle eine Dauer von 1 bis 365 ganzen Tagen.' };
  const maximum = form.type === 'one_time_result' && form.direction === 'maximize';
  const target = form.target.trim().replace(',', '.');
  if (form.type !== 'daily_boolean' && !maximum && !/^\d+(?:\.\d+)?$/.test(target)) return { error: 'Gib einen positiven Zielwert ein, zum Beispiel 100 oder 2,5.' };
  const definition = createChallengeDefinition({ type: form.type, unit: form.unit, targetValue: maximum ? null : Number(target), direction: form.type === 'cumulative_metric' ? 'at_least' : form.direction });
  if (!definition) return { error: 'Prüfe Wertungsart, Einheit und positiven Zielwert.' };
  return { value: { title, goal, rules, durationDays, definition } };
}

export function decodeChallenges(raw: string | null): LocalChallenge[] {
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('items' in data) || !Array.isArray(data.items) || data.items.length > MAX_CHALLENGES) throw Error('invalid_storage');
  const ids = new Set<string>();
  return data.items.map((entry: unknown) => {
    if (!entry || typeof entry !== 'object') throw Error('invalid_entry');
    const item = entry as Record<string, unknown>;
    if (typeof item.id !== 'string' || !item.id || ids.has(item.id) || typeof item.createdAt !== 'string' || !Number.isFinite(Date.parse(item.createdAt)) || typeof item.title !== 'string' || typeof item.goal !== 'string' || !Array.isArray(item.rules) || !item.rules.every(rule => typeof rule === 'string') || typeof item.durationDays !== 'number') throw Error('invalid_entry');
    const definition = parseChallengeDefinition(item.definition);
    if (!definition) throw Error('invalid_definition');
    const validation = validateForm({ title: item.title, goal: item.goal, rules: item.rules.join('\n'), days: String(item.durationDays), type: definition.type, unit: definition.unit, target: String(definition.targetValue), direction: definition.direction });
    if (!validation.value) throw Error('invalid_fields');
    ids.add(item.id);
    return { ...validation.value, id: item.id, createdAt: item.createdAt };
  });
}
export function encodeChallenges(items: LocalChallenge[]) { return JSON.stringify({ version: 1, items }); }
