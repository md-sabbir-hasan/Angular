export type JournalType =
  | 'general'
  | 'sales'
  | 'purchase'
  | 'cash'
  | 'bank'
  | 'payroll'
  | 'depreciation';

export type JournalStatus = 'draft' | 'posted' | 'cancelled';

export interface JournalEntry {
  id: string;
  tenant_id: string;
  reference: string;
  entry_date: string;
  type: JournalType;
  status: JournalStatus;
  narration: string;
  created_by: string;
  lines?: JournalLine[];
}

export interface JournalLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  account_name?: string;
  debit: number;
  credit: number;
  narration: string;
}

export interface JournalFormData {
  entry_date: string;
  type: JournalType;
  narration: string;
  lines: JournalLineForm[];
}

export interface JournalLineForm {
  account_id: string;
  debit: number;
  credit: number;
  narration: string;
}

export const JOURNAL_TYPE_LABELS: Record<JournalType, string> = {
  general: 'General',
  sales: 'Sales',
  purchase: 'Purchase',
  cash: 'Cash',
  bank: 'Bank',
  payroll: 'Payroll',
  depreciation: 'Depreciation'
};