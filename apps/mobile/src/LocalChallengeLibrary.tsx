import type { DuelSource } from '../../../domain/guest-duels/types';
import { StartParticipation } from './StartParticipation';
import type { ParticipationStore } from './useParticipations';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LocalChallengeStore } from './useLocalChallenges';
import { formStyles as s, scoringLabel } from './CreateChallengeForm';

export function LocalChallengeLibrary({ store, runs, onOpen, onDuel, selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string | null) => void; onDuel?: (source: DuelSource) => void; store: LocalChallengeStore; runs: ParticipationStore; onOpen: (id: string) => void }) {
  const selected = store.items.find(item => item.id === selectedId) ?? null;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  function close() { if (!deleting) { onSelect(null); setConfirmDelete(false); setError(''); } }
  async function remove() {
    if (!selected || deleting) return;
    setDeleting(true); setError('');
    try { await store.remove(selected.id); onSelect(null); setConfirmDelete(false); }
    catch (e) { setError(e instanceof Error ? e.message : 'Löschen fehlgeschlagen.'); }
    finally { setDeleting(false); }
  }
  if (!store.ready) return <View style={{ marginTop: 24, gap: 12 }}>
    <Text style={s.body}>{store.error ? 'Deine eigenen Challenges konnten nicht geladen werden.' : 'Eigene Challenges werden geladen …'}</Text>
    {store.error && <Pressable accessibilityRole="button" onPress={store.reload} style={s.action}><Text style={s.link}>Speicher erneut laden</Text></Pressable>}
  </View>;
  if (!store.items.length) return null;
  return <View style={{ marginTop: 24, gap: 12 }}>
    <Text accessibilityRole="header" style={s.title}>Deine eigenen Challenges</Text>
    <Text style={s.body}>Nur auf diesem Gerät</Text>
    {store.items.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title} öffnen`} onPress={() => onSelect(item.id)} style={s.choice}>
      <Text style={s.label}>{item.title}</Text><Text style={s.body}>{item.durationDays} Tage · {scoringLabel(item)}</Text>
    </Pressable>)}
    <Modal visible={selected !== null} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.page}>
        <Pressable accessibilityRole="button" disabled={deleting} onPress={close} style={s.action}><Text style={s.link}>Zurück zur Startseite</Text></Pressable>
        {selected && <>
          <Text accessibilityRole="header" style={s.heading}>{selected.title}</Text>
          <Text style={s.body}>Auf diesem Gerät gespeichert · {selected.durationDays} Tage</Text>
          <Text style={s.body}>{scoringLabel(selected)}</Text>
          <Text style={s.label}>Dein Ziel</Text><Text style={s.body}>{selected.goal}</Text>
          <Text style={s.label}>Regeln</Text>{selected.rules.map((rule, index) => <Text key={index} style={s.body}>{index + 1}. {rule}</Text>)}
          {onDuel && <Pressable accessibilityRole="button" style={s.action} onPress={() => { onDuel({ ...selected, sourceKey: selected.id }); close(); }}><Text style={s.link}>Gemeinsames Duell anlegen</Text></Pressable>}
          <StartParticipation key={selected.id} source={{ ...selected, sourceKey: selected.id }} store={runs} onOpen={id => { close(); onOpen(id); }} />
          {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
          {confirmDelete ? <>
            <Text style={s.body}>Diese Challenge endgültig von diesem Gerät löschen?</Text>
            <Pressable accessibilityRole="button" disabled={deleting} onPress={remove} style={s.primary}><Text style={s.primaryText}>{deleting ? 'Wird gelöscht …' : 'Endgültig löschen'}</Text></Pressable>
            <Pressable accessibilityRole="button" disabled={deleting} onPress={() => setConfirmDelete(false)} style={s.action}><Text style={s.link}>Behalten</Text></Pressable>
          </> : <Pressable accessibilityRole="button" onPress={() => setConfirmDelete(true)} style={s.action}><Text style={s.link}>Challenge löschen</Text></Pressable>}
        </>}
      </ScrollView></SafeAreaView>
    </Modal>
  </View>;
}
