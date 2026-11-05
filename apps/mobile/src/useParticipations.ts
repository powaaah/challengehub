import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeParticipations, PARTICIPATION_KEY, progress, recordEntry, startParticipation, type Participation, type ParticipationSource } from './participation';

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
export function useParticipations() {
  const [items, setItems] = useState<Participation[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const current = useRef<Participation[]>([]), loaded = useRef(false), busy = useRef(false);
  const reload = useCallback(async () => {
    if (busy.current) return;
    busy.current = true; loaded.current = false;
    try { const stored = decodeParticipations(await AsyncStorage.getItem(PARTICIPATION_KEY)); current.current = stored; loaded.current = true; setItems(stored); setReady(true); setError(false); }
    catch { setReady(false); setError(true); }
    finally { busy.current = false; }
  }, []);
  // All state changes in reload follow an asynchronous storage read.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') setNow(new Date()); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  async function mutate(update: (previous: Participation[]) => Participation[]) {
    if (!loaded.current || busy.current) throw Error('Der Fortschrittsspeicher ist noch nicht bereit. Bitte erneut versuchen.');
    busy.current = true;
    try {
      const next = update(current.current);
      try { await AsyncStorage.setItem(PARTICIPATION_KEY, JSON.stringify({ version: 1, items: next })); }
      catch { throw Error('Speichern fehlgeschlagen. Dein bisheriger Fortschritt bleibt erhalten. Bitte erneut versuchen.'); }
      current.current = next; setItems(next); setNow(new Date());
    } catch (e) { throw Error(e instanceof Error ? e.message : 'Speichern fehlgeschlagen. Bitte erneut versuchen.'); }
    finally { busy.current = false; }
  }
  async function start(source: ParticipationSource, durationDays: number) {
    let id = '';
    await mutate(previous => {
      const existing = previous.find(run => run.sourceKey === source.sourceKey && progress(run).status === 'Läuft');
      if (existing) { id = existing.id; return previous; }
      if (previous.length >= 100) throw Error('Maximal 100 Versuche. Lösche zuerst einen nicht mehr benötigten Verlauf.');
      id = newId();
      return [startParticipation(source, durationDays, id), ...previous];
    });
    return id;
  }
  async function checkIn(id: string, value: number | null) {
    await mutate(previous => {
      if (!previous.some(run => run.id === id)) throw Error('Dieser Versuch wurde nicht gefunden.');
      return previous.map(run => run.id === id ? recordEntry(run, value, newId()) : run);
    });
  }
  async function remove(id: string) { await mutate(previous => previous.filter(run => run.id !== id)); }
  return { items, ready, error, now, reload, start, checkIn, remove };
}
export type ParticipationStore = ReturnType<typeof useParticipations>;
