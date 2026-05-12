import { Account, AccountFormData } from '../models/account.model';
import { Invoice, InvoiceFormData } from '../models/invoice.model';
import { ExpenseClaim, ExpenseFormData } from '../models/expense.model';
import { JournalEntry, JournalFormData } from '../models/journal-entry.model';
import { LedgerEntry, TrialBalanceSummary } from '../models/ledger.model';
import {
  ProfitLossReport,
  BalanceSheetReport,
  CashFlowReport,
  DashboardStats
} from '../services/report';

// ── Action Types ─────────────────────────────────────────────
export type FinanceActionType =
  // Account actions
  | 'LOAD_ACCOUNTS'
  | 'LOAD_ACCOUNTS_SUCCESS'
  | 'LOAD_ACCOUNTS_FAILURE'
  | 'CREATE_ACCOUNT'
  | 'CREATE_ACCOUNT_SUCCESS'
  | 'UPDATE_ACCOUNT'
  | 'UPDATE_ACCOUNT_SUCCESS'
  | 'DELETE_ACCOUNT'
  | 'DELETE_ACCOUNT_SUCCESS'
  | 'SELECT_ACCOUNT'

  // Invoice actions
  | 'LOAD_INVOICES'
  | 'LOAD_INVOICES_SUCCESS'
  | 'LOAD_INVOICES_FAILURE'
  | 'CREATE_INVOICE'
  | 'CREATE_INVOICE_SUCCESS'
  | 'UPDATE_INVOICE'
  | 'UPDATE_INVOICE_SUCCESS'
  | 'DELETE_INVOICE'
  | 'DELETE_INVOICE_SUCCESS'
  | 'SELECT_INVOICE'

  // Expense actions
  | 'LOAD_EXPENSES'
  | 'LOAD_EXPENSES_SUCCESS'
  | 'LOAD_EXPENSES_FAILURE'
  | 'CREATE_EXPENSE'
  | 'CREATE_EXPENSE_SUCCESS'
  | 'UPDATE_EXPENSE'
  | 'UPDATE_EXPENSE_SUCCESS'
  | 'DELETE_EXPENSE'
  | 'DELETE_EXPENSE_SUCCESS'
  | 'SELECT_EXPENSE'

  // Journal actions
  | 'LOAD_JOURNAL'
  | 'LOAD_JOURNAL_SUCCESS'
  | 'LOAD_JOURNAL_FAILURE'
  | 'CREATE_JOURNAL'
  | 'CREATE_JOURNAL_SUCCESS'
  | 'SELECT_JOURNAL'

  // Ledger actions
  | 'LOAD_LEDGER'
  | 'LOAD_LEDGER_SUCCESS'
  | 'LOAD_LEDGER_FAILURE'

  // Trial Balance
  | 'LOAD_TRIAL_BALANCE'
  | 'LOAD_TRIAL_BALANCE_SUCCESS'
  | 'LOAD_TRIAL_BALANCE_FAILURE'

  // Dashboard
  | 'LOAD_DASHBOARD'
  | 'LOAD_DASHBOARD_SUCCESS'
  | 'LOAD_DASHBOARD_FAILURE'

  // Reports
  | 'LOAD_PROFIT_LOSS'
  | 'LOAD_PROFIT_LOSS_SUCCESS'
  | 'LOAD_BALANCE_SHEET'
  | 'LOAD_BALANCE_SHEET_SUCCESS'
  | 'LOAD_CASH_FLOW'
  | 'LOAD_CASH_FLOW_SUCCESS'

  // Filter actions
  | 'SET_FILTER'
  | 'RESET_FILTERS'
  | 'SET_PAGE';

// ── Action Interface ─────────────────────────────────────────
export interface FinanceAction {
  type:    FinanceActionType;
  payload?: unknown;
}

// ── Action Creators ──────────────────────────────────────────

// Account
export const loadAccounts = ():
  FinanceAction => ({ type: 'LOAD_ACCOUNTS' });

export const loadAccountsSuccess = (accounts: Account[]):
  FinanceAction => ({ type: 'LOAD_ACCOUNTS_SUCCESS', payload: accounts });

export const loadAccountsFailure = (error: string):
  FinanceAction => ({ type: 'LOAD_ACCOUNTS_FAILURE', payload: error });

export const createAccountSuccess = (account: Account):
  FinanceAction => ({ type: 'CREATE_ACCOUNT_SUCCESS', payload: account });

export const updateAccountSuccess = (account: Account):
  FinanceAction => ({ type: 'UPDATE_ACCOUNT_SUCCESS', payload: account });

export const deleteAccountSuccess = (id: string):
  FinanceAction => ({ type: 'DELETE_ACCOUNT_SUCCESS', payload: id });

export const selectAccount = (account: Account | null):
  FinanceAction => ({ type: 'SELECT_ACCOUNT', payload: account });

// Invoice
export const loadInvoices = ():
  FinanceAction => ({ type: 'LOAD_INVOICES' });

export const loadInvoicesSuccess = (invoices: Invoice[]):
  FinanceAction => ({ type: 'LOAD_INVOICES_SUCCESS', payload: invoices });

export const loadInvoicesFailure = (error: string):
  FinanceAction => ({ type: 'LOAD_INVOICES_FAILURE', payload: error });

export const createInvoiceSuccess = (invoice: Invoice):
  FinanceAction => ({ type: 'CREATE_INVOICE_SUCCESS', payload: invoice });

export const updateInvoiceSuccess = (invoice: Invoice):
  FinanceAction => ({ type: 'UPDATE_INVOICE_SUCCESS', payload: invoice });

export const deleteInvoiceSuccess = (id: string):
  FinanceAction => ({ type: 'DELETE_INVOICE_SUCCESS', payload: id });

export const selectInvoice = (invoice: Invoice | null):
  FinanceAction => ({ type: 'SELECT_INVOICE', payload: invoice });

// Expense
export const loadExpenses = ():
  FinanceAction => ({ type: 'LOAD_EXPENSES' });

export const loadExpensesSuccess = (expenses: ExpenseClaim[]):
  FinanceAction => ({ type: 'LOAD_EXPENSES_SUCCESS', payload: expenses });

export const loadExpensesFailure = (error: string):
  FinanceAction => ({ type: 'LOAD_EXPENSES_FAILURE', payload: error });

export const createExpenseSuccess = (expense: ExpenseClaim):
  FinanceAction => ({ type: 'CREATE_EXPENSE_SUCCESS', payload: expense });

export const updateExpenseSuccess = (expense: ExpenseClaim):
  FinanceAction => ({ type: 'UPDATE_EXPENSE_SUCCESS', payload: expense });

export const deleteExpenseSuccess = (id: string):
  FinanceAction => ({ type: 'DELETE_EXPENSE_SUCCESS', payload: id });

export const selectExpense = (expense: ExpenseClaim | null):
  FinanceAction => ({ type: 'SELECT_EXPENSE', payload: expense });

// Journal
export const loadJournalSuccess = (entries: JournalEntry[]):
  FinanceAction => ({ type: 'LOAD_JOURNAL_SUCCESS', payload: entries });

export const createJournalSuccess = (entry: JournalEntry):
  FinanceAction => ({ type: 'CREATE_JOURNAL_SUCCESS', payload: entry });

export const selectJournal = (entry: JournalEntry | null):
  FinanceAction => ({ type: 'SELECT_JOURNAL', payload: entry });

// Ledger
export const loadLedgerSuccess = (entries: LedgerEntry[]):
  FinanceAction => ({ type: 'LOAD_LEDGER_SUCCESS', payload: entries });

// Trial Balance
export const loadTrialBalanceSuccess = (data: TrialBalanceSummary):
  FinanceAction => ({ type: 'LOAD_TRIAL_BALANCE_SUCCESS', payload: data });

// Dashboard
export const loadDashboardSuccess = (data: DashboardStats):
  FinanceAction => ({ type: 'LOAD_DASHBOARD_SUCCESS', payload: data });

// Reports
export const loadProfitLossSuccess = (data: ProfitLossReport):
  FinanceAction => ({ type: 'LOAD_PROFIT_LOSS_SUCCESS', payload: data });

export const loadBalanceSheetSuccess = (data: BalanceSheetReport):
  FinanceAction => ({ type: 'LOAD_BALANCE_SHEET_SUCCESS', payload: data });

export const loadCashFlowSuccess = (data: CashFlowReport):
  FinanceAction => ({ type: 'LOAD_CASH_FLOW_SUCCESS', payload: data });

// Filters
export const setFilter = (
  key: string,
  value: string
): FinanceAction => ({
  type:    'SET_FILTER',
  payload: { key, value }
});

export const resetFilters = ():
  FinanceAction => ({ type: 'RESET_FILTERS' });

export const setPage = (page: number):
  FinanceAction => ({ type: 'SET_PAGE', payload: page });