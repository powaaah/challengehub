import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeChallenges, encodeChallenges, MAX_CHALLENGES, STORAGE_KEY, type ChallengeInput, type LocalChallenge } from './local-challenges';

export function useLocalChallenges() {
  const [items, setItems] = useState<LocalChallenge[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const current = useRef<LocalChallenge[]>([]);
  const busy = useRef(false);
  const loaded = useRef(false);
  const reload = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    loaded.current = false;
    try {
      const stored = decodeChallenges(await AsyncStorage.getItem(STORAGE_KEY));
      current.current = stored;
      loaded.current = true;
      setItems(stored);
      setReady(true);
      setError(false);
    } catch { setReady(false); setError(true); }
    finally { busy.current = false; }
  }, []);
  // State updates occur after the asynchronous external storage read, never during render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void reload(); }, [reload]);

  async function persist(next: LocalChallenge[]) {
    if (!loaded.current || busy.current) throw Error('Der lokale Speicher ist noch nicht bereit. Bitte versuche es erneut.');
    busy.current = true;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, encodeChallenges(next));
      current.current = next;
      setItems(next);
    } catch { throw Error('Speichern fehlgeschlagen. Deine bisherigen Challenges bleiben erhalten. Bitte versuche es erneut.'); }
    finally { busy.current = false; }
  }
  async function save(input: ChallengeInput) {
    if (current.current.length >= MAX_CHALLENGES) throw Error('Du hast bereits 100 eigene Challenges. Lösche zuerst eine nicht mehr benötigte Challenge.');
    let id: string;
    do { id = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; } while (current.current.some(item => item.id === id));
    const item = { ...input, id, createdAt: new Date().toISOString() };
    await persist([item, ...current.current]);
    return item;
  }
  async function remove(id: string) { await persist(current.current.filter(item => item.id !== id)); }
  return { items, ready, error, reload, save, remove };
}
export type LocalChallengeStore = ReturnType<typeof useLocalChallenges>;
