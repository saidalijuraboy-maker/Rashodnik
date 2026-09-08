import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatShortMoney, typeLabel } from '@/store/FinanceContext';
import { Transaction, TransactionType } from '@/types/finance';

export function Screen({ children, onRefresh }: { children: ReactNode; onRefresh?: () => void }) {
  const colors = useColors();
  return <View style={[styles.screen, { backgroundColor: colors.background }]}>{children}</View>;
}

export function Header({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: ReactNode }) {
  const colors = useColors();
  return <View style={styles.header}><View style={styles.headerText}>{eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow.toUpperCase()}</Text> : null}<Text style={[styles.title, { color: colors.foreground }]}>{title}</Text></View>{right}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  const colors = useColors();
  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>;
}

export function Money({ value, large = false, color }: { value: number; large?: boolean; color?: string }) {
  const colors = useColors();
  return <Text style={[large ? styles.moneyLarge : styles.money, { color: color ?? colors.foreground }]}>{formatShortMoney(value)}</Text>;
}

export function IconButton({ icon, onPress, color, accessibilityLabel, filled = false }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; color?: string; accessibilityLabel: string; filled?: boolean }) {
  const colors = useColors();
  return <Pressable testID={accessibilityLabel} accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [styles.iconButton, filled && { backgroundColor: colors.primary }, pressed && styles.pressed]}><Ionicons name={icon} size={20} color={color ?? (filled ? colors.primaryForeground : colors.foreground)} /></Pressable>;
}

export function QuickAction({ icon, label, tint, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; tint: string; onPress: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}><View style={[styles.quickIcon, { backgroundColor: tint }]}><Ionicons name={icon} size={21} color={colors.foreground} /></View><Text style={[styles.quickLabel, { color: colors.foreground }]}>{label}</Text></Pressable>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={styles.sectionTitle}><Text style={[styles.sectionHeading, { color: colors.foreground }]}>{title}</Text>{action && onAction ? <Pressable onPress={onAction}><Text style={[styles.link, { color: colors.primary }]}>{action}</Text></Pressable> : null}</View>;
}

export function TransactionRow({ transaction, accountName, onPress, onDelete }: { transaction: Transaction; accountName: string; onPress?: () => void; onDelete?: () => void }) {
  const colors = useColors();
  const isIncome = transaction.type === 'income' || (transaction.type === 'debt' && transaction.debtDirection === 'receivable');
  const icon = transaction.type === 'transfer' ? 'swap-horizontal' : transaction.type === 'debt' ? 'people-outline' : transaction.type === 'income' ? 'arrow-down' : 'arrow-up';
  const iconColor = transaction.type === 'transfer' ? colors.navy : isIncome ? colors.income : colors.expense;
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.transaction, pressed && styles.pressed]}><View style={[styles.transactionIcon, { backgroundColor: `${iconColor}1A` }]}><Ionicons name={icon} size={17} color={iconColor} /></View><View style={styles.transactionInfo}><Text numberOfLines={1} style={[styles.transactionTitle, { color: colors.foreground }]}>{transaction.note || transaction.source || transaction.subcategory || typeLabel(transaction.type)}</Text><Text style={[styles.transactionMeta, { color: colors.mutedForeground }]}>{transaction.category ? `${transaction.category} · ` : ''}{accountName}</Text></View><View style={styles.transactionAmount}><Text style={[styles.amountText, { color: transaction.type === 'transfer' ? colors.foreground : iconColor }]}>{isIncome ? '+' : transaction.type === 'transfer' ? '' : '−'}{formatShortMoney(transaction.amount)}</Text>{onDelete ? <Pressable onPress={onDelete} hitSlop={10}><Ionicons name="ellipsis-horizontal" size={17} color={colors.mutedForeground} /></Pressable> : null}</View></Pressable>;
}

export function EmptyState({ icon = 'sparkles-outline', title, body }: { icon?: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  const colors = useColors();
  return <View style={styles.empty}><Ionicons name={icon} size={32} color={colors.primary} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>{body}</Text></View>;
}

export function PrimaryButton({ title, onPress, disabled = false, icon }: { title: string; onPress: () => void; disabled?: boolean; icon?: keyof typeof Ionicons.glyphMap }) {
  const colors = useColors();
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, disabled && { opacity: 0.45 }, pressed && styles.pressed]}>{icon ? <Ionicons name={icon} size={18} color={colors.primaryForeground} /> : null}<Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>{title}</Text></Pressable>;
}

export function Input({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: 'default' | 'numeric' | 'decimal-pad'; multiline?: boolean }) {
  const colors = useColors();
  return <View style={styles.inputGroup}><Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} keyboardType={keyboardType} multiline={multiline} style={[styles.input, { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border }, multiline && styles.multiline]} /></View>;
}

export function ChoiceRow({ label, value, options, onChange }: { label: string; value: string; options: { label: string; value: string }[]; onChange: (value: string) => void }) {
  const colors = useColors();
  return <View style={styles.inputGroup}><Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{label}</Text><View style={styles.choiceRow}>{options.map((option) => <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.choice, { backgroundColor: value === option.value ? colors.primary : colors.input }]}><Text style={{ color: value === option.value ? colors.primaryForeground : colors.foreground, fontWeight: '600' }}>{option.label}</Text></Pressable>)}</View></View>;
}

export function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const colors = useColors();
  return <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={[styles.sheet, { backgroundColor: colors.background }]}><View style={styles.sheetHandle} /><View style={styles.sheetHeader}><Text style={[styles.sheetTitle, { color: colors.foreground }]}>{title}</Text><IconButton icon="close" onPress={onClose} accessibilityLabel="Закрыть" /></View>{children}</View></View></Modal>;
}

export function Loading() {
  const colors = useColors();
  return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  headerText: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.7 },
  card: { borderRadius: 24, borderWidth: 1, padding: 18 },
  moneyLarge: { fontSize: 38, fontWeight: '700', letterSpacing: -1.2 },
  money: { fontSize: 16, fontWeight: '700' },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  quickAction: { alignItems: 'center', width: 78, gap: 8 },
  quickIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 15 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11, marginTop: 5 },
  sectionHeading: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  link: { fontSize: 13, fontWeight: '700' },
  transaction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 11 },
  transactionIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  transactionInfo: { flex: 1, minWidth: 0 },
  transactionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  transactionMeta: { fontSize: 12 },
  transactionAmount: { alignItems: 'flex-end', gap: 4 },
  amountText: { fontSize: 14, fontWeight: '700' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 38, paddingHorizontal: 28, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 5 },
  emptyBody: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  primaryButton: { minHeight: 52, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  primaryButtonText: { fontSize: 15, fontWeight: '700' },
  inputGroup: { gap: 7, marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginLeft: 2 },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontSize: 16 },
  multiline: { minHeight: 84, paddingTop: 14, textAlignVertical: 'top' },
  choiceRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  choice: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.32)' },
  sheet: { maxHeight: '92%', minHeight: '44%', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: 24 },
  sheetHandle: { width: 38, height: 5, borderRadius: 3, backgroundColor: '#A7B0A9', alignSelf: 'center', marginTop: 10, marginBottom: 6 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sheetTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export const uiStyles = styles;