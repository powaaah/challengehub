import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import App from '../App';
import { createCatalogClient } from '../src/catalog-client';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('../src/catalog-client', () => ({ createCatalogClient: jest.fn() }));
const list = jest.fn();
const item = {
  slug: 'test-challenge', title: 'Test-Challenge', durationLabel: '30 Tage',
  goal: 'Jeden Tag aktiv sein.', description: 'Eine gemeinsame Herausforderung.',
  rules: ['Ein Eintrag pro Tag.'], tips: ['Plane eine feste Zeit.'],
};
const page = (data = [item], nextCursor: string | null = null) => ({ apiVersion: 'v1', data, pagination: { limit: 10, nextCursor } });

beforeEach(() => {
  list.mockReset().mockResolvedValue(page());
  jest.mocked(createCatalogClient).mockReturnValue({ list, findBySlug: jest.fn() });
});

async function openCatalog() {
  await render(<App />);
  await fireEvent.press(screen.getByRole('button', { name: '1 vs 1. Fordere jemanden heraus.' }));
}

describe('Mobile-Einstieg ohne Login', () => {
  it('zeigt drei horizontale Kacheln und lädt erst nach Auswahl', async () => {
    await render(<App />);
    expect(screen.getByTestId('start-tiles')).toHaveStyle({ flexDirection: 'row' });
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(list).not.toHaveBeenCalled();
  });

  it.each([
    ['1 vs 1. Fordere jemanden heraus.', '1 vs 1'],
    ['Gruppe. Mit deinen Leuten.', 'Gruppe'],
    ['Global. Miss dich mit den Besten der Welt.', 'Global'],
  ])('öffnet %s mit echtem Katalogvertrag ohne Anmeldung', async (label, title) => {
    await render(<App />);
    await fireEvent.press(screen.getByRole('button', { name: label }));
    expect(screen.getByRole('header', { name: title })).toBeOnTheScreen();
    await screen.findByRole('button', { name: 'Test-Challenge ansehen' });
    await fireEvent.press(screen.getByRole('button', { name: 'Zurück zur Startseite' }));
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('zeigt Regeln und Ziele und behält den geladenen Katalog beim Zurückgehen', async () => {
    await openCatalog();
    await fireEvent.press(await screen.findByRole('button', { name: 'Test-Challenge ansehen' }));
    expect(screen.getByRole('header', { name: 'Test-Challenge' })).toBeOnTheScreen();
    expect(screen.getByText('1. Ein Eintrag pro Tag.')).toBeOnTheScreen();
    expect(screen.getByText(item.goal)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Zurück zum Katalog' }));
    expect(screen.getByRole('button', { name: 'Test-Challenge ansehen' })).toBeOnTheScreen();
    expect(list).toHaveBeenCalledTimes(1);
  });

  it('zeigt Ladezustand und bricht die Anfrage beim Verlassen ab', async () => {
    list.mockImplementation(() => new Promise(() => {}));
    await openCatalog();
    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    const signal = list.mock.calls[0][0].signal;
    await fireEvent.press(screen.getByRole('button', { name: 'Zurück zur Startseite' }));
    expect(signal.aborted).toBe(true);
  });

  it('erlaubt nach einem Fehler einen erneuten Versuch', async () => {
    list.mockRejectedValueOnce(new Error('offline'));
    await openCatalog();
    await fireEvent.press(await screen.findByRole('button', { name: 'Erneut versuchen' }));
    await screen.findByRole('button', { name: 'Test-Challenge ansehen' });
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('zeigt einen ehrlichen Leerzustand', async () => {
    list.mockResolvedValue(page([]));
    await openCatalog();
    await screen.findByText('Aktuell sind keine Challenges verfügbar.');
    expect(screen.queryByRole('button', { name: 'Weitere Challenges laden' })).toBeNull();
  });

  it('behält die erste Seite bei Ladefehlern und entfernt doppelte Slugs beim Nachladen', async () => {
    list.mockResolvedValueOnce(page([item], 'next')).mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page([item, { ...item, slug: 'second', title: 'Zweite Challenge' }]));
    await openCatalog();
    await fireEvent.press(await screen.findByRole('button', { name: 'Weitere Challenges laden' }));
    await screen.findByRole('button', { name: 'Erneut versuchen' });
    expect(screen.getByRole('button', { name: 'Test-Challenge ansehen' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Erneut versuchen' }));
    await screen.findByRole('button', { name: 'Zweite Challenge ansehen' });
    await waitFor(() => expect(list.mock.calls[2][0].cursor).toBe('next'));
    expect(screen.getAllByRole('button', { name: 'Test-Challenge ansehen' })).toHaveLength(1);
  });
});
