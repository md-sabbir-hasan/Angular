export enum AppRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  SALES_MANAGER = 'SALES_MANAGER',
  VIEWER = 'VIEWER',
}

export enum AppPermission {
  DASHBOARD_VIEW = 'dashboard:view',
  
  INVOICES_VIEW = 'invoices:view',
  INVOICES_CREATE = 'invoices:create',
  INVOICES_EDIT = 'invoices:edit',
  INVOICES_DELETE = 'invoices:delete',
  
  EXPENSES_VIEW = 'expenses:view',
  EXPENSES_CREATE = 'expenses:create',
  EXPENSES_EDIT = 'expenses:edit',
  EXPENSES_DELETE = 'expenses:delete',
  
  JOURNAL_VIEW = 'journal:view',
  JOURNAL_CREATE = 'journal:create',
  JOURNAL_EDIT = 'journal:edit',
  JOURNAL_DELETE = 'journal:delete',
  
  LEDGER_VIEW = 'ledger:view',
  
  TRIAL_BALANCE_VIEW = 'trial_balance:view',
  
  REPORTS_VIEW = 'reports:view',
  REPORTS_FULL = 'reports:full',
  REPORTS_LIMITED = 'reports:limited',
  
  CHART_OF_ACCOUNTS_VIEW = 'chart_of_accounts:view',
  CHART_OF_ACCOUNTS_CREATE = 'chart_of_accounts:create',
  CHART_OF_ACCOUNTS_EDIT = 'chart_of_accounts:edit',
  CHART_OF_ACCOUNTS_DELETE = 'chart_of_accounts:delete',
  
  SETTINGS_VIEW = 'settings:view',
  USERS_VIEW = 'users:view',
}

export const ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  [AppRole.SUPER_ADMIN]: [
    AppPermission.DASHBOARD_VIEW,
    AppPermission.INVOICES_VIEW, AppPermission.INVOICES_CREATE, AppPermission.INVOICES_EDIT, AppPermission.INVOICES_DELETE,
    AppPermission.EXPENSES_VIEW, AppPermission.EXPENSES_CREATE, AppPermission.EXPENSES_EDIT, AppPermission.EXPENSES_DELETE,
    AppPermission.JOURNAL_VIEW, AppPermission.JOURNAL_CREATE, AppPermission.JOURNAL_EDIT, AppPermission.JOURNAL_DELETE,
    AppPermission.LEDGER_VIEW,
    AppPermission.TRIAL_BALANCE_VIEW,
    AppPermission.REPORTS_VIEW, AppPermission.REPORTS_FULL,
    AppPermission.CHART_OF_ACCOUNTS_VIEW, AppPermission.CHART_OF_ACCOUNTS_CREATE, AppPermission.CHART_OF_ACCOUNTS_EDIT, AppPermission.CHART_OF_ACCOUNTS_DELETE,
    AppPermission.SETTINGS_VIEW,
    AppPermission.USERS_VIEW,
  ],
  [AppRole.ACCOUNTANT]: [
    AppPermission.DASHBOARD_VIEW,
    AppPermission.INVOICES_VIEW, AppPermission.INVOICES_CREATE, AppPermission.INVOICES_EDIT, AppPermission.INVOICES_DELETE,
    AppPermission.EXPENSES_VIEW, AppPermission.EXPENSES_CREATE, AppPermission.EXPENSES_EDIT, AppPermission.EXPENSES_DELETE,
    AppPermission.JOURNAL_VIEW, AppPermission.JOURNAL_CREATE, AppPermission.JOURNAL_EDIT, AppPermission.JOURNAL_DELETE,
    AppPermission.LEDGER_VIEW,
    AppPermission.TRIAL_BALANCE_VIEW,
    AppPermission.REPORTS_VIEW, AppPermission.REPORTS_FULL,
    AppPermission.CHART_OF_ACCOUNTS_VIEW, AppPermission.CHART_OF_ACCOUNTS_EDIT,
  ],
  [AppRole.SALES_MANAGER]: [
    AppPermission.DASHBOARD_VIEW,
    AppPermission.INVOICES_VIEW, AppPermission.INVOICES_CREATE, AppPermission.INVOICES_EDIT,
    AppPermission.EXPENSES_VIEW, AppPermission.EXPENSES_CREATE, AppPermission.EXPENSES_EDIT,
    AppPermission.REPORTS_VIEW, AppPermission.REPORTS_LIMITED,
  ],
  [AppRole.VIEWER]: [
    AppPermission.DASHBOARD_VIEW,
    AppPermission.INVOICES_VIEW,
    AppPermission.EXPENSES_VIEW,
    AppPermission.REPORTS_VIEW,
  ],
};
