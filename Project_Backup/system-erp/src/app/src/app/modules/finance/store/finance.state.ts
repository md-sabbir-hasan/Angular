import { Account } from '../models/account.model';
import { Invoice } from '../models/invoice.model';
import { ExpenseClaim } from '../models/expense.model';
import { JournalEntry } from '../models/journal-entry.model';
import { LedgerEntry, TrialBalanceSummary } from '../models/ledger.model';
import {
  ProfitLossReport,
  BalanceSheetReport,
  CashFlowReport,
  DashboardStats
} from '../services/report';

// ── Loading states ───────────────────────────────────────────
export interface LoadingState {
  accounts:      boolean;
  invoices:      boolean;
  expenses:      boolean;
  journal:       boolean;
  ledger:        boolean;
  trialBalance:  boolean;
  reports:       boolean;
  dashboard:     boolean;
}

// ── Error states ─────────────────────────────────────────────
export interface ErrorState {
  accounts:     string | null;
  invoices:     string | null;
  expenses:     string | null;
  journal:      string | null;
  ledger:       string | null;
  trialBalance: string | null;
  reports:      string | null;
  dashboard:    string | null;
}

// ── Filter states ────────────────────────────────────────────
export interface FilterState {
  accountSearch:  string;
  accountType:    string;
  invoiceSearch:  string;
  invoiceStatus:  string;
  expenseSearch:  string;
  expenseStatus:  string;
  journalSearch:  string;
  journalStatus:  string;
  ledgerAccount:  string;
  fromDate:       string;
  toDate:         string;
}

// ── Main Finance State ───────────────────────────────────────
export interface FinanceState {
  // Data
  accounts:      Account[];
  invoices:      Invoice[];
  expenses:      ExpenseClaim[];
  journalEntries: JournalEntry[];
  ledgerEntries: LedgerEntry[];
  trialBalance:  TrialBalanceSummary | null;
  dashboard:     DashboardStats | null;

  // Reports
  profitLoss:    ProfitLossReport | null;
  balanceSheet:  BalanceSheetReport | null;
  cashFlow:      CashFlowReport | null;

  // UI State
  loading:       LoadingState;
  errors:        ErrorState;
  filters:       FilterState;

  // Pagination
  currentPage:   number;
  pageSize:      number;

  // Selected
  selectedAccount:  Account | null;
  selectedInvoice:  Invoice | null;
  selectedExpense:  ExpenseClaim | null;
  selectedJournal:  JournalEntry | null;
}

// ── Initial State ────────────────────────────────────────────
export const initialFinanceState: FinanceState = {
  accounts:       [],
  invoices:       [],
  expenses:       [],
  journalEntries: [],
  ledgerEntries:  [],
  trialBalance:   null,
  dashboard:      null,
  profitLoss:     null,
  balanceSheet:   null,
  cashFlow:       null,

  loading: {
    accounts:     false,
    invoices:     false,
    expenses:     false,
    journal:      false,
    ledger:       false,
    trialBalance: false,
    reports:      false,
    dashboard:    false
  },

  errors: {
    accounts:     null,
    invoices:     null,
    expenses:     null,
    journal:      null,
    ledger:       null,
    trialBalance: null,
    reports:      null,
    dashboard:    null
  },

  filters: {
    accountSearch:  '',
    accountType:    '',
    invoiceSearch:  '',
    invoiceStatus:  '',
    expenseSearch:  '',
    expenseStatus:  '',
    journalSearch:  '',
    journalStatus:  '',
    ledgerAccount:  '',
    fromDate:       '',
    toDate:         ''
  },

  currentPage:      1,
  pageSize:         10,
  selectedAccount:  null,
  selectedInvoice:  null,
  selectedExpense:  null,
  selectedJournal:  null
};