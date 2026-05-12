export type AccountType =
  | 'asset'
  | 'liability'
  | 'equity'
  | 'revenue'
  | 'expense';

export interface Account {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  type: AccountType;
  parent_id: string | null;
  is_active: boolean;
  balance: number;
  description?: string;
}

export interface AccountFormData {
  code: string;
  name: string;
  type: AccountType;
  parent_id: string | null;
  is_active: boolean;
  description?: string;
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expense'
};

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  asset: 'bi-bank',
  liability: 'bi-credit-card',
  equity: 'bi-pie-chart',
  revenue: 'bi-graph-up-arrow',
  expense: 'bi-receipt'
};