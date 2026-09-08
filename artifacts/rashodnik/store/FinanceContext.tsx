import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Sharing from 'expo-sharing';
import { AppState, AppStateStatus, Appearance, Platform } from 'react-native';
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Account,
  AppSettings,
  CategoryGroup,
  Debt,
  DebtDirection,
  FinanceData,
  Transaction,
  TransactionType,
} from '@/types/finance';

const STORAGE_KEY = '@rashodnik/finance-data-v1';
const palette = ['#1E6F50', '#D68A54', '#4E7D9A', '#8D6EAA', '#C95C5C', '#A3A64F'];

const defaultCategories: CategoryGroup[] = [
  { name: 'Еда', color: '#D68A54', items: ['Продукты', 'Ресторан', 'Кафе', 'Доставка'] },
  { name: 'Транспорт', color: '#4E7D9A', items: ['Такси', 'Автобус', 'Маршрутка', 'Бензин', 'Ремонт'] },
  { name: 'Развлечения', color: '#8D6EAA', items: ['Компьютерные игры', 'Бильярд', 'Кино', 'Игры'] },
  { name: 'Дом', color: '#5E9C78', items: ['Коммунальные услуги', 'Интернет', 'Телефон', 'Ремонт'] },
  { name: 'Покупки', color: '#C95C5C', items: ['Одежда', 'Обувь', 'Электроника', 'Другое'] },
  { name: 'Здоровье', color: '#BE7B9A', items: ['Аптека', 'Врач', 'Другое'] },
  { name: 'Другое', color: '#86918A', items: ['Другое'] },
];

const day = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const initialAccounts: Account[] = [
  { id: 'cash', name: 'Наличные', initialBalance: 420, color: palette[0] },
  { id: 'dc', name: 'DC', initialBalance: 0, color: palette[1] },
  { id: 'amonat', name: 'Амонатбанк', initialBalance: 1150, color: palette[2] },
  { id: 'alif', name: 'Алиф', initialBalance: 0, color: palette[3] },
];

const initialTransactions: Transaction[] = [
  { id: 'demo-income', type: 'income', amount: 5000, source: 'Зарплата', accountId: 'amonat', note: 'Основной доход', date: day(2) },
  { id: 'demo-food', type: 'expense', amount: 185, category: 'Еда', subcategory: 'Кафе', accountId: 'cash', note: 'Обед с друзьями', date: day(1) },
  { id: 'demo-taxi', type: 'expense', amount: 60, category: 'Транспорт', subcategory: 'Такси', accountId: 'cash', note: 'Поездка домой', date: day(0) },
];

const initialData: FinanceData = {
  accounts: initialAccounts,
  transactions: initialTransactions,
  debts: [
    { id: 'demo-debt', person: 'Фарход', originalAmount: 300, remainingAmount: 300, note: 'До следующей недели', createdAt: day(4), direction: 'receivable', payments: [] },
  ],
  categories: defaultCategories,
  settings: { theme: 'system', faceIdEnabled: false },
};

interface FinanceContextValue {
  data: FinanceData;
  ready: boolean;
  locked: boolean;
  accountsWithBalance: (Account & { balance: number })[];
  totalBalance: number;
  incomeTotal: number;
  expenseTotal: number;
  addTransaction: (input: Omit<Transaction, 'id' | 'date'> & { date?: string }) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (name: string, initialBalance: number) => void;
  deleteAccount: (id: string) => void;
  addDebt: (input: { person: string; amount: number; note: string; direction: DebtDirection }) => void;
  payDebt: (debtId: string, amount: number, accountId: string, note: string) => void;
  deleteDebt: (id: string) => void;
  setTheme: (theme: AppSettings['theme']) => void;
  setFaceIdEnabled: (value: boolean) => Promise<boolean>;
  unlock: () => Promise<boolean>;
  exportBackup: () => Promise<void>;
  importBackup: () => Promise<boolean>;
  resetData: () => Promise<void>;
  accountBalance: (accountId: string) => number;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function calculateAccountBalance(account: Account, transactions: Transaction[]) {
  return transactions.reduce((balance, transaction) => {
    if (transaction.type === 'income' && transaction.accountId === account.id) return balance + transaction.amount;
    if (transaction.type === 'expense' && transaction.accountId === account.id) return balance - transaction.amount;
    if (transaction.type === 'transfer') {
      if (transaction.accountId === account.id) return balance - transaction.amount;
      if (transaction.toAccountId === account.id) return balance + transaction.amount;
    }
    if (transaction.type === 'debt' && transaction.accountId === account.id) {
      return transaction.debtDirection === 'receivable' ? balance + transaction.amount : balance - transaction.amount;
    }
    return balance;
  }, account.initialBalance);
}

function isValidData(value: unknown): value is FinanceData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as FinanceData;
  return Array.isArray(candidate.accounts) && Array.isArray(candidate.transactions) && Array.isArray(candidate.debts) && Array.isArray(candidate.categories) && !!candidate.settings;
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinanceData>(initialData);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as FinanceData;
          if (isValidData(parsed)) setData(parsed);
        } catch {
          // Keep a valid clean local dataset when a backup is corrupt.
        }
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  const onAppStateChange = useCallback((next: AppStateStatus) => {
    if (appState.current.match(/active/) && next.match(/inactive|background/) && data.settings.faceIdEnabled) {
      setLocked(true);
    }
    appState.current = next;
  }, [data.settings.faceIdEnabled]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [onAppStateChange]);

  const updateData = useCallback((updater: (current: FinanceData) => FinanceData) => {
    setData((current) => updater(current));
  }, []);

  const addTransaction = useCallback((input: Omit<Transaction, 'id' | 'date'> & { date?: string }) => {
    updateData((current) => ({
      ...current,
      transactions: [...current.transactions, { ...input, id: nextId('transaction'), date: input.date ?? new Date().toISOString() }],
    }));
  }, [updateData]);

  const deleteTransaction = useCallback((id: string) => {
    updateData((current) => ({ ...current, transactions: current.transactions.filter((item) => item.id !== id) }));
  }, [updateData]);

  const addAccount = useCallback((name: string, initialBalance: number) => {
    updateData((current) => ({
      ...current,
      accounts: [...current.accounts, { id: nextId('account'), name, initialBalance, color: palette[current.accounts.length % palette.length] }],
    }));
  }, [updateData]);

  const deleteAccount = useCallback((id: string) => {
    updateData((current) => {
      if (current.accounts.length <= 1 || current.transactions.some((item) => item.accountId === id || item.toAccountId === id)) return current;
      return { ...current, accounts: current.accounts.filter((item) => item.id !== id) };
    });
  }, [updateData]);

  const addDebt = useCallback((input: { person: string; amount: number; note: string; direction: DebtDirection }) => {
    updateData((current) => ({
      ...current,
      debts: [...current.debts, { id: nextId('debt'), person: input.person, originalAmount: input.amount, remainingAmount: input.amount, note: input.note, createdAt: new Date().toISOString(), direction: input.direction, payments: [] }],
    }));
  }, [updateData]);

  const payDebt = useCallback((debtId: string, amount: number, accountId: string, note: string) => {
    updateData((current) => {
      const debt = current.debts.find((item) => item.id === debtId);
      if (!debt || amount <= 0 || amount > debt.remainingAmount) return current;
      const payment = { id: nextId('payment'), amount, accountId, date: new Date().toISOString(), note };
      return {
        ...current,
        debts: current.debts.map((item) => item.id === debtId ? { ...item, remainingAmount: item.remainingAmount - amount, payments: [...item.payments, payment] } : item),
        transactions: [...current.transactions, { id: nextId('transaction'), type: 'debt', amount, accountId, debtId, debtDirection: debt.direction, category: 'Долги', source: debt.person, note: note || `Платёж: ${debt.person}`, date: payment.date }],
      };
    });
  }, [updateData]);

  const deleteDebt = useCallback((id: string) => {
    updateData((current) => ({ ...current, debts: current.debts.filter((item) => item.id !== id) }));
  }, [updateData]);

  const setTheme = useCallback((theme: AppSettings['theme']) => {
    if (theme !== 'system') Appearance.setColorScheme(theme);
    updateData((current) => ({ ...current, settings: { ...current.settings, theme } }));
  }, [updateData]);

  const setFaceIdEnabled = useCallback(async (value: boolean) => {
    if (value && Platform.OS !== 'web') {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) return false;
    }
    updateData((current) => ({ ...current, settings: { ...current.settings, faceIdEnabled: value } }));
    return true;
  }, [updateData]);

  const unlock = useCallback(async () => {
    if (Platform.OS === 'web') {
      setLocked(false);
      return true;
    }
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Разблокировать Расходник', fallbackLabel: 'Введите код устройства' });
    if (result.success) setLocked(false);
    return result.success;
  }, []);

  const exportBackup = useCallback(async () => {
    const uri = `${FileSystem.cacheDirectory}rashodnik-backup.json`;
    await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2));
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Экспорт данных Расходник' });
  }, [data]);

  const importBackup = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
    if (result.canceled || !result.assets[0]) return false;
    const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
    const parsed = JSON.parse(raw) as FinanceData;
    if (!isValidData(parsed)) return false;
    setData(parsed);
    return true;
  }, []);

  const resetData = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setData(initialData);
  }, []);

  const accountsWithBalance = useMemo(() => data.accounts.map((account) => ({ ...account, balance: calculateAccountBalance(account, data.transactions) })), [data.accounts, data.transactions]);
  const accountBalance = useCallback((accountId: string) => accountsWithBalance.find((account) => account.id === accountId)?.balance ?? 0, [accountsWithBalance]);
  const incomeTotal = useMemo(() => data.transactions.filter((item) => item.type === 'income' || (item.type === 'debt' && item.debtDirection === 'receivable')).reduce((sum, item) => sum + item.amount, 0), [data.transactions]);
  const expenseTotal = useMemo(() => data.transactions.filter((item) => item.type === 'expense' || (item.type === 'debt' && item.debtDirection === 'payable')).reduce((sum, item) => sum + item.amount, 0), [data.transactions]);

  const value = useMemo<FinanceContextValue>(() => ({
    data, ready, locked, accountsWithBalance, totalBalance: accountsWithBalance.reduce((sum, item) => sum + item.balance, 0), incomeTotal, expenseTotal,
    addTransaction, deleteTransaction, addAccount, deleteAccount, addDebt, payDebt, deleteDebt, setTheme, setFaceIdEnabled, unlock, exportBackup, importBackup, resetData, accountBalance,
  }), [data, ready, locked, accountsWithBalance, incomeTotal, expenseTotal, addTransaction, deleteTransaction, addAccount, deleteAccount, addDebt, payDebt, deleteDebt, setTheme, setFaceIdEnabled, unlock, exportBackup, importBackup, resetData, accountBalance]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
}

export function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} сомони`;
}

export function formatShortMoney(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} с`;
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function formatDateLong(date: string) {
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function typeLabel(type: TransactionType) {
  return type === 'income' ? 'Доход' : type === 'expense' ? 'Расход' : type === 'transfer' ? 'Перевод' : 'Погашение долга';
}