export type ExpenseStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'paid';

export interface ExpenseClaim {
  id: string;
  tenant_id: string;
  claim_number: string;
  employee_id: string;
  employee_name: string;
  claim_date: string;
  total_amount: number;
  status: ExpenseStatus;
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  claim_id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  receipt_url?: string;
}

export interface ExpenseFormData {
  employee_name: string;
  claim_date: string;
  total_amount: number;
  notes?: string;
}

export const EXPENSE_CATEGORIES = [
  'Travel',
  'Meals & Entertainment',
  'Accommodation',
  'Office Supplies',
  'Communication',
  'Training',
  'Medical',
  'Other'
];

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  paid: 'Paid'
};