import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CreateChallengeButton() {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Neue Challenge erstellen" onPress={() => setOpen(true)} style={({ pressed }) => [styles.button, { bottom: insets.bottom + 20, right: insets.right + 20 }, pressed && styles.pressed]}>
      <View accessible={false} style={styles.horizontal} />
      <View accessible={false} style={styles.vertical} />
    </Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.dialog}>
          <Text accessibilityRole="header" style={styles.title}>Neue Challenge erstellen</Text>
          <Text style={styles.body}>Hier kannst du künftig deine eigene Challenge anlegen. Die Erstellung wird als Nächstes ergänzt – ohne Login.</Text>
          <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={styles.close}><Text style={styles.closeText}>Schließen</Text></Pressable>
        </View>
      </View>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  button: { position: 'absolute', width: 72, height: 72, borderRadius: 36, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', elevation: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' },
  pressed: { backgroundColor: '#e5e5e5' },
  horizontal: { position: 'absolute', width: 28, height: 4, borderRadius: 2, backgroundColor: '#000000' },
  vertical: { position: 'absolute', width: 4, height: 28, borderRadius: 2, backgroundColor: '#000000' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 440, alignSelf: 'center', padding: 24, borderRadius: 20, backgroundColor: '#202224', gap: 16 },
  title: { color: '#fff', fontSize: 23, fontWeight: '700' },
  body: { color: '#ccc', fontSize: 16, lineHeight: 25 },
  close: { minHeight: 48, justifyContent: 'center', alignItems: 'flex-end' },
  closeText: { color: '#ff8c00', fontSize: 17, fontWeight: '600' },
});
