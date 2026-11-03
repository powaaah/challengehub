import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { formStyles as s } from './CreateChallengeForm';
import { progress, type ParticipationSource } from './participation';
import type { ParticipationStore } from './useParticipations';

export function StartParticipation({ source, store, onOpen }: { source: ParticipationSource; store: ParticipationStore; onOpen: (id: string) => void }) {
  const [days, setDays] = useState(String(source.durationDays ?? (source.definition?.type === 'one_time_result' ? 1 : 30)));
  const [error, setError] = useState(''), [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const existing = store.items.find(run => run.sourceKey === source.sourceKey && progress(run, store.now).status === 'Läuft');
  async function start() {
    if (busy.current) return;
    busy.current = true; setSaving(true); setError('');
    try {
      if (!/^\d+$/.test(days.trim())) throw Error('Wähle eine ganze Anzahl Tage zwischen 1 und 365.');
      const id = await store.start(source, Number(days)); onOpen(id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Start fehlgeschlagen. Bitte erneut versuchen.'); }
    finally { busy.current = false; setSaving(false); }
  }
  if (source.sourceKey === 'public:100-tage-body-transformation') return <Text style={s.body}>Für diese Challenge wird die spezielle Körpermesswert-Erfassung noch ergänzt. Sie kann hier noch nicht gestartet werden.</Text>;
  return <View style={{ gap: 12, marginVertical: 12 }}>
    <Text style={s.body}>Dein persönlicher Versuch auf diesem Gerät. Kein gemeinsames Battle und kein Eintrag im öffentlichen Ranking.</Text>
    {existing ? <Pressable accessibilityRole="button" onPress={() => onOpen(existing.id)} style={s.primary}><Text style={s.primaryText}>Fortschritt öffnen</Text></Pressable> : <>
      {source.durationDays === null ? <>
        <Text style={s.label}>Dein Zeitfenster in Tagen</Text>
        <TextInput accessibilityLabel="Dein Zeitfenster in Tagen" value={days} onChangeText={setDays} maxLength={3} keyboardType="number-pad" style={s.input} />
        <Text style={s.body}>Heute zählt als Tag 1. Beachte die Regeln der Challenge.</Text>
      </> : <Text style={s.body}>Dauer: {source.durationDays} Tage. Heute zählt als Tag 1.</Text>}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving || !store.ready, busy: saving }} disabled={saving || !store.ready} onPress={() => { void start(); }} style={s.primary}><Text style={s.primaryText}>{saving ? 'Wird gestartet …' : 'Challenge starten'}</Text></Pressable>
    </>}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {store.error && <Pressable accessibilityRole="button" onPress={store.reload} style={s.action}><Text style={s.link}>Fortschrittsspeicher erneut laden</Text></Pressable>}
  </View>;
}
