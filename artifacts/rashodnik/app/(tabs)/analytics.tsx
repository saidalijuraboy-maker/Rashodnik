import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Header, SectionTitle, Screen } from '@/components/FinanceUI';
import { formatShortMoney, useFinance } from '@/store/FinanceContext';
import { useColors } from '@/hooks/useColors';

const periods = ['Неделя', 'Месяц', 'Год', 'Всё время'];

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, incomeTotal, expenseTotal, totalBalance, accountsWithBalance } = useFinance();
  const [period, setPeriod] = useState('Месяц');
  const now = Date.now();
  const periodDays = period === 'Неделя' ? 7 : period === 'Месяц' ? 31 : period === 'Год' ? 365 : 36500;
  const scoped = data.transactions.filter((item) => now - +new Date(item.date) < periodDays * 24 * 60 * 60 * 1000);
  const categoryStats = useMemo(() => { const map: Record<string, number> = {}; scoped.filter((item) => item.type === 'expense').forEach((item) => { const key = item.category ?? 'Другое'; map[key] = (map[key] ?? 0) + item.amount; }); return Object.entries(map).sort((a, b) => b[1] - a[1]); }, [scoped]);
  const maxCategory = categoryStats[0]?.[1] ?? 1;
  return <Screen><ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}><Header eyebrow="Ваши деньги" title="Аналитика" /><View style={styles.body}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periods}>{periods.map((item) => <Text key={item} onPress={() => setPeriod(item)} style={[styles.period, { backgroundColor: period === item ? colors.primary : colors.input, color: period === item ? colors.primaryForeground : colors.foreground }]}>{item}</Text>)}</ScrollView><Card style={{ backgroundColor: colors.navy, borderColor: colors.navy, marginBottom: 18 }}><View style={styles.chartHeader}><View><Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Изменение баланса</Text><Text style={{ color: '#FFFFFF', fontSize: 29, fontWeight: '700', marginTop: 6 }}>{formatShortMoney(incomeTotal - expenseTotal)}</Text></View><Ionicons name="trending-up" size={24} color="#FFFFFF" /></View><View style={styles.chart}><View style={[styles.chartBar, { height: 34, backgroundColor: '#91CBB2' }]} /><View style={[styles.chartBar, { height: 57, backgroundColor: '#91CBB2' }]} /><View style={[styles.chartBar, { height: 44, backgroundColor: '#91CBB2' }]} /><View style={[styles.chartBar, { height: 75, backgroundColor: '#F4C96B' }]} /><View style={[styles.chartBar, { height: 65, backgroundColor: '#91CBB2' }]} /><View style={[styles.chartBar, { height: 92, backgroundColor: '#F4C96B' }]} /><View style={[styles.chartBar, { height: 80, backgroundColor: '#91CBB2' }]} /></View><View style={styles.chartLabels}>{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((item) => <Text key={item} style={{ color: 'rgba(255,255,255,0.58)', fontSize: 10 }}>{item}</Text>)}</View></Card><View style={styles.summaryRow}><Card style={styles.summaryCard}><Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Доходы</Text><Text style={[styles.summaryValue, { color: colors.income }]}>+{formatShortMoney(incomeTotal)}</Text><Text style={[styles.summaryCaption, { color: colors.mutedForeground }]}>за всё время</Text></Card><Card style={styles.summaryCard}><Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Расходы</Text><Text style={[styles.summaryValue, { color: colors.expense }]}>−{formatShortMoney(expenseTotal)}</Text><Text style={[styles.summaryCaption, { color: colors.mutedForeground }]}>за всё время</Text></Card></View><SectionTitle title="Расходы по категориям" /><Card>{categoryStats.length ? categoryStats.map(([name, value], index) => <View key={name} style={styles.categoryRow}><View style={[styles.categoryDot, { backgroundColor: data.categories.find((item) => item.name === name)?.color ?? colors.primary }]} /><Text style={[styles.categoryName, { color: colors.foreground }]}>{name}</Text><View style={styles.categoryTrack}><View style={[styles.categoryFill, { width: `${Math.max(10, (value / maxCategory) * 100)}%`, backgroundColor: data.categories.find((item) => item.name === name)?.color ?? colors.primary }]} /></View><Text style={[styles.categoryValue, { color: colors.foreground }]}>{formatShortMoney(value)}</Text></View>) : <Text style={{ color: colors.mutedForeground }}>Пока нет расходов за период.</Text>}</Card><SectionTitle title="Счета" /><Card>{accountsWithBalance.map((account) => <View key={account.id} style={styles.accountRow}><View style={[styles.accountIcon, { backgroundColor: `${account.color}22` }]}><Ionicons name="wallet-outline" size={17} color={account.color} /></View><Text style={[styles.categoryName, { color: colors.foreground }]}>{account.name}</Text><Text style={[styles.accountValue, { color: colors.foreground }]}>{formatShortMoney(account.balance)}</Text></View>)}</Card><Text style={[styles.footnote, { color: colors.mutedForeground }]}>Текущий баланс: {formatShortMoney(totalBalance)}</Text></View></ScrollView></Screen>;
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20 },
  periods: { gap: 8, paddingBottom: 18 },
  period: { fontSize: 13, fontWeight: '700', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 13, overflow: 'hidden' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  chart: { height: 105, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 18, marginTop: 15 },
  chartBar: { width: 27, borderRadius: 8 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  summaryCard: { flex: 1, padding: 15 },
  summaryLabel: { fontSize: 12, marginBottom: 6 },
  summaryValue: { fontSize: 18, fontWeight: '700' },
  summaryCaption: { fontSize: 10, marginTop: 8 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginVertical: 8 },
  categoryDot: { width: 9, height: 9, borderRadius: 5 },
  categoryName: { fontSize: 13, fontWeight: '600', width: 92 },
  categoryTrack: { flex: 1, height: 7, backgroundColor: '#E9EEE8', borderRadius: 4, overflow: 'hidden' },
  categoryFill: { height: 7, borderRadius: 4 },
  categoryValue: { fontSize: 12, fontWeight: '600', width: 56, textAlign: 'right' },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  accountIcon: { width: 33, height: 33, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  accountValue: { marginLeft: 'auto', fontSize: 13, fontWeight: '700' },
  footnote: { textAlign: 'center', fontSize: 12, marginTop: 18 },
});