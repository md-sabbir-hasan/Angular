import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/home', 
    pathMatch: 'full' 
  },
  { 
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  { 
    path: 'accounting/chart-of-accounts',
    loadComponent: () => import('./pages/accounting/chart-of-accounts/chart-of-accounts.component')
      .then(m => m.ChartOfAccountsComponent)
  },
  { 
    path: 'accounting/journal-vouchers',
    loadComponent: () => import('./pages/accounting/journal-voucher/journal-voucher.component')
      .then(m => m.JournalVoucherComponent)
  },
  { 
    path: '**', 
    redirectTo: '/home' 
  }
];