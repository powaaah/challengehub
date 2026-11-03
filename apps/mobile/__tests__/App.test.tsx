import { fireEvent, render, screen } from '@testing-library/react-native';
import App from '../App';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);

describe('Mobile-Einstieg', () => {
  it('zeigt die drei gleichrangigen Modi in einer horizontalen Reihe', async () => {
    await render(<App />);
    expect(screen.getByTestId('start-tiles')).toHaveStyle({ flexDirection: 'row' });
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Global. Miss dich mit den Besten der Welt.' })).toBeOnTheScreen();
  });

  it.each([
    ['1 gegen 1. Fordere jemanden heraus.', '1 gegen 1'],
    ['Gruppe. Mit deinen Leuten.', 'Gruppe'],
    ['Global. Miss dich mit den Besten der Welt.', 'Global'],
  ])('öffnet %s und kehrt zur Startseite zurück', async (label, title) => {
    await render(<App />);
    await fireEvent.press(screen.getByRole('button', { name: label }));
    expect(screen.getByRole('header', { name: title })).toBeOnTheScreen();
    expect(screen.getByText('BALD VERFÜGBAR')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Zurück zur Startseite' }));
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
});
