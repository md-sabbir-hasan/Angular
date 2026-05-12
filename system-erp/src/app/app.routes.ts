import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
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
                        .then(m => m.LoginComponent)
            },
            {
                path: 'register',
                loadComponent: () =>
                    import('./src/app/modules/auth/pages/register')
                        .then(m => m.RegisterComponent)
            },
            {
                path: 'forgot-password',
                loadComponent: () =>
                    import('./src/app/modules/auth/pages/forgot-password')
                        .then(m => m.ForgotPasswordComponent)
            }
        ]
    },
    {
        path: '',
        loadComponent: () =>
            import('./src/app/layout/main-layout')
                .then(m => m.MainLayoutComponent),
        children: [
            {
                path: '',
                redirectTo: 'finance/dashboard',
                pathMatch: 'full'
            },
            {
                path: 'finance',
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
                                .then(m => m.Dashboard)
                    },
                    {
                        path: 'chart-of-accounts',
                        loadComponent: () =>
                            import('./src/app/modules/finance/pages/chart-of-accounts')
                                .then(m => m.ChartOfAccounts)
                    },
                    {
                        path: 'journal-entry',
                        loadComponent: () =>
                            import('./src/app/modules/finance/pages/journal-entry')
                                .then(m => m.JournalEntry)
                    },
                    {
                        path: 'ledger',
                        loadComponent: () =>
                            import('./src/app/modules/finance/pages/ledger')
                                .then(m => m.Ledger)
                    },
                    {
                        path: 'trial-balance',
                        loadComponent: () =>
                            import('./src/app/modules/finance/pages/trial-balance')
                                .then(m => m.TrialBalance)
                    },
                    {
                        path: 'invoices',
                        loadComponent: () =>
                            import('./src/app/modules/finance/pages/invoices')
                                .then(m => m.Invoices)
                    },
                    {
                        path: 'expenses',
                        loadComponent: () =>
                            import('./src/app/modules/finance/pages/expenses')
                                .then(m => m.Expenses)
                    },
                    {
                        path: 'reports',
                        loadComponent: () =>
                            import('./src/app/modules/finance/pages/reports')
                                .then(m => m.Reports)
                    }
                ]
            },
            {
                path: 'inventory',
                loadComponent: () =>
                    import('./src/app/modules/inventory/pages/dashboard')
                        .then(m => m.Dashboard)
            },
            {
                path: 'sales',
                loadComponent: () =>
                    import('./src/app/modules/sales/pages/dashboard')
                        .then(m => m.Dashboard)
            },
            {
                path: 'hrm',
                loadComponent: () =>
                    import('./src/app/modules/hrm/pages/dashboard')
                        .then(m => m.Dashboard)
            },
            {
                path: 'crm',
                loadComponent: () =>
                    import('./src/app/modules/crm/pages/dashboard')
                        .then(m => m.Dashboard)
            },
            {
                path: 'settings',
                loadComponent: () =>
                    import('./src/app/modules/settings/pages/dashboard')
                        .then(m => m.Dashboard)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
