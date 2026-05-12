export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export interface Invoice {
  id: string;
  tenant_id: string;
  invoice_number: string;
  customer_id: string;
  customer_name?: string;
  invoice_date: string;
  due_date: string;
  status: InvoiceStatus;
  currency: string;
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  vat_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due?: number;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  vat_amount: number;
  line_total: number;
}

export interface InvoiceFormData {
  customer_id: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  items: InvoiceItemForm[];
  discount_amount: number;
  notes?: string;
}

export interface InvoiceItemForm {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  partial: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled'
};