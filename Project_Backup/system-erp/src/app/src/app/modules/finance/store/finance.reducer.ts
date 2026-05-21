import {
  FinanceState,
  initialFinanceState,
  FilterState
} from './finance.state';
import { FinanceAction } from './finance.actions';
import { Account } from '../models/account.model';
import { Invoice } from '../models/invoice.model';
import { ExpenseClaim } from '../models/expense.model';
import { JournalEntry } from '../models/journal-entry.model';
import { LedgerEntry, TrialBalanceSummary } from '../models/ledger.model';
import {
  DashboardStats,
  ProfitLossReport,
  BalanceSheetReport,
  CashFlowReport
} from '../services/report';

export function financeReducer(
  state:  FinanceState = initialFinanceState,
  action: FinanceAction
): FinanceState {
  switch (action.type) {

    // ── Account ───────────────────────────────────────────
    case 'LOAD_ACCOUNTS':
      return {
        ...state,
        loading: { ...state.loading, accounts: true },
        errors:  { ...state.errors,  accounts: null }
      };

    case 'LOAD_ACCOUNTS_SUCCESS':
      return {
        ...state,
        accounts: action.payload as Account[],
        loading:  { ...state.loading, accounts: false }
      };

    case 'LOAD_ACCOUNTS_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, accounts: false },
        errors:  {
          ...state.errors,
          accounts: action.payload as string
        }
      };

    case 'CREATE_ACCOUNT_SUCCESS':
      return {
        ...state,
        accounts: [
          ...state.accounts,
          action.payload as Account
        ]
      };

    case 'UPDATE_ACCOUNT_SUCCESS': {
      const updated = action.payload as Account;
      return {
        ...state,
        accounts: state.accounts.map(a =>
          a.id === updated.id ? updated : a
        )
      };
    }

    case 'DELETE_ACCOUNT_SUCCESS':
      return {
        ...state,
        accounts: state.accounts.filter(
          a => a.id !== (action.payload as string)
        )
      };

    case 'SELECT_ACCOUNT':
      return {
        ...state,
        selectedAccount: action.payload as Account | null
      };

    // ── Invoice ───────────────────────────────────────────
    case 'LOAD_INVOICES':
      return {
        ...state,
        loading: { ...state.loading, invoices: true },
        errors:  { ...state.errors,  invoices: null }
      };

    case 'LOAD_INVOICES_SUCCESS':
      return {
        ...state,
        invoices: action.payload as Invoice[],
        loading:  { ...state.loading, invoices: false }
      };

    case 'LOAD_INVOICES_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, invoices: false },
        errors:  {
          ...state.errors,
          invoices: action.payload as string
        }
      };

    case 'CREATE_INVOICE_SUCCESS':
      return {
        ...state,
        invoices: [
          action.payload as Invoice,
          ...state.invoices
        ]
      };

    case 'UPDATE_INVOICE_SUCCESS': {
      const updated = action.payload as Invoice;
      return {
        ...state,
        invoices: state.invoices.map(i =>
          i.id === updated.id ? updated : i
        )
      };
    }

    case 'DELETE_INVOICE_SUCCESS':
      return {
        ...state,
        invoices: state.invoices.filter(
          i => i.id !== (action.payload as string)
        )
      };

    case 'SELECT_INVOICE':
      return {
        ...state,
        selectedInvoice: action.payload as Invoice | null
      };

    // ── Expense ───────────────────────────────────────────
    case 'LOAD_EXPENSES':
      return {
        ...state,
        loading: { ...state.loading, expenses: true },
        errors:  { ...state.errors,  expenses: null }
      };

    case 'LOAD_EXPENSES_SUCCESS':
      return {
        ...state,
        expenses: action.payload as ExpenseClaim[],
        loading:  { ...state.loading, expenses: false }
      };

    case 'LOAD_EXPENSES_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, expenses: false },
        errors:  {
          ...state.errors,
          expenses: action.payload as string
        }
      };

    case 'CREATE_EXPENSE_SUCCESS':
      return {
        ...state,
        expenses: [
          action.payload as ExpenseClaim,
          ...state.expenses
        ]
      };

    case 'UPDATE_EXPENSE_SUCCESS': {
      const updated = action.payload as ExpenseClaim;
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e.id === updated.id ? updated : e
        )
      };
    }

    case 'DELETE_EXPENSE_SUCCESS':
      return {
        ...state,
        expenses: state.expenses.filter(
          e => e.id !== (action.payload as string)
        )
      };

    case 'SELECT_EXPENSE':
      return {
        ...state,
        selectedExpense: action.payload as ExpenseClaim | null
      };

    // ── Journal ───────────────────────────────────────────
    case 'LOAD_JOURNAL':
      return {
        ...state,
        loading: { ...state.loading, journal: true },
        errors:  { ...state.errors,  journal: null }
      };

    case 'LOAD_JOURNAL_SUCCESS':
      return {
        ...state,
        journalEntries: action.payload as JournalEntry[],
        loading: { ...state.loading, journal: false }
      };

    case 'LOAD_JOURNAL_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, journal: false },
        errors:  {
          ...state.errors,
          journal: action.payload as string
        }
      };

    case 'CREATE_JOURNAL_SUCCESS':
      return {
        ...state,
        journalEntries: [
          action.payload as JournalEntry,
          ...state.journalEntries
        ]
      };

    case 'SELECT_JOURNAL':
      return {
        ...state,
        selectedJournal: action.payload as JournalEntry | null
      };

    // ── Ledger ────────────────────────────────────────────
    case 'LOAD_LEDGER':
      return {
        ...state,
        loading: { ...state.loading, ledger: true },
        errors:  { ...state.errors,  ledger: null }
      };

    case 'LOAD_LEDGER_SUCCESS':
      return {
        ...state,
        ledgerEntries: action.payload as LedgerEntry[],
        loading: { ...state.loading, ledger: false }
      };

    case 'LOAD_LEDGER_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, ledger: false },
        errors:  {
          ...state.errors,
          ledger: action.payload as string
        }
      };

    // ── Trial Balance ─────────────────────────────────────
    case 'LOAD_TRIAL_BALANCE':
      return {
        ...state,
        loading: { ...state.loading, trialBalance: true },
        errors:  { ...state.errors,  trialBalance: null }
      };

    case 'LOAD_TRIAL_BALANCE_SUCCESS':
      return {
        ...state,
        trialBalance: action.payload as TrialBalanceSummary,
        loading: { ...state.loading, trialBalance: false }
      };

    case 'LOAD_TRIAL_BALANCE_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, trialBalance: false },
        errors:  {
          ...state.errors,
          trialBalance: action.payload as string
        }
      };

    // ── Dashboard ─────────────────────────────────────────
    case 'LOAD_DASHBOARD':
      return {
        ...state,
        loading: { ...state.loading, dashboard: true },
        errors:  { ...state.errors,  dashboard: null }
      };

    case 'LOAD_DASHBOARD_SUCCESS':
      return {
        ...state,
        dashboard: action.payload as DashboardStats,
        loading: { ...state.loading, dashboard: false }
      };

    case 'LOAD_DASHBOARD_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, dashboard: false },
        errors:  {
          ...state.errors,
          dashboard: action.payload as string
        }
      };

    // ── Reports ───────────────────────────────────────────
    case 'LOAD_PROFIT_LOSS_SUCCESS':
      return {
        ...state,
        profitLoss: action.payload as ProfitLossReport,
        loading:    { ...state.loading, reports: false }
      };

    case 'LOAD_BALANCE_SHEET_SUCCESS':
      return {
        ...state,
        balanceSheet: action.payload as BalanceSheetReport,
        loading:      { ...state.loading, reports: false }
      };

    case 'LOAD_CASH_FLOW_SUCCESS':
      return {
        ...state,
        cashFlow: action.payload as CashFlowReport,
        loading:  { ...state.loading, reports: false }
      };

    // ── Filters ───────────────────────────────────────────
    case 'SET_FILTER': {
      const { key, value } = action.payload as {
        key: string;
        value: string;
      };
      return {
        ...state,
        currentPage: 1,
        filters: {
          ...state.filters,
          [key]: value
        } as FilterState
      };
    }

    case 'RESET_FILTERS':
      return {
        ...state,
        currentPage: 1,
        filters: initialFinanceState.filters
      };

    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload as number
      };

    default:
      return state;
  }
}

// ── Selector helpers ─────────────────────────────────────────
export const selectAccounts = (state: FinanceState) =>
  state.accounts;

export const selectInvoices = (state: FinanceState) =>
  state.invoices;

export const selectExpenses = (state: FinanceState) =>
  state.expenses;

export const selectJournalEntries = (state: FinanceState) =>
  state.journalEntries;

export const selectLedgerEntries = (state: FinanceState) =>
  state.ledgerEntries;

export const selectTrialBalance = (state: FinanceState) =>
  state.trialBalance;

export const selectDashboard = (state: FinanceState) =>
  state.dashboard;

export const selectIsLoading = (
  state: FinanceState,
  key: keyof FinanceState['loading']
) => state.loading[key];

export const selectFilters = (state: FinanceState) =>
  state.filters;

export const selectCurrentPage = (state: FinanceState) =>
  state.currentPage;