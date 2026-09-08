import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, ChoiceRow, EmptyState, Header, IconButton, Input, PrimaryButton, Screen, Sheet, TransactionRow } from '@/components/FinanceUI';
import { formatDateLong, useFinance } from '@/store/FinanceContext';
import { TransactionType } from '@/types/finance';
import { useColors } from '@/hooks/useColors';

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, deleteTransaction, updateTransaction } = useFinance();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | TransactionType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const filtered = useMemo(() => data.transactions.filter((item) => {
    const haystack = `${item.note ?? ''} ${item.category ?? ''} ${item.subcategory ?? ''} ${item.source ?? ''}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (filter === 'all' || item.type === filter);
  }).sort((a, b) => +new Date(b.date) - +new Date(a.date)), [data.transactions, query, filter]);
  const groups = useMemo(() => filtered.reduce<Record<string, typeof filtered>>((acc, item) => { const key = formatDateLong(item.date); (acc[key] ??= []).push(item); return acc; }, {}), [filtered]);
  const editing = data.transactions.find((item) => item.id === editingId);
  return <Screen><ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}><Header eyebrow="Все движения" title="История" right={<IconButton icon="filter" onPress={() => Alert.alert('Фильтр', 'Используйте быстрые фильтры под поиском.')} accessibilityLabel="Фильтр истории" />} /><View style={styles.body}><View style={[styles.search, { backgroundColor: colors.input }]}><Ionicons name="search" size={18} color={colors.mutedForeground} /><TextInput value={query} onChangeText={setQuery} placeholder="Поиск операций" placeholderTextColor={colors.mutedForeground} style={{ flex: 1, color: colors.foreground, fontSize: 15 }} /></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>{[['all', 'Все'], ['income', 'Доходы'], ['expense', 'Расходы'], ['transfer', 'Переводы'], ['debt', 'Долги']].map(([value, label]) => <Pressable key={value} onPress={() => setFilter(value as typeof filter)} style={[styles.filter, { backgroundColor: filter === value ? colors.primary : colors.input }]}><Text style={{ color: filter === value ? colors.primaryForeground : colors.foreground, fontSize: 13, fontWeight: '600' }}>{label}</Text></Pressable>)}</ScrollView>{Object.entries(groups).map(([date, items]) => <View key={date}><Text style={[styles.date, { color: colors.mutedForeground }]}>{date}</Text><Card style={{ paddingHorizontal: 14, marginBottom: 16 }}>{items.map((item) => <TransactionRow key={item.id} transaction={item} accountName={data.accounts.find((account) => account.id === item.accountId)?.name ?? ''} onPress={() => setEditingId(item.id)} onDelete={() => Alert.alert('Удалить операцию?', 'Баланс будет пересчитан автоматически.', [{ text: 'Отмена', style: 'cancel' }, { text: 'Удалить', style: 'destructive', onPress: () => deleteTransaction(item.id) }])} />)}</Card></View>)}{!filtered.length ? <Card><EmptyState icon="receipt-outline" title="Операций не найдено" body="Попробуйте изменить запрос или добавьте первую операцию на главном экране." /></Card> : null}</View></ScrollView>{editing ? <EditTransactionSheet key={editing.id} transaction={editing} onClose={() => setEditingId(null)} onSave={(input) => { updateTransaction(editing.id, input); setEditingId(null); }} /> : null}</Screen>;
}

function EditTransactionSheet({ transaction, onClose, onSave }: { transaction: NonNullable<ReturnType<typeof useFinance>['data']['transactions']>[number]; onClose: () => void; onSave: (input: Partial<Omit<NonNullable<ReturnType<typeof useFinance>['data']['transactions']>[number], 'id'>>) => void }) {
  const colors = useColors();
  const { data } = useFinance();
  const [amount, setAmount] = useState(String(transaction.amount));
  const [note, setNote] = useState(transaction.note ?? '');
  const [source, setSource] = useState(transaction.source ?? '');
  const [category, setCategory] = useState(transaction.category ?? data.categories[0]?.name ?? 'Другое');
  const [subcategory, setSubcategory] = useState(transaction.subcategory ?? 'Другое');
  const [accountId, setAccountId] = useState(transaction.accountId);
  const [toAccountId, setToAccountId] = useState(transaction.toAccountId ?? data.accounts[0]?.id ?? '');
  const save = () => {
    const value = Number(amount.replace(',', '.'));
    if (!value || value <= 0) return Alert.alert('Проверьте сумму', 'Введите сумму больше нуля.');
    if (transaction.type === 'debt') return onSave({ amount: value, accountId, note });
    if (transaction.type === 'transfer' && accountId === toAccountId) return Alert.alert('Нельзя перевести', 'Выберите два разных счёта.');
    onSave(transaction.type === 'income' ? { amount: value, accountId, source, note } : transaction.type === 'expense' ? { amount: value, accountId, category, subcategory, note } : { amount: value, accountId, toAccountId, note });
  };
  return <Sheet visible title="Изменить операцию" onClose={onClose}><ScrollView keyboardShouldPersistTaps="handled"><Input label="Сумма, сомони" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />{transaction.type === 'debt' ? <Text style={[styles.editHint, { color: colors.mutedForeground }]}>Платёж по долгу. После сохранения остаток долга и история платежей будут пересчитаны.</Text> : null}{transaction.type === 'income' ? <Input label="Источник" value={source} onChangeText={setSource} /> : null}{transaction.type === 'expense' ? <><ChoiceRow label="Категория" value={category} options={data.categories.map((item) => ({ label: item.name, value: item.name }))} onChange={(value) => { setCategory(value); setSubcategory(data.categories.find((item) => item.name === value)?.items[0] ?? 'Другое'); }} /><ChoiceRow label="Подкатегория" value={subcategory} options={(data.categories.find((item) => item.name === category)?.items ?? ['Другое']).map((item) => ({ label: item, value: item }))} onChange={setSubcategory} /></> : null}<ChoiceRow label="Счёт" value={accountId} options={data.accounts.map((item) => ({ label: item.name, value: item.id }))} onChange={setAccountId} />{transaction.type === 'transfer' ? <ChoiceRow label="На счёт" value={toAccountId} options={data.accounts.map((item) => ({ label: item.name, value: item.id }))} onChange={setToAccountId} /> : null}<Input label="Комментарий" value={note} onChangeText={setNote} multiline /><PrimaryButton title="Сохранить изменения" onPress={save} icon="checkmark" /></ScrollView></Sheet>;
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20 },
  search: { minHeight: 48, borderRadius: 15, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  filterRow: { gap: 8, paddingBottom: 22 },
  filter: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 13 },
  date: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 3 },
  editHint: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
});