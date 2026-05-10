import { Routes } from '@angular/router';
import { Dashboard } from './features/finance/dashboard/dashboard';
import { AccountsList } from './features/finance/accounts/accounts-list/accounts-list';
import { JournalList } from './features/finance/journals/journal-list/journal-list';
import { InvoiceList } from './features/finance/invoices/invoice-list/invoice-list';


export const routes: Routes = [
    {
    path: '',
    component: Dashboard
  },
  {
    path: 'accounts',
    component: AccountsList
  },
  {
    path: 'journals',
    component: JournalList
  },
  {
    path: 'invoices',
    component: InvoiceList
  }
];
