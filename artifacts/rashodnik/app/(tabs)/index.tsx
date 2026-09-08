import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, ChoiceRow, Header, Input, Money, PrimaryButton, QuickAction, SectionTitle, Screen, Sheet, TransactionRow } from '@/components/FinanceUI';
import { formatMoney, useFinance } from '@/store/FinanceContext';
import { DebtDirection, TransactionType } from '@/types/finance';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, ready, accountsWithBalance, totalBalance, incomeTotal, expenseTotal, addTransaction } = useFinance();
  const [sheet, setSheet] = useState<TransactionType | null>(null);
  const recent = useMemo(() => [...data.transactions].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 4), [data.transactions]);
  if (!ready) return <Screen><View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: colors.mutedForeground }}>Загрузка данных…</Text></View></Screen>;
  return <Screen><ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 112 }} showsVerticalScrollIndicator={false}><Header eyebrow="Вторник, 8 сентября" title="Добрый день" right={<View style={[styles.avatar, { backgroundColor: colors.secondary }]}><Text style={{ color: colors.primary, fontWeight: '700' }}>Р</Text></View>} /><View style={{ paddingHorizontal: 20 }}><Card style={{ backgroundColor: colors.primary, borderColor: colors.primary, padding: 22, marginBottom: 22 }}><View style={styles.balanceTop}><Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, fontWeight: '600' }}>ОБЩИЙ БАЛАНС</Text><Ionicons name="ellipsis-horizontal" size={21} color="rgba(255,255,255,0.72)" /></View><Money value={totalBalance} large color={colors.primaryForeground} /><Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, marginTop: 6 }}>по всем счетам</Text><View style={styles.balanceMetrics}><View><Text style={styles.metricLabel}>Доходы</Text><Text style={styles.metricValue}>+{formatMoney(incomeTotal)}</Text></View><View><Text style={styles.metricLabel}>Расходы</Text><Text style={styles.metricValue}>−{formatMoney(expenseTotal)}</Text></View></View></Card><SectionTitle title="Быстрые действия" /><View style={styles.actions}><QuickAction icon="arrow-up" label="Потратил деньги" tint={colors.softGold} onPress={() => setSheet('expense')} /><QuickAction icon="arrow-down" label="Получил деньги" tint={colors.secondary} onPress={() => setSheet('income')} /><QuickAction icon="swap-horizontal" label="Перевод" tint={`${colors.navy}28`} onPress={() => setSheet('transfer')} /><QuickAction icon="people-outline" label="Долг" tint="#F3DEEA" onPress={() => setSheet('debt')} /></View><SectionTitle title="Счета" action="Все" onAction={() => Alert.alert('Счета', accountsWithBalance.map((item) => `${item.name}: ${formatMoney(item.balance)}`).join('\n'))} /><View style={styles.accountGrid}>{accountsWithBalance.map((account) => <Card key={account.id} style={styles.accountCard}><View style={[styles.accountDot, { backgroundColor: account.color }]} /><Text numberOfLines={1} style={[styles.accountName, { color: colors.foreground }]}>{account.name}</Text><Money value={account.balance} /></Card>)}</View><SectionTitle title="Последние операции" /><Card style={{ paddingHorizontal: 14 }}>{recent.length ? recent.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} accountName={data.accounts.find((item) => item.id === transaction.accountId)?.name ?? ''} />) : <Text style={{ color: colors.mutedForeground, padding: 16 }}>Пока нет операций</Text>}</Card></View></ScrollView><TransactionSheet visible={sheet !== null} type={sheet ?? 'expense'} onClose={() => setSheet(null)} onSave={(input) => { addTransaction(input); setSheet(null); }} /></Screen>;
}

function TransactionSheet({ visible, type, onClose, onSave }: { visible: boolean; type: TransactionType; onClose: () => void; onSave: (input: any) => void }) {
  const { data, addDebt } = useFinance();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState(data.categories[0]?.name ?? 'Другое');
  const [subcategory, setSubcategory] = useState(data.categories[0]?.items[0] ?? 'Другое');
  const [source, setSource] = useState('Зарплата');
  const [person, setPerson] = useState('');
  const [direction, setDirection] = useState<DebtDirection>('receivable');
  const [accountId, setAccountId] = useState(data.accounts[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState(data.accounts[1]?.id ?? data.accounts[0]?.id ?? '');
  const title = type === 'income' ? 'Получил деньги' : type === 'expense' ? 'Новая трата' : type === 'transfer' ? 'Перевод между счетами' : 'Новый долг';
  const save = () => {
    const value = Number(amount.replace(',', '.'));
    if (type === 'debt') {
      if (!person.trim() || !value || value <= 0) return Alert.alert('Заполните данные', 'Укажите человека и сумму больше нуля.');
      addDebt({ person: person.trim(), amount: value, note, direction });
      onClose();
      return;
    }
    if (!value || value <= 0) return Alert.alert('Проверьте сумму', 'Введите сумму больше нуля.');
    if (type === 'transfer' && accountId === toAccountId) return Alert.alert('Нельзя перевести', 'Выберите два разных счёта.');
    onSave(type === 'income' ? { type, amount: value, source, accountId, note } : type === 'expense' ? { type, amount: value, category, subcategory, accountId, note } : { type, amount: value, accountId, toAccountId, note });
  };
  return <Sheet visible={visible} title={title} onClose={onClose}><ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"><Input label={type === 'debt' ? 'Сумма долга, сомони' : 'Сумма, сомони'} value={amount} onChangeText={setAmount} placeholder="0" keyboardType="decimal-pad" />{type === 'debt' ? <><ChoiceRow label="Направление" value={direction} options={[{ label: 'Мне должны', value: 'receivable' }, { label: 'Я должен', value: 'payable' }]} onChange={(value) => setDirection(value as DebtDirection)} /><Input label="Кто?" value={person} onChangeText={setPerson} placeholder="Имя человека" /></> : null}{type === 'income' ? <Input label="Источник" value={source} onChangeText={setSource} placeholder="Например, зарплата" /> : null}{type === 'expense' ? <><ChoiceRow label="Категория" value={category} options={data.categories.slice(0, 4).map((item) => ({ label: item.name, value: item.name }))} onChange={(value) => { setCategory(value); setSubcategory(data.categories.find((item) => item.name === value)?.items[0] ?? 'Другое'); }} /><ChoiceRow label="Подкатегория" value={subcategory} options={(data.categories.find((item) => item.name === category)?.items ?? ['Другое']).slice(0, 4).map((item) => ({ label: item, value: item }))} onChange={setSubcategory} /></> : null}{type !== 'debt' ? <ChoiceRow label="Счёт" value={accountId} options={data.accounts.map((item) => ({ label: item.name, value: item.id }))} onChange={setAccountId} /> : null}{type === 'transfer' ? <ChoiceRow label="На счёт" value={toAccountId} options={data.accounts.map((item) => ({ label: item.name, value: item.id }))} onChange={setToAccountId} /> : null}<Input label="Комментарий" value={note} onChangeText={setNote} placeholder="Необязательно" multiline /><PrimaryButton title={type === 'debt' ? 'Сохранить долг' : 'Сохранить операцию'} onPress={save} icon="checkmark" /></ScrollView></Sheet>;
}

const styles = StyleSheet.create({
  avatar: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metricLabel: { color: 'rgba(255,255,255,0.64)', fontSize: 11, marginBottom: 4 },
  metricValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  balanceMetrics: { flexDirection: 'row', gap: 34, marginTop: 23 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  accountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  accountCard: { width: '48%', minHeight: 92, padding: 14 },
  accountDot: { width: 9, height: 9, borderRadius: 5, marginBottom: 10 },
  accountName: { fontSize: 13, fontWeight: '600', marginBottom: 7 },
});
