export interface TrialBalance {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  balanceType: 'Debit' | 'Credit';
}

export interface ProfitLoss {
  revenue: ProfitLossItem[];
  expenses: ProfitLossItem[];
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
}

export interface ProfitLossItem {
  accountId: number;
  accountName: string;
  amount: number;
  percentage: number;
}

export interface BalanceSheet {
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  equity: BalanceSheetItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface BalanceSheetItem {
  accountId: number;
  accountName: string;
  amount: number;
  category: string;
}

export interface Mushak63Report {
  bin: string;
  period: string;
  turnover: number;
  outputVat: number;
  inputVat: number;
  netVatPayable: number;
  adjustments: number;
}