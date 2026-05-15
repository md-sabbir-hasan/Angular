import { Routes } from '@angular/router';
import { authGuard } from './src/app/core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  // ── Auth routes ──────────────────────────────────────────
  {
    path: 'auth',
    loadComponent: () =>
      import('./src/app/layout/auth-layout')
        .then(m => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./src/app/modules/auth/pages/login')
            .then(m => m.LoginComponent),
        title: 'Login — FinanceERP'
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./src/app/modules/auth/pages/register')
            .then(m => m.RegisterComponent),
        title: 'Register — FinanceERP'
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./src/app/modules/auth/pages/forgot-password')
            .then(m => m.ForgotPasswordComponent),
        title: 'Forgot Password — FinanceERP'
      }
    ]
  },

  // ── Protected Main layout routes ─────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./src/app/layout/main-layout')
        .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'finance/dashboard',
        pathMatch: 'full'
      },

      // ── Finance ──────────────────────────────────────────
      {
        path: 'finance',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/dashboard')
                .then(m => m.DashboardComponent),
            title: 'Dashboard — FinanceERP'
          },
          {
            path: 'chart-of-accounts',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/chart-of-accounts')
                .then(m => m.ChartOfAccountsComponent),
            title: 'Chart of Accounts — FinanceERP'
          },
          {
            path: 'journal-entry',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/journal-entry')
                .then(m => m.JournalEntryComponent),
            title: 'Journal Entry — FinanceERP'
          },
          {
            path: 'ledger',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/ledger')
                .then(m => m.LedgerComponent),
            title: 'Ledger — FinanceERP'
          },
          {
            path: 'trial-balance',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/trial-balance')
                .then(m => m.TrialBalanceComponent),
            title: 'Trial Balance — FinanceERP'
          },
          {
            path: 'invoices',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/invoices')
                .then(m => m.InvoicesComponent),
            title: 'Invoices — FinanceERP'
          },
          {
            path: 'expenses',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/expenses')
                .then(m => m.ExpensesComponent),
            title: 'Expenses — FinanceERP'
          },
          {
            path: 'reports',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/reports')
                .then(m => m.ReportsComponent),
            title: 'Reports — FinanceERP'
          }
        ]
      },

      // ── Other modules ────────────────────────────────────
      {
        path: 'inventory',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./src/app/modules/inventory/pages/dashboard')
            .then(m => m.DashboardComponent),
        title: 'Inventory — FinanceERP'
      },
      {
        path: 'sales',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./src/app/modules/sales/pages/dashboard')
            .then(m => m.DashboardComponent),
        title: 'Sales — FinanceERP'
      },
      {
        path: 'hrm',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./src/app/modules/hrm/pages/dashboard')
            .then(m => m.DashboardComponent),
        title: 'HRM — FinanceERP'
      },
      {
        path: 'crm',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./src/app/modules/crm/pages/dashboard')
            .then(m => m.DashboardComponent),
        title: 'CRM — FinanceERP'
      },
      {
        path: 'settings',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./src/app/modules/settings/pages/dashboard')
            .then(m => m.DashboardComponent),
        title: 'Settings — FinanceERP'
      }
    ]
  },

  // ── Wildcard ─────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];