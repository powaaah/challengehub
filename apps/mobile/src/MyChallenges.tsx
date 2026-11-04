import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formStyles as s, scoringLabel, units } from './CreateChallengeForm';
import { addDays, dayAt, progress, type Participation } from './participation';
import type { ParticipationStore } from './useParticipations';

export function MyChallenges({ store, selectedId, onSelect }: { store: ParticipationStore; selectedId: string | null; onSelect: (id: string | null) => void }) {
  if (store.error) return <View style={{ marginTop: 24 }}><Text style={s.error}>Dein Fortschritt konnte nicht geladen werden. Vorhandene Daten werden nicht überschrieben.</Text><Pressable accessibilityRole="button" onPress={store.reload} style={s.action}><Text style={s.link}>Fortschrittsspeicher erneut laden</Text></Pressable></View>;
  const selected = store.items.find(run => run.id === selectedId);
  if (!store.items.length) return null;
  return <View style={{ marginTop: 24, gap: 12 }}>
    <Text accessibilityRole="header" style={s.title}>Meine Challenges</Text>
    {['Laufend', 'Beendet'].map(group => {
      const items = store.items.filter(run => (progress(run, store.now).status === 'Läuft') === (group === 'Laufend'));
      return items.length ? <View key={group} style={{ gap: 12 }}><Text style={s.label}>{group}</Text>{items.map(run => {
        const state = progress(run, store.now);
        return <Pressable key={run.id} accessibilityRole="button" accessibilityLabel={`${run.title} – Fortschritt öffnen`} onPress={() => onSelect(run.id)} style={s.choice}>
          <Text style={s.label}>{run.title}</Text><Text style={s.body}>{state.status} · {state.label}</Text>
        </Pressable>;
      })}</View> : null;
    })}
    <Modal visible={!!selected} animationType="slide" onRequestClose={() => onSelect(null)}>
      {selected && <ProgressScreen key={selected.id} run={selected} store={store} onClose={() => onSelect(null)} />}
    </Modal>
  </View>;
}
function ProgressScreen({ run, store, onClose }: { run: Participation; store: ParticipationStore; onClose: () => void }) {
  const [value, setValue] = useState(''), [error, setError] = useState('');
  const [saving, setSaving] = useState(false), [confirmDelete, setConfirmDelete] = useState(false);
  const busy = useRef(false);
  const state = progress(run, store.now), today = dayAt(store.now, run.timeZone);
  const daily = run.definition.type === 'daily_boolean', doneToday = run.entries.some(entry => entry.day === today);
  const unit = units.find(([id]) => id === run.definition.unit)?.[1] ?? '';
  async function submit() {
    if (busy.current) return;
    setError('');
    const raw = value.trim().replace(',', '.');
    if (!daily && (!/^\d+(?:\.\d+)?$/.test(raw) || !Number.isFinite(Number(raw)) || Number(raw) <= 0)) { setError('Gib einen positiven Messwert ein, zum Beispiel 10 oder 2,5.'); return; }
    busy.current = true; setSaving(true);
    try { await store.checkIn(run.id, daily ? null : Number(raw)); setValue(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Speichern fehlgeschlagen.'); }
    finally { busy.current = false; setSaving(false); }
  }
  async function remove() {
    if (busy.current) return;
    busy.current = true; setSaving(true); setError('');
    try { await store.remove(run.id); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Löschen fehlgeschlagen.'); }
    finally { busy.current = false; setSaving(false); }
  }
  return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>
    <Pressable accessibilityRole="button" disabled={saving} onPress={onClose} style={s.action}><Text style={s.link}>Zurück zur Startseite</Text></Pressable>
    <Text accessibilityRole="header" style={s.heading}>{run.title}</Text>
    <Text style={s.body}>Nur auf diesem Gerät · {run.startDay} bis {addDays(run.endDay, -1)} ({run.timeZone})</Text>
    <Text style={s.body}>{run.goal}</Text><Text style={s.body}>{scoringLabel(run)}</Text>
    <Text accessibilityRole="header" style={s.title}>{state.status}</Text>
    {state.percent !== null && <View accessible accessibilityRole="progressbar" accessibilityLabel="Dein Fortschritt" accessibilityValue={{ min: 0, max: 100, now: state.percent, text: state.label }} style={{ height: 12, borderRadius: 6, backgroundColor: '#444' }}><View style={{ width: `${state.percent}%`, height: 12, borderRadius: 6, backgroundColor: '#ff8c00' }} /></View>}
    <Text accessibilityLiveRegion="polite" style={s.body}>{state.label}{state.percent !== null ? ` · ${state.percent} %` : ''}</Text>
    {state.status === 'Läuft' && <>
      {!daily && <>
        <Text style={s.label}>Messwert in {unit}</Text>
        <TextInput accessibilityLabel={`Messwert in ${unit}`} value={value} onChangeText={setValue} keyboardType="decimal-pad" maxLength={20} editable={!saving} style={s.input} />
        <Text style={s.body}>{run.definition.direction === 'maximize' ? 'Trage die Anzahl aus einem vollständigen Versuch gemäß den Regeln ein. Dein höchster Wert zählt; du kannst ihn bis zum Ende des Zeitraums verbessern.' : run.definition.type === 'cumulative_metric' ? 'Trage den neu hinzugekommenen Wert ein. Die Einträge werden addiert.' : 'Trage ein Ergebnis ein. Bis zum Erreichen des Ziels zählt dein bestes Ergebnis.'}</Text>
      </>}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving || (daily && doneToday), busy: saving }} disabled={saving || (daily && doneToday)} onPress={() => { void submit(); }} style={s.primary}><Text style={s.primaryText}>{saving ? 'Wird gespeichert …' : daily ? doneToday ? 'Heute bereits erledigt' : 'Heute erledigt' : 'Messwert speichern'}</Text></Pressable>
    </>}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {state.completed && <Text style={s.body}>Ziel erreicht! Dieser Versuch ist abgeschlossen.</Text>}
    {state.status === 'Zeitraum beendet' && <Text style={s.body}>Der Zeitraum ist vorbei. Dein Ergebnis bleibt gespeichert.</Text>}
    <Text accessibilityRole="header" style={s.title}>Dein Verlauf</Text>
    {!run.entries.length && <Text style={s.body}>Noch keine Einträge.</Text>}
    {[...run.entries].reverse().map(entry => <Text key={entry.id} style={s.body}>{entry.day}: {daily ? 'Erledigt' : `${entry.value} ${unit}`}</Text>)}
    <Text accessibilityRole="header" style={s.title}>Regeln</Text>{run.rules.map((rule, index) => <Text key={index} style={s.body}>{index + 1}. {rule}</Text>)}
    {confirmDelete ? <>
      <Text style={s.body}>Diesen Versuch und seinen Verlauf endgültig löschen? Die ursprüngliche Challenge bleibt erhalten.</Text>
      <Pressable accessibilityRole="button" disabled={saving} onPress={() => { void remove(); }} style={s.action}><Text style={s.link}>Verlauf endgültig löschen</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={saving} onPress={() => setConfirmDelete(false)} style={s.action}><Text style={s.link}>Behalten</Text></Pressable>
    </> : <Pressable accessibilityRole="button" onPress={() => setConfirmDelete(true)} style={s.action}><Text style={s.link}>Versuch löschen</Text></Pressable>}
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
