import { fireEvent, render, screen, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';
import { decodeChallenges, STORAGE_KEY, validateForm, emptyForm } from '../src/local-challenges';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
beforeEach(async () => { await AsyncStorage.clear(); jest.clearAllMocks(); });

async function fillForm() {
  await fireEvent.press(screen.getByRole('button', { name: 'Neue Challenge erstellen' }));
  await fireEvent.changeText(screen.getByLabelText('Titel'), 'Meine Schritte');
  await fireEvent.changeText(screen.getByLabelText('Dein Ziel'), 'Jeden Tag spazieren gehen');
  await fireEvent.changeText(screen.getByLabelText('Regeln – eine pro Zeile'), 'Jeden Tag rausgehen.\nEinmal am Tag abhaken.');
}
async function saveChallenge() {
  await fillForm();
  await fireEvent.press(screen.getByRole('button', { name: 'Vorschau' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Challenge speichern' }));
  await screen.findByRole('header', { name: 'Challenge gespeichert' });
  await fireEvent.press(screen.getByRole('button', { name: 'Fertig' }));
}

test('erstellt ohne Login, erhält Daten nach Neustart und löscht erst nach Bestätigung', async () => {
  const view = await render(<App />);
  await saveChallenge();
  expect(decodeChallenges(await AsyncStorage.getItem(STORAGE_KEY))).toHaveLength(1);
  await view.unmount();
  await render(<App />);
  await fireEvent.press(await screen.findByRole('button', { name: 'Meine Schritte öffnen' }));
  expect(screen.getByText('1. Jeden Tag rausgehen.')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Challenge löschen' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Behalten' }));
  expect(decodeChallenges(await AsyncStorage.getItem(STORAGE_KEY))).toHaveLength(1);
  await fireEvent.press(screen.getByRole('button', { name: 'Challenge löschen' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Endgültig löschen' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Meine Schritte öffnen' })).toBeNull());
  expect(decodeChallenges(await AsyncStorage.getItem(STORAGE_KEY))).toHaveLength(0);
});

test('zeigt Pflichtfeldfehler und bewahrt Angaben beim Zurückgehen aus der Vorschau', async () => {
  await render(<App />);
  await fireEvent.press(screen.getByRole('button', { name: 'Neue Challenge erstellen' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Vorschau' }));
  expect(screen.getByText('Bitte gib einen Titel, ein Ziel und mindestens eine Regel ein.')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Abbrechen' }));
  await fillForm();
  await fireEvent.press(screen.getByRole('button', { name: 'Vorschau' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Angaben ändern' }));
  expect(screen.getByDisplayValue('Meine Schritte')).toBeOnTheScreen();
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});

test('Speicherfehler erzeugt keinen falschen Erfolg und erlaubt Wiederholung', async () => {
  await render(<App />);
  await fillForm();
  await fireEvent.press(screen.getByRole('button', { name: 'Vorschau' }));
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('disk full'));
  await fireEvent.press(screen.getByRole('button', { name: 'Challenge speichern' }));
  await screen.findByText(/Speichern fehlgeschlagen/);
  expect(screen.queryByRole('header', { name: 'Challenge gespeichert' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Challenge speichern' }));
  await screen.findByRole('header', { name: 'Challenge gespeichert' });
  expect(decodeChallenges(await AsyncStorage.getItem(STORAGE_KEY))).toHaveLength(1);
});

test('beschädigte gespeicherte Daten werden nicht überschrieben', async () => {
  await AsyncStorage.setItem(STORAGE_KEY, '{invalid');
  jest.mocked(AsyncStorage.setItem).mockClear();
  await render(<App />);
  await screen.findByText('Deine eigenen Challenges konnten nicht geladen werden.');
  await fillForm();
  await fireEvent.press(screen.getByRole('button', { name: 'Vorschau' }));
  expect(screen.getByRole('button', { name: 'Challenge speichern' })).toBeDisabled();
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});

test('mehrfaches Tippen während des Speicherns schreibt nur einmal', async () => {
  let finish: (() => void) | undefined;
  await render(<App />); await fillForm();
  await fireEvent.press(screen.getByRole('button', { name: 'Vorschau' }));
  jest.mocked(AsyncStorage.setItem).mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  await fireEvent.press(screen.getByRole('button', { name: 'Challenge speichern' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Wird gespeichert …' }));
  expect(screen.getByRole('button', { name: 'Wird gespeichert …' })).toBeDisabled();
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  await act(async () => { finish?.(); });
  await screen.findByRole('header', { name: 'Challenge gespeichert' });
});

const valid = { ...emptyForm, title: 'Test', goal: 'Ziel', rules: 'Regel' };
test.each(['0', '366', '1.5', '-1', 'abc'])('weist ungültige Dauer %s zurück', days => {
  expect(validateForm({ ...valid, days }).error).toBeDefined();
});
test('nutzt die bestehenden Typen für kumulative und einmalige Wertung mit Kommazahlen', () => {
  const cumulative = validateForm({ ...valid, type: 'cumulative_metric', unit: 'kilometers', target: '2,5', direction: 'at_most' });
  expect(cumulative.value?.definition).toMatchObject({ type: 'cumulative_metric', targetValue: 2.5, direction: 'at_least' });
  expect(validateForm({ ...valid, type: 'one_time_result', unit: 'seconds', target: '30', direction: 'at_most' }).value?.definition).toMatchObject({ direction: 'at_most', targetValue: 30 });
  expect(validateForm({ ...valid, type: 'one_time_result', target: '0' }).error).toBeDefined();
  expect(validateForm({ ...valid, title: 'a'.repeat(101) }).error).toBeDefined();
  expect(validateForm({ ...valid, rules: Array(21).fill('Regel').join('\n') }).error).toBeDefined();
});
