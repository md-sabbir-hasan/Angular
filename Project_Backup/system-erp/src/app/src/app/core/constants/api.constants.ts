export const API_BASE = 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth
  USERS:           `${API_BASE}/users`,

  // Accounts
  ACCOUNTS:        `${API_BASE}/accounts`,

  // Journal
  JOURNAL_ENTRIES: `${API_BASE}/journal_entries`,
  JOURNAL_LINES:   `${API_BASE}/journal_lines`,

  // Parties
  PARTIES:         `${API_BASE}/parties`,

  // Invoices
  INVOICES:        `${API_BASE}/invoices`,
  INVOICE_ITEMS:   `${API_BASE}/invoice_items`,

  // Bills
  VENDOR_BILLS:    `${API_BASE}/vendor_bills`,

  // Bank
  BANK_ACCOUNTS:   `${API_BASE}/bank_accounts`,
  BANK_TRANSACTIONS: `${API_BASE}/bank_transactions`,

  // Payments
  PAYMENTS:        `${API_BASE}/payments`,

  // VAT
  VAT_ENTRIES:     `${API_BASE}/vat_entries`,
  TDS_ENTRIES:     `${API_BASE}/tds_entries`,

  // Expenses
  EXPENSE_CLAIMS:  `${API_BASE}/expense_claims`,

  // Ledger
  LEDGER_ENTRIES:  `${API_BASE}/ledger_entries`
};