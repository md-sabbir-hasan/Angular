import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '../../core/utils/currency.util';

@Pipe({
  name: 'bdtCurrency',
  standalone: true
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || value === '') return '৳0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '৳0.00';
    return formatCurrency(numValue, '৳', decimals);
  }
  
}