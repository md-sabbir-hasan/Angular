export const APP_NAME    = 'FinanceERP';
export const APP_VERSION = '1.0.0';
export const CURRENCY    = 'BDT';
export const CURRENCY_SYMBOL = '৳';
export const VAT_RATE    = 15;
export const TDS_RATE    = 5;
export const DATE_FORMAT = 'dd MMM yyyy';
export const API_DATE_FORMAT = 'yyyy-MM-dd';

export const TOKEN_KEY   = 'finance_erp_token';
export const USER_KEY    = 'finance_erp_user';

export const ITEMS_PER_PAGE = 10;

export const PAYMENT_METHODS = [
  { value: 'cash',          label: 'Cash',          icon: 'bi-cash' },
  { value: 'bank_transfer', label: 'Bank Transfer',  icon: 'bi-bank' },
  { value: 'cheque',        label: 'Cheque',         icon: 'bi-file-text' },
  { value: 'bkash',         label: 'bKash',          icon: 'bi-phone' },
  { value: 'nagad',         label: 'Nagad',          icon: 'bi-phone' },
  { value: 'rocket',        label: 'Rocket',         icon: 'bi-phone' },
  { value: 'card',          label: 'Card',           icon: 'bi-credit-card' }
];

export const BD_BANKS = [
  'Dutch-Bangla Bank Ltd',
  'BRAC Bank Ltd',
  'Islami Bank Bangladesh',
  'Eastern Bank Ltd',
  'Prime Bank Ltd',
  'Dhaka Bank Ltd',
  'Southeast Bank Ltd',
  'Mutual Trust Bank',
  'City Bank Ltd',
  'Standard Chartered Bangladesh'
];

export const VAT_MUSAK_FORMS = [
  { value: '6.3', label: 'Mushak 6.3 — Tax Invoice' },
  { value: '6.7', label: 'Mushak 6.7 — Purchase' },
  { value: '9.1', label: 'Mushak 9.1 — VAT Return' }
];

export const TDS_SECTIONS = [
  { value: 'Section 52',  label: 'Section 52 — Supply of goods' },
  { value: 'Section 53',  label: 'Section 53 — Service' },
  { value: 'Section 52A', label: 'Section 52A — Import' }
];