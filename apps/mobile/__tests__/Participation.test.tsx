import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';
import { addDays, dayAt, decodeParticipations, PARTICIPATION_KEY, progress, recordEntry, startParticipation, type ParticipationSource } from '../src/participation';
import { encodeChallenges, STORAGE_KEY } from '../src/local-challenges';
import { createChallengeDefinition } from '../../../domain/challenges/challenge-definition';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
const source: ParticipationSource = { sourceKey: 'local-test', title: 'Mein Tagesziel', goal: 'Aktiv werden', rules: ['Einmal pro Tag.'], durationDays: 2, definition: createChallengeDefinition({ type: 'daily_boolean' })! };
beforeEach(async () => { await AsyncStorage.clear(); jest.clearAllMocks(); });

function daily() { return startParticipation(source, 2, 'run', new Date('2026-03-28T11:00:00Z'), 'Europe/Berlin'); }
test('tägliche Einträge gelten einmal pro Kalendertag, auch über Sommerzeitwechsel', () => {
  let run = daily();
  run = recordEntry(run, null, 'one', new Date('2026-03-28T11:10:00Z'));
  expect(progress(run, new Date('2026-03-28T11:11:00Z')).percent).toBe(50);
  expect(() => recordEntry(run, null, 'two', new Date('2026-03-28T20:00:00Z'))).toThrow('bereits');
  run = recordEntry(run, null, 'two', new Date('2026-03-28T23:05:00Z'));
  expect(progress(run).completed).toBe(true);
  expect(run.endDay).toBe('2026-03-30');
  expect(dayAt(new Date('2026-03-29T22:00:00Z'), run.timeZone)).toBe(run.endDay);
  expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
});
test('Endgrenze exklusiv, Einträge vor Start oder nach Ablauf abweisen', () => {
  const run = daily();
  expect(() => recordEntry(run, null, 'one', new Date('2026-03-28T10:59:00Z'))).toThrow();
  expect(() => recordEntry(run, null, 'one', new Date('2026-03-29T22:00:00Z'))).toThrow();
  expect(progress(run, new Date('2026-03-29T22:00:00Z'))).toMatchObject({ status: 'Zeitraum beendet', completed: false });
});
test('Summen, wiederholte IDs und Abschluss sind deterministisch', () => {
  const input = { ...source, definition: createChallengeDefinition({ type: 'cumulative_metric', unit: 'steps', targetValue: 100, direction: 'at_least' })! };
  let run = startParticipation(input, 2, 'run');
  run = recordEntry(run, 40, 'one');
  expect(recordEntry(run, 40, 'one')).toBe(run);
  expect(progress(run).percent).toBe(40);
  expect(() => recordEntry(run, NaN, 'bad')).toThrow();
  expect(() => recordEntry(run, -1, 'bad')).toThrow();
  run = recordEntry(run, 60, 'two');
  expect(progress(run)).toMatchObject({ completed: true, percent: 100 });
  expect(() => recordEntry(run, 10, 'three')).toThrow();
});
test('Einmalige Ergebnisse respektieren at_most und at_least', () => {
  for (const [direction, values] of [['at_most', [50, 40, 20]], ['at_least', [10, 20, 40]]] as const) {
    let run = startParticipation({ ...source, definition: createChallengeDefinition({ type: 'one_time_result', unit: 'seconds', targetValue: 30, direction })! }, 2, direction);
    values.forEach((value, index) => { run = recordEntry(run, value, String(index)); });
    expect(progress(run).completed).toBe(true);
  }
});
test('Regeln werden kopiert; ungültige und widersprüchliche gespeicherte Daten blockiert', () => {
  const input = { ...source, rules: ['Original'] };
  let run = startParticipation(input, 2, 'run'); input.rules[0] = 'Geändert';
  expect(run.rules).toEqual(['Original']);
  run = recordEntry(run, null, 'entry');
  expect(decodeParticipations(JSON.stringify({ version: 1, items: [run] }))).toEqual([run]);
  expect(() => decodeParticipations(JSON.stringify({ version: 1, items: [{ ...run, entries: [...run.entries, ...run.entries] }] }))).toThrow();
  expect(() => decodeParticipations(JSON.stringify({ version: 1, items: [{ ...run, endDay: '2099-01-01' }] }))).toThrow();
  expect(() => startParticipation({ ...source, sourceKey: 'public:100-tage-body-transformation' }, 2, 'run')).toThrow();
});

async function seed(days = 2, metric = false) {
  await AsyncStorage.setItem(STORAGE_KEY, encodeChallenges([{ ...source, id: 'local-test', createdAt: new Date().toISOString(), durationDays: days, definition: metric ? createChallengeDefinition({ type: 'cumulative_metric', unit: 'steps', targetValue: 100, direction: 'at_least' })! : source.definition }]));
}
async function startOwn() {
  await fireEvent.press(await screen.findByRole('button', { name: 'Mein Tagesziel öffnen' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Challenge starten' }));
  await screen.findByRole('header', { name: 'Läuft' });
}
test('eigene Challenge starten, täglich abhaken und nach Neustart fortsetzen ohne Duplikat', async () => {
  await seed(); const view = await render(<App />); await startOwn();
  await fireEvent.press(screen.getByRole('button', { name: 'Heute erledigt' }));
  await screen.findByText('1 von 2 Tagen erledigt · 50 %');
  expect(screen.getByRole('button', { name: 'Heute bereits erledigt' })).toBeDisabled();
  await view.unmount(); await render(<App />);
  await fireEvent.press(await screen.findByRole('button', { name: 'Mein Tagesziel öffnen' }));
  expect(screen.queryByRole('button', { name: 'Challenge starten' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Fortschritt öffnen' }));
  expect(screen.getByText('1 von 2 Tagen erledigt · 50 %')).toBeOnTheScreen();
  expect(decodeParticipations(await AsyncStorage.getItem(PARTICIPATION_KEY))).toHaveLength(1);
});
test('Messwerte addieren und abgeschlossenen Versuch unter Meine Challenges anzeigen', async () => {
  await seed(2, true); await render(<App />); await startOwn();
  await fireEvent.changeText(screen.getByLabelText('Messwert in Schritte'), '40');
  await fireEvent.press(screen.getByRole('button', { name: 'Messwert speichern' }));
  await screen.findByText('40 von 100 Schritte · 40 %');
  await fireEvent.changeText(screen.getByLabelText('Messwert in Schritte'), '60');
  await fireEvent.press(screen.getByRole('button', { name: 'Messwert speichern' }));
  await screen.findByRole('header', { name: 'Geschafft' });
  await fireEvent.press(screen.getByRole('button', { name: 'Zurück zur Startseite' }));
  expect(screen.getByText('Beendet')).toBeOnTheScreen();
});
test('Schreibfehler erhält bisherigen Fortschritt und erlaubt Wiederholung', async () => {
  await seed(); await render(<App />); await startOwn();
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('disk full'));
  await fireEvent.press(screen.getByRole('button', { name: 'Heute erledigt' }));
  await screen.findByText(/Speichern fehlgeschlagen/);
  expect(decodeParticipations(await AsyncStorage.getItem(PARTICIPATION_KEY))[0].entries).toHaveLength(0);
  await fireEvent.press(screen.getByRole('button', { name: 'Heute erledigt' }));
  await screen.findByText('1 von 2 Tagen erledigt · 50 %');
});
test('ungültiger Fortschrittsspeicher blockiert Start und bleibt unverändert', async () => {
  await seed(); await AsyncStorage.setItem(PARTICIPATION_KEY, '{bad'); await render(<App />);
  await screen.findByText(/Dein Fortschritt konnte nicht geladen/);
  await fireEvent.press(screen.getByRole('button', { name: 'Mein Tagesziel öffnen' }));
  expect(screen.getByRole('button', { name: 'Challenge starten' })).toBeDisabled();
  expect(await AsyncStorage.getItem(PARTICIPATION_KEY)).toBe('{bad');
});
test('Verlauf nur nach Bestätigung löschen, Vorlage bleibt erhalten', async () => {
  await seed(); await render(<App />); await startOwn();
  await fireEvent.press(screen.getByRole('button', { name: 'Versuch löschen' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Behalten' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Versuch löschen' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Verlauf endgültig löschen' }));
  await waitFor(() => expect(screen.queryByRole('header', { name: 'Läuft' })).toBeNull());
  expect(screen.getByRole('button', { name: 'Mein Tagesziel öffnen' })).toBeOnTheScreen();
  expect(decodeParticipations(await AsyncStorage.getItem(PARTICIPATION_KEY))).toHaveLength(0);
});
