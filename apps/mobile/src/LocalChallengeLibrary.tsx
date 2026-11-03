import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LocalChallengeStore } from './useLocalChallenges';
import type { LocalChallenge } from './local-challenges';
import { formStyles as s, scoringLabel } from './CreateChallengeForm';

export function LocalChallengeLibrary({ store }: { store: LocalChallengeStore }) {
  const [selected, setSelected] = useState<LocalChallenge | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  function close() { if (!deleting) { setSelected(null); setConfirmDelete(false); setError(''); } }
  async function remove() {
    if (!selected || deleting) return;
    setDeleting(true); setError('');
    try { await store.remove(selected.id); setSelected(null); setConfirmDelete(false); }
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
    {store.items.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title} öffnen`} onPress={() => setSelected(item)} style={s.choice}>
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
