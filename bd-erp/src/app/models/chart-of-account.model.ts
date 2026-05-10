export interface ChartOfAccount {
  id?: number;
  code: string;
  name: string;
  type: AccountType;
  category: string;
  parentId?: number | null;
  isActive: boolean;
  openingBalance: number;
  createdAt: string;
  updatedAt: string;
}

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';

export const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];

export const ACCOUNT_CATEGORIES = {
  Asset: ['Current Asset', 'Non-Current Asset', 'Contra Asset'],
  Liability: ['Current Liability', 'Non-Current Liability'],
  Equity: ['Capital', 'Reserves'],
  Income: ['Sales Revenue', 'Service Revenue', 'Other Income'],
  Expense: ['Operating Expense', 'Administrative Expense', 'Financial Expense']
};