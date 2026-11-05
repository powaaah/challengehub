import { calculateChallengeOutcome, parseChallengeDefinition, type ChallengeDefinition } from '../../../domain/challenges/competition-definition';

export const PARTICIPATION_KEY = 'challengehub.participations.v1';
export type ParticipationSource = { sourceKey: string; title: string; goal: string; rules: string[]; definition: ChallengeDefinition; durationDays: number | null };
export type Entry = { id: string; at: string; day: string; value: number | null };
export type Participation = Omit<ParticipationSource, 'durationDays'> & { id: string; durationDays: number; startedAt: string; timeZone: string; startDay: string; endDay: string; entries: Entry[] };

export function dayAt(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-');
}
export function addDays(day: string, days: number) {
  const date = new Date(day + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function progress(run: Participation, now = new Date()) {
  const outcome = calculateChallengeOutcome({ definition: run.definition, checkIns: run.entries.map(entry => ({ date: entry.day, value: entry.value })) });
  const daily = run.definition.type === 'daily_boolean';
  const completed = daily ? outcome.value >= run.durationDays : outcome.completed;
  return {
    completed,
    status: completed ? 'Geschafft' : dayAt(now, run.timeZone) >= run.endDay ? 'Zeitraum beendet' : 'Läuft',
    percent: daily ? Math.min(100, Math.round(outcome.value / run.durationDays * 100)) : outcome.completionRate,
    label: daily ? `${outcome.value} von ${run.durationDays} Tagen erledigt` : outcome.label,
  };
}
export function startParticipation(source: ParticipationSource, durationDays: number, id: string, now = new Date(), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone): Participation {
  if (source.sourceKey === 'public:100-tage-body-transformation') throw Error('Für diese Challenge fehlt noch die spezielle Messwerterfassung.');
  if (!source.sourceKey || !source.title.trim() || !source.goal.trim() || !source.rules.length || !parseChallengeDefinition(source.definition)) throw Error('Die Challenge-Daten sind unvollständig.');
  if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365 || (source.durationDays !== null && source.durationDays !== durationDays)) throw Error('Wähle einen Zeitraum von 1 bis 365 ganzen Tagen.');
  const startDay = dayAt(now, timeZone);
  return { ...source, rules: [...source.rules], definition: { ...source.definition }, durationDays, id, startedAt: now.toISOString(), timeZone, startDay, endDay: addDays(startDay, durationDays), entries: [] };
}
export function recordEntry(run: Participation, value: number | null, id: string, now = new Date()): Participation {
  if (run.entries.some(entry => entry.id === id)) return run;
  if (now.getTime() < Date.parse(run.entries.at(-1)?.at ?? run.startedAt) || progress(run, now).status !== 'Läuft') throw Error('Für diesen Versuch können keine weiteren Einträge gespeichert werden.');
  if (run.entries.length >= 2000) throw Error('Für diesen Versuch sind maximal 2000 Einträge möglich.');
  const day = dayAt(now, run.timeZone);
  if (day < run.startDay || day >= run.endDay) throw Error('Der Eintrag liegt außerhalb deines Zeitraums.');
  if (run.definition.type === 'daily_boolean') {
    if (run.entries.some(entry => entry.day === day)) throw Error('Heute hast du bereits abgehakt.');
    if (value !== null) throw Error('Für tägliche Challenges wird nur abgehakt.');
  } else if (value === null || !Number.isFinite(value) || value <= 0 || !Number.isFinite(run.entries.reduce((sum, entry) => sum + (entry.value ?? 0), value))) throw Error('Gib einen positiven, endlichen Messwert ein.');
  return { ...run, entries: [...run.entries, { id, day, at: now.toISOString(), value }] };
}
export function decodeParticipations(raw: string | null): Participation[] {
  if (raw === null) return [];
  const data = JSON.parse(raw);
  if (data?.version !== 1 || !Array.isArray(data.items) || data.items.length > 100) throw Error('invalid_storage');
  const ids = new Set<string>();
  return data.items.map((item: Participation) => {
    if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id) || typeof item.sourceKey !== 'string' || typeof item.title !== 'string' || typeof item.goal !== 'string' || !Array.isArray(item.rules) || !item.rules.every(rule => typeof rule === 'string') || typeof item.startedAt !== 'string' || typeof item.timeZone !== 'string' || !Array.isArray(item.entries) || item.entries.length > 2000) throw Error('invalid_run');
    const definition = parseChallengeDefinition(item.definition);
    if (!definition) throw Error('invalid_definition');
    let run = startParticipation({ ...item, definition }, item.durationDays, item.id, new Date(item.startedAt), item.timeZone);
    if (run.startDay !== item.startDay || run.endDay !== item.endDay) throw Error('invalid_period');
    const entryIds = new Set<string>();
    let previous = Date.parse(item.startedAt);
    for (const entry of item.entries) {
      if (!entry || typeof entry.id !== 'string' || !entry.id || entryIds.has(entry.id) || typeof entry.at !== 'string' || !Number.isFinite(Date.parse(entry.at)) || Date.parse(entry.at) < previous || dayAt(new Date(entry.at), item.timeZone) !== entry.day) throw Error('invalid_entry');
      run = recordEntry(run, entry.value, entry.id, new Date(entry.at));
      entryIds.add(entry.id); previous = Date.parse(entry.at);
    }
    ids.add(item.id);
    return run;
  });
}
