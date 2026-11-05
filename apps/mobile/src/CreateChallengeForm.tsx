import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { emptyForm, validateForm, type ChallengeForm, type ChallengeInput } from './local-challenges';
import type { LocalChallengeStore } from './useLocalChallenges';

export const units = [['repetitions', 'Wiederholungen'], ['steps', 'Schritte'], ['kilometers', 'Kilometer'], ['kilograms', 'Kilogramm'], ['seconds', 'Sekunden'], ['minutes', 'Minuten'], ['kilocalories', 'Kilokalorien']] as const;
export function scoringLabel(input: Pick<ChallengeInput, 'definition'>) {
  const d = input.definition;
  if (d.direction === 'minimize') return `Minimum ${units.find(([key]) => key === d.unit)?.[1] ?? d.unit} · Niedrigster Wert gewinnt`;
  if (d.direction === 'maximize') return `Maximum ${units.find(([key]) => key === d.unit)?.[1] ?? d.unit} · Höchster Wert gewinnt`;
  if (d.type === 'daily_boolean') return 'Täglich erledigt / nicht erledigt';
  return `${d.type === 'cumulative_metric' ? 'Insgesamt' : d.direction === 'at_most' ? 'Höchstens' : 'Mindestens'} ${d.targetValue} ${units.find(([key]) => key === d.unit)?.[1] ?? d.unit}`;
}
export function CreateChallengeForm({ store, onClose, onSaved, onOpenChallenge }: { store: LocalChallengeStore; onClose: () => void; onSaved: () => void; onOpenChallenge: (id: string) => void }) {
  const [form, setForm] = useState<ChallengeForm>({ ...emptyForm });
  const [preview, setPreview] = useState<ChallengeInput | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const busy = useRef(false);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const change = (field: keyof ChallengeForm, value: string) => setForm(previous => ({ ...previous, [field]: value }));
  function review() {
    const result = validateForm(form);
    setError(result.error ?? '');
    if (result.value) setPreview(result.value);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  async function save() {
    if (!preview || busy.current) return;
    busy.current = true; setSaving(true); setError('');
    try { const item = await store.save(preview); setSaved(item.id); onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Speichern fehlgeschlagen. Bitte erneut versuchen.'); }
    finally { busy.current = false; setSaving(false); scroll.current?.scrollTo({ y: 0, animated: false }); }
  }
  function field(label: string, name: keyof ChallengeForm, multiline = false, maxLength = 200) {
    return <View style={formStyles.field}>
      <Text style={formStyles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} value={form[name]} onChangeText={value => change(name, value)} multiline={multiline} maxLength={maxLength} style={[formStyles.input, multiline && formStyles.multiline]} keyboardType={name === 'days' ? 'number-pad' : name === 'target' ? 'decimal-pad' : 'default'} placeholderTextColor="#aaa" />
    </View>;
  }
  function choices(label: string, name: keyof ChallengeForm, options: readonly (readonly [string, string])[]) {
    return <View style={formStyles.field}><Text style={formStyles.label}>{label}</Text><View style={formStyles.choices}>{options.map(([value, title]) => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={title} accessibilityState={{ checked: form[name] === value }} onPress={() => change(name, value)} style={[formStyles.choice, form[name] === value && formStyles.selected]}><Text style={formStyles.body}>{title}</Text></Pressable>)}</View></View>;
  }
  return <SafeAreaView style={formStyles.safe}><KeyboardAvoidingView style={formStyles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={formStyles.page}>
      <Pressable accessibilityRole="button" disabled={saving} onPress={onClose} style={formStyles.action}><Text style={formStyles.link}>{saved ? 'Fertig' : 'Abbrechen'}</Text></Pressable>
      <Text accessibilityRole="header" style={formStyles.heading}>{saved ? 'Challenge gespeichert' : preview ? 'Deine Challenge prüfen' : 'Neue Challenge erstellen'}</Text>
      <Text style={formStyles.body}>Wird nur auf diesem Gerät gespeichert. Ohne Login, ohne Veröffentlichung oder Teilen.</Text>
      {saved && <Pressable accessibilityRole="button" onPress={() => onOpenChallenge(saved)} style={formStyles.primary}><Text style={formStyles.primaryText}>Zur Challenge</Text></Pressable>}
      {!!error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
      {preview ? <>
        <Text accessibilityRole="header" style={formStyles.title}>{preview.title}</Text>
        <Text style={formStyles.body}>{preview.durationDays} Tage · {scoringLabel(preview)}</Text>
        <Text style={formStyles.label}>Dein Ziel</Text><Text style={formStyles.body}>{preview.goal}</Text>
        <Text style={formStyles.label}>Regeln</Text>{preview.rules.map((rule, index) => <Text key={index} style={formStyles.body}>{index + 1}. {rule}</Text>)}
        {!saved && <>
          <Pressable accessibilityRole="button" disabled={saving} onPress={() => { setPreview(null); setError(''); }} style={formStyles.action}><Text style={formStyles.link}>Angaben ändern</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving || !store.ready, busy: saving }} disabled={saving || !store.ready} onPress={() => { void save(); }} style={formStyles.primary}><Text style={formStyles.primaryText}>{saving ? 'Wird gespeichert …' : 'Challenge speichern'}</Text></Pressable>
        </>}
      </> : <>
        {field('Titel', 'title', false, 100)}
        {field('Dein Ziel', 'goal', true, 200)}
        {field('Dauer in Tagen', 'days', false, 3)}
        {choices('Wie wird gewertet?', 'type', [['daily_boolean', 'Täglich abhaken'], ['cumulative_metric', 'Werte sammeln'], ['one_time_result', 'Einmaliges Ergebnis']])}
        {form.type !== 'daily_boolean' && <>
          {choices('Einheit', 'unit', units)}
          {form.type === 'one_time_result' && choices('Zielrichtung', 'direction', [['at_least', 'Mindestens'], ['at_most', 'Höchstens'], ['maximize', 'Maximum (Max)'], ['minimize', 'Minimum (Min)']])}
          {form.type === 'one_time_result' && form.direction === 'minimize' ? <Text style={formStyles.body}>Kein fester Zielwert. Dein niedrigster Wert zählt, zum Beispiel die schnellste Zeit in Sekunden. Lege die vollständige Aufgabe und ein eventuelles Zeitlimit in den Regeln fest. Die Dauer in Tagen ist der Teilnahmezeitraum.</Text> : form.type === 'one_time_result' && form.direction === 'maximize' ? <Text style={formStyles.body}>Keine feste Zielanzahl. Dein höchster Wert zählt. Lege das Zeitlimit pro Versuch in den Regeln fest, zum Beispiel 10 Minuten. Die Dauer in Tagen bestimmt, wie lange ihr teilnehmen könnt.</Text> : field('Zielwert', 'target', false, 20)}
        </>}
        {field('Regeln – eine pro Zeile', 'rules', true, 6020)}
        <Pressable accessibilityRole="button" onPress={review} style={formStyles.primary}><Text style={formStyles.primaryText}>Vorschau</Text></Pressable>
      </>}
      {!store.ready && <View><Text style={formStyles.error}>{store.error ? 'Deine gespeicherten Challenges konnten nicht geladen werden. Neue Einträge werden erst gespeichert, wenn der Zugriff wieder funktioniert.' : 'Lokaler Speicher wird geladen …'}</Text>{store.error && <Pressable accessibilityRole="button" onPress={store.reload} style={formStyles.action}><Text style={formStyles.link}>Speicher erneut laden</Text></Pressable>}</View>}
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
export const formStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101112' },
  page: { padding: 20, gap: 16, width: '100%', maxWidth: 640, alignSelf: 'center', paddingBottom: 40 },
  heading: { fontSize: 28, lineHeight: 35, fontWeight: '700', color: '#fff' },
  title: { fontSize: 22, lineHeight: 29, fontWeight: '700', color: '#fff' },
  body: { fontSize: 16, lineHeight: 24, color: '#ccc' },
  label: { fontSize: 16, fontWeight: '600', color: '#fff' },
  field: { gap: 8 },
  input: { backgroundColor: '#202224', color: '#fff', borderColor: '#777', borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 48, fontSize: 16 },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderColor: '#777', borderWidth: 1, padding: 12, borderRadius: 10, minHeight: 48, justifyContent: 'center' },
  selected: { borderColor: '#ff8c00', backgroundColor: '#332516' },
  primary: { minHeight: 52, backgroundColor: '#ff8c00', padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#101112', fontWeight: '700', fontSize: 17 },
  action: { minHeight: 48, justifyContent: 'center' },
  link: { color: '#ff8c00', fontSize: 16, fontWeight: '600' },
  error: { color: '#ffb3a7', fontSize: 16, lineHeight: 24 },
});
