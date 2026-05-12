export interface LedgerEntry {
  id: string;
  tenant_id: string;
  account_id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  journal_entry_id: string;
  reference?: string;
}

export interface LedgerFilter {
  account_id: string;
  from_date: string;
  to_date: string;
}

export interface LedgerSummary {
  account_id: string;
  account_name: string;
  account_code: string;
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  closing_balance: number;
}

export interface TrialBalanceRow {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceSummary {
  rows: TrialBalanceRow[];
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
}