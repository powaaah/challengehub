import { CreateChallengeForm } from './CreateChallengeForm';
import type { LocalChallengeStore } from './useLocalChallenges';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CreateChallengeButton({ store, onSaved }: { store: LocalChallengeStore; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Neue Challenge erstellen" onPress={() => setOpen(true)} style={({ pressed }) => [styles.button, { bottom: insets.bottom + 20, right: insets.right + 20 }, pressed && styles.pressed]}>
      <View accessible={false} style={styles.horizontal} />
      <View accessible={false} style={styles.vertical} />
    </Pressable>
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      {open && <CreateChallengeForm store={store} onClose={() => setOpen(false)} onSaved={onSaved} />}
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  button: { position: 'absolute', width: 72, height: 72, borderRadius: 36, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', elevation: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' },
  pressed: { backgroundColor: '#e5e5e5' },
  horizontal: { position: 'absolute', width: 28, height: 4, borderRadius: 2, backgroundColor: '#000000' },
  vertical: { position: 'absolute', width: 4, height: 28, borderRadius: 2, backgroundColor: '#000000' },
});
