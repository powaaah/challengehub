import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { createCatalogClient, type CatalogChallenge } from './catalog-client';

type Props = { onSelect: (challenge: CatalogChallenge) => void };

export function Catalog({ onSelect }: Props) {
  const [items, setItems] = useState<CatalogChallenge[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [request, setRequest] = useState<{ cursor?: string; attempt: number }>({ attempt: 0 });
  const inFlight = useRef(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    inFlight.current = true;
    (async () => {
      try {
        const page = await createCatalogClient().list({ limit: 10, cursor: request.cursor, signal: controller.signal });
        if (!active) return;
        setItems(previous => {
          const combined = request.cursor ? [...previous, ...page.data] : page.data;
          return [...new Map(combined.map(item => [item.slug, item])).values()];
        });
        setCursor(page.pagination.nextCursor === request.cursor ? null : page.pagination.nextCursor);
      } catch {
        if (active) setError(true);
      } finally {
        clearTimeout(timeout);
        if (active) {
          inFlight.current = false;
          setLoading(false);
        }
      }
    })();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [request]);

  function load(nextCursor?: string) {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(false);
    setRequest(previous => ({ cursor: nextCursor, attempt: previous.attempt + 1 }));
  }

  return (
    <View style={styles.list}>
      <Text accessibilityRole="header" style={styles.section}>Wähle deine Challenge</Text>
      {items.map(item => (
        <Pressable key={item.slug} accessibilityRole="button" accessibilityLabel={`${item.title} ansehen`} onPress={() => onSelect(item)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <Text style={styles.meta}>{item.durationLabel}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.goal}</Text>
          <Text style={styles.link}>Regeln ansehen →</Text>
        </Pressable>
      ))}
      {loading && <View accessible accessibilityRole="progressbar" accessibilityLabel="Challenges werden geladen"><ActivityIndicator color="#ff8c00" /><Text style={styles.body}>Challenges werden geladen …</Text></View>}
      {error && <View accessibilityLiveRegion="polite" style={styles.card}>
        <Text style={styles.body}>Der Katalog konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.</Text>
        <Pressable accessibilityRole="button" onPress={() => load(request.cursor)} style={styles.button}><Text style={styles.link}>Erneut versuchen</Text></Pressable>
      </View>}
      {!loading && !error && items.length === 0 && <Text style={styles.body}>Aktuell sind keine Challenges verfügbar.</Text>}
      {!loading && !error && cursor && <Pressable accessibilityRole="button" onPress={() => load(cursor)} style={styles.button}><Text style={styles.link}>Weitere Challenges laden</Text></Pressable>}
    </View>
  );
}

export function ChallengeDetails({ challenge, mode }: { challenge: CatalogChallenge; mode: string }) {
  return <View style={styles.list}>
    <Text style={styles.meta}>{mode} · {challenge.durationLabel}</Text>
    <Text accessibilityRole="header" style={styles.detailTitle}>{challenge.title}</Text>
    <Text style={styles.body}>{challenge.description}</Text>
    <Text accessibilityRole="header" style={styles.section}>Dein Ziel</Text>
    <Text style={styles.body}>{challenge.goal}</Text>
    <Text accessibilityRole="header" style={styles.section}>Die Regeln</Text>
    {challenge.rules.map((rule, index) => <Text key={index} style={styles.body}>{index + 1}. {rule}</Text>)}
    {challenge.tips.length > 0 && <Text accessibilityRole="header" style={styles.section}>Tipps für dich</Text>}
    {challenge.tips.map((tip, index) => <Text key={index} style={styles.body}>• {tip}</Text>)}
    <View style={styles.card}><Text style={styles.body}>{mode === 'Global' ? 'Die öffentlichen Rankings und die Teilnahme folgen als Nächstes.' : 'Deine Challenge ist ausgewählt. Das Erstellen und Einladen als Gast folgt als Nächstes.'}</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  list: { gap: 16 },
  card: { padding: 18, gap: 10, backgroundColor: '#202224', borderRadius: 16, borderWidth: 1, borderColor: '#494b4d' },
  pressed: { borderColor: '#ff8c00' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 27 },
  detailTitle: { color: '#fff', fontSize: 28, fontWeight: '700', lineHeight: 35 },
  section: { color: '#fff', fontSize: 21, fontWeight: '700', marginTop: 8 },
  meta: { color: '#ff8c00', fontSize: 14 },
  body: { color: '#ccc', fontSize: 16, lineHeight: 25 },
  link: { color: '#ff8c00', fontSize: 16, fontWeight: '600' },
  button: { minHeight: 48, justifyContent: 'center', paddingVertical: 12 },
});
