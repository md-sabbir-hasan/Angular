export interface Transaction {
  id?: number;
  voucherId: number;
  voucherNo: string;
  date: string;
  accountId: number;
  accountName: string;
  accountCode: string;
  debit: number;
  credit: number;
  narration: string;
  tags?: string[];
}

export interface BankReconciliation {
  id?: number;
  bankAccountId: number;
  statementDate: string;
  statementBalance: number;
  ledgerBalance: number;
  reconciledItems: ReconciledItem[];
  status: 'Pending' | 'Reconciled';
}

export interface ReconciledItem {
  transactionId: number;
  matchedAmount: number;
  difference: number;
}