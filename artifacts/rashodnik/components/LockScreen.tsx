import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const colors = useColors();
  return <View style={[styles.container, { backgroundColor: colors.background }]}><View style={[styles.mark, { backgroundColor: colors.primary }]}><Ionicons name="wallet-outline" size={34} color={colors.primaryForeground} /></View><Text style={[styles.title, { color: colors.foreground }]}>Расходник закрыт</Text><Text style={[styles.body, { color: colors.mutedForeground }]}>Финансовая информация защищена</Text><Pressable onPress={onUnlock} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary }, pressed && { opacity: 0.8 }]}><Ionicons name="scan-outline" size={19} color={colors.primaryForeground} /><Text style={{ color: colors.primaryForeground, fontWeight: '700' }}>Разблокировать с помощью Face ID</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  mark: { width: 76, height: 76, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 25, fontWeight: '700', letterSpacing: -0.5 },
  body: { fontSize: 15, marginTop: 10, marginBottom: 28 },
  button: { minHeight: 52, borderRadius: 17, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
});