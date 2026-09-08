import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, EmptyState, Header, IconButton, Screen, TransactionRow } from '@/components/FinanceUI';
import { formatDateLong, useFinance } from '@/store/FinanceContext';
import { TransactionType } from '@/types/finance';
import { useColors } from '@/hooks/useColors';

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, deleteTransaction } = useFinance();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | TransactionType>('all');
  const filtered = useMemo(() => data.transactions.filter((item) => {
    const haystack = `${item.note ?? ''} ${item.category ?? ''} ${item.subcategory ?? ''} ${item.source ?? ''}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (filter === 'all' || item.type === filter);
  }).sort((a, b) => +new Date(b.date) - +new Date(a.date)), [data.transactions, query, filter]);
  const groups = useMemo(() => filtered.reduce<Record<string, typeof filtered>>((acc, item) => { const key = formatDateLong(item.date); (acc[key] ??= []).push(item); return acc; }, {}), [filtered]);
  return <Screen><ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}><Header eyebrow="Все движения" title="История" right={<IconButton icon="filter" onPress={() => Alert.alert('Фильтр', 'Используйте быстрые фильтры под поиском.')} accessibilityLabel="Фильтр истории" />} /><View style={styles.body}><View style={[styles.search, { backgroundColor: colors.input }]}><Ionicons name="search" size={18} color={colors.mutedForeground} /><TextInput value={query} onChangeText={setQuery} placeholder="Поиск операций" placeholderTextColor={colors.mutedForeground} style={{ flex: 1, color: colors.foreground, fontSize: 15 }} /></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>{[['all', 'Все'], ['income', 'Доходы'], ['expense', 'Расходы'], ['transfer', 'Переводы'], ['debt', 'Долги']].map(([value, label]) => <Pressable key={value} onPress={() => setFilter(value as typeof filter)} style={[styles.filter, { backgroundColor: filter === value ? colors.primary : colors.input }]}><Text style={{ color: filter === value ? colors.primaryForeground : colors.foreground, fontSize: 13, fontWeight: '600' }}>{label}</Text></Pressable>)}</ScrollView>{Object.entries(groups).map(([date, items]) => <View key={date}><Text style={[styles.date, { color: colors.mutedForeground }]}>{date}</Text><Card style={{ paddingHorizontal: 14, marginBottom: 16 }}>{items.map((item) => <TransactionRow key={item.id} transaction={item} accountName={data.accounts.find((account) => account.id === item.accountId)?.name ?? ''} onDelete={() => Alert.alert('Удалить операцию?', 'Баланс будет пересчитан автоматически.', [{ text: 'Отмена', style: 'cancel' }, { text: 'Удалить', style: 'destructive', onPress: () => deleteTransaction(item.id) }])} />)}</Card></View>)}{!filtered.length ? <Card><EmptyState icon="receipt-outline" title="Операций не найдено" body="Попробуйте изменить запрос или добавьте первую операцию на главном экране." /></Card> : null}</View></ScrollView></Screen>;
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20 },
  search: { minHeight: 48, borderRadius: 15, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  filterRow: { gap: 8, paddingBottom: 22 },
  filter: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 13 },
  date: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 3 },
});