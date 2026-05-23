import { CURRENCY_SYMBOL } from '../constants/app.constants';

export function formatCurrency(
  amount: number,
  symbol: string = CURRENCY_SYMBOL,
  decimals: number = 2
): string {
  if (isNaN(amount)) return `${symbol}0.00`;
  return `${symbol}${amount.toLocaleString('en-BD', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
}

export function calculateVat(amount: number, rate: number = 15): number {
  return Math.round((amount * rate / 100) * 100) / 100;
}

export function calculateTds(amount: number, rate: number = 5): number {
  return Math.round((amount * rate / 100) * 100) / 100;
}

export function calculateLineTotal(
  qty: number,
  unitPrice: number,
  vatRate: number = 15,
  discount: number = 0
): { subtotal: number; vatAmount: number; total: number } {
  const subtotal   = qty * unitPrice - discount;
  const vatAmount  = calculateVat(subtotal, vatRate);
  const total      = subtotal + vatAmount;
  return { subtotal, vatAmount, total };
}