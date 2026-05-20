import { Routes } from '@angular/router';
import { authGuard } from './src/app/core/guards/auth-guard';
import { roleGuard } from './src/app/core/guards/role-guard';

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
            canActivate: [roleGuard],
            data: { permission: 'dashboard:view' },
            title: 'Dashboard — FinanceERP'
          },
          {
            path: 'chart-of-accounts',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/chart-of-accounts')
                .then(m => m.ChartOfAccountsComponent),
            canActivate: [roleGuard],
            data: { permission: 'chart_of_accounts:view' },
            title: 'Chart of Accounts — FinanceERP'
          },
          {
            path: 'journal-entry',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/journal-entry')
                .then(m => m.JournalEntryComponent),
            canActivate: [roleGuard],
            data: { permission: 'journal:view' },
            title: 'Journal Entry — FinanceERP'
          },
          {
            path: 'ledger',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/ledger')
                .then(m => m.LedgerComponent),
            canActivate: [roleGuard],
            data: { permission: 'ledger:view' },
            title: 'Ledger — FinanceERP'
          },
          {
            path: 'trial-balance',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/trial-balance')
                .then(m => m.TrialBalanceComponent),
            canActivate: [roleGuard],
            data: { permission: 'trial_balance:view' },
            title: 'Trial Balance — FinanceERP'
          },
          {
            path: 'invoices',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/invoices')
                .then(m => m.InvoicesComponent),
            canActivate: [roleGuard],
            data: { permission: 'invoices:view' },
            title: 'Invoices — FinanceERP'
          },
          {
            path: 'expenses',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/expenses')
                .then(m => m.ExpensesComponent),
            canActivate: [roleGuard],
            data: { permission: 'expenses:view' },
            title: 'Expenses — FinanceERP'
          },
          {
            path: 'reports',
            loadComponent: () =>
              import('./src/app/modules/finance/pages/reports')
                .then(m => m.ReportsComponent),
            canActivate: [roleGuard],
            data: { permission: 'reports:view' },
            title: 'Reports — FinanceERP'
          }
        ]
      },

      {
        path: 'settings',
        canActivate: [authGuard, roleGuard],
        data: { permission: 'settings:view' },
        loadComponent: () =>
          import('./src/app/modules/settings/pages/dashboard')
            .then(m => m.DashboardComponent),
        title: 'Settings — FinanceERP'
      },
      {
        path: 'users',
        canActivate: [authGuard, roleGuard],
        data: { permission: 'users:view' },
        loadComponent: () =>
          import('./src/app/modules/settings/pages/dashboard') // Reusing dashboard for users mock
            .then(m => m.DashboardComponent),
        title: 'Users — FinanceERP'
      }
    ]
  },

  {
    path: 'access-denied',
    loadComponent: () => import('./src/app/shared/components/access-denied').then(m => m.AccessDeniedComponent),
    title: 'Access Denied — FinanceERP'
  },

  // ── Wildcard ─────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];