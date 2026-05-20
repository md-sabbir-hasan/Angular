export type Role = 'admin' | 'accountant' | 'manager' | 'viewer';

export const ROLES: Record<Role, string> = {
  admin:      'Administrator',
  accountant: 'Accountant',
  manager:    'Manager',
  viewer:     'Viewer'
};

export const ROLE_COLORS: Record<Role, string> = {
  admin:      'primary',
  accountant: 'info',
  manager:    'warning',
  viewer:     'secondary'
};

export const PROTECTED_ROUTES: Record<Role, string[]> = {
  admin: ['*'],
  manager: [
    'finance/dashboard',
    'finance/invoices',
    'finance/expenses',
    'finance/reports'
  ],
  accountant: [
    'finance/dashboard',
    'finance/chart-of-accounts',
    'finance/journal-entry',
    'finance/ledger',
    'finance/trial-balance',
    'finance/invoices',
    'finance/expenses',
    'finance/reports'
  ],
  viewer: [
    'finance/dashboard',
    'finance/reports'
  ]
};