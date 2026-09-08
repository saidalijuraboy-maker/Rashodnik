export type TransactionType = 'income' | 'expense' | 'transfer' | 'debt';
export type DebtDirection = 'receivable' | 'payable';

export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category?: string;
  subcategory?: string;
  source?: string;
  accountId: string;
  toAccountId?: string;
  note?: string;
  date: string;
  debtId?: string;
  debtDirection?: DebtDirection;
}

export interface DebtPayment {
  id: string;
  amount: number;
  accountId: string;
  date: string;
  note?: string;
}

export interface Debt {
  id: string;
  person: string;
  originalAmount: number;
  remainingAmount: number;
  note?: string;
  createdAt: string;
  direction: DebtDirection;
  payments: DebtPayment[];
}

export interface CategoryGroup {
  name: string;
  color: string;
  items: string[];
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  faceIdEnabled: boolean;
}

export interface FinanceData {
  accounts: Account[];
  transactions: Transaction[];
  debts: Debt[];
  categories: CategoryGroup[];
  settings: AppSettings;
}