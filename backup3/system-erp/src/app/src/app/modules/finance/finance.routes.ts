import { Routes } from '@angular/router';

export const financeRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard')
        .then(m => m.DashboardComponent),
    title: 'Dashboard — FinanceERP'
  },
  {
    path: 'chart-of-accounts',
    loadComponent: () =>
      import('./pages/chart-of-accounts')
        .then(m => m.ChartOfAccountsComponent),
    title: 'Chart of Accounts — FinanceERP'
  },
  {
    path: 'journal-entry',
    loadComponent: () =>
      import('./pages/journal-entry')
        .then(m => m.JournalEntryComponent),
    title: 'Journal Entry — FinanceERP'
  },
  {
    path: 'ledger',
    loadComponent: () =>
      import('./pages/ledger')
        .then(m => m.LedgerComponent),
    title: 'Ledger — FinanceERP'
  },
  {
    path: 'trial-balance',
    loadComponent: () =>
      import('./pages/trial-balance')
        .then(m => m.TrialBalanceComponent),
    title: 'Trial Balance — FinanceERP'
  },
  {
    path: 'invoices',
    loadComponent: () =>
      import('./pages/invoices')
        .then(m => m.InvoicesComponent),
    title: 'Invoices — FinanceERP'
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./pages/expenses')
        .then(m => m.ExpensesComponent),
    title: 'Expenses — FinanceERP'
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports')
        .then(m => m.ReportsComponent),
    title: 'Reports — FinanceERP'
  }
];