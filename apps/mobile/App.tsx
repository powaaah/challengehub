import { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const modes = [
  { id: 'duel', title: '1 vs 1', subtitle: 'Fordere jemanden heraus.', description: 'Ein Gegner. Eine Challenge. Euer Duell.', detail: 'Private Duelle für zwei bestätigte Konten kommen als Nächstes. Hier kannst du später eine Challenge auswählen und deinen Gegner einladen.' },
  { id: 'group', title: 'Gruppe', subtitle: 'Mit deinen Leuten.', description: 'Deine Leute. Eure Challenge.', detail: 'Private Gruppen-Challenges für 3 bis 20 Personen kommen als Nächstes. Einladungen, gemeinsame Fortschritte und Ergebnisse bleiben in eurer Gruppe.' },
  { id: 'global', title: 'Global', subtitle: 'Miss dich mit den Besten der Welt.', description: 'Wie weit kommst du?', detail: 'Hier findest du künftig die öffentlichen Challenges und Rankings. Deine privaten Battle-Ergebnisse bleiben davon getrennt.' },
] as const;
type Mode = typeof modes[number];

export default function App() {
  const [selected, setSelected] = useState<Mode | null>(null);
  useEffect(() => {
    if (!selected) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelected(null);
      return true;
    });
    return () => subscription.remove();
  }, [selected]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.page}>
          <Text style={styles.brand}>CHALLENGEHUB</Text>
          {selected ? (
            <View key={selected.id} style={styles.destination}>
              <Pressable accessibilityRole="button" accessibilityLabel="Zurück zur Startseite" onPress={() => setSelected(null)} style={styles.back}>
                <Text style={styles.backText}>← Zurück</Text>
              </Pressable>
              <Text accessibilityRole="header" style={styles.heading}>{selected.title}</Text>
              <Text style={styles.intro}>{selected.description}</Text>
              <View style={styles.notice}>
                <Text style={styles.label}>BALD VERFÜGBAR</Text>
                <Text style={styles.body}>{selected.detail}</Text>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.eyebrow}>DEINE NÄCHSTE HERAUSFORDERUNG</Text>
              <Text accessibilityRole="header" style={styles.heading}>Zeig, was in dir steckt.</Text>
              <Text style={styles.intro}>Wähle, wie du dich messen willst.</Text>
              <View style={styles.tiles} testID="start-tiles">
                {modes.map(mode => (
                  <View key={mode.id} style={styles.tileColumn}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`${mode.title}. ${mode.subtitle}`} accessibilityHint="Öffnet den Einstieg für diesen Modus" onPress={() => setSelected(mode)} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
                    <Text style={styles.tileTitle}>{mode.title}</Text>
                    <Text style={styles.subtitle}>{mode.subtitle}</Text>
                  </Pressable>
                  </View>
                ))}
              </View>
              <Text style={styles.footer}>Deine Challenge. Dein nächster Schritt.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101112' },
  page: { paddingHorizontal: 16, paddingVertical: 24, width: '100%', maxWidth: 760, alignSelf: 'center', flexGrow: 1 },
  brand: { color: '#ff8c00', fontWeight: '800', fontSize: 19, letterSpacing: 2, marginBottom: 48 },
  eyebrow: { color: '#bbbbbb', fontSize: 12, letterSpacing: 1, marginBottom: 16 },
  heading: { color: '#ffffff', fontWeight: '700', fontSize: 36, lineHeight: 43 },
  intro: { color: '#cccccc', fontSize: 17, lineHeight: 26, marginTop: 16, marginBottom: 32 },
  tiles: { flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  tileColumn: { flex: 1, minWidth: 0 },
  tile: { width: '100%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 16, padding: 4, backgroundColor: '#202224', borderWidth: 1, borderColor: '#494b4d' },
  pressed: { backgroundColor: '#34302a', borderColor: '#ff8c00' },
  tileTitle: { color: '#ffffff', fontWeight: '700', fontSize: 16, lineHeight: 18, textAlign: 'center' },
  subtitle: { color: '#cccccc', fontSize: 12, lineHeight: 14, marginTop: 4, textAlign: 'center', alignSelf: 'stretch' },
  footer: { color: '#aaaaaa', fontSize: 14, lineHeight: 22, marginTop: 32 },
  destination: { gap: 12 },
  back: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start', paddingRight: 20 },
  backText: { color: '#ff8c00', fontSize: 17 },
  notice: { padding: 20, borderRadius: 16, backgroundColor: '#202224', gap: 12 },
  label: { color: '#ff8c00', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  body: { color: '#cccccc', fontSize: 17, lineHeight: 27 },
});
