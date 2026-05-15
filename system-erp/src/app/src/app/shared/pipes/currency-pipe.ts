import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '../../core/utils/currency.util';

@Pipe({
  name: 'bdtCurrency',
  standalone: true
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined) return '৳0.00';
    return formatCurrency(value, '৳', decimals);
  }
  
}