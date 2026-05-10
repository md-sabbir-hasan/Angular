export interface Voucher {
  id?: number;
  voucherNo: string;
  voucherType: VoucherType;
  date: string;
  narration: string;
  totalAmount: number;
  createdBy: string;
  status: VoucherStatus;
  voucherLines: VoucherLine[];
  createdAt: string;
  tags?: string[];
  projectId?: number;
  departmentId?: number;
}

export interface VoucherLine {
  id?: number;
  accountId: number;
  accountName: string;
  accountCode: string;
  debit: number;
  credit: number;
  narration: string;
  tags?: string[];
}

export type VoucherType = 'Journal' | 'Receipt' | 'Payment' | 'Sales' | 'Purchase' | 'Contra';
export type VoucherStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export const VOUCHER_TYPES = ['Journal', 'Receipt', 'Payment', 'Sales', 'Purchase', 'Contra'];