import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bdtCurrency'
})
export class BdtCurrencyPipe implements PipeTransform {
  transform(value: number, decimals: number = 2): string {
    if (value === null || value === undefined) return '0.00 ৳';
    
    // Format with commas
    const formatted = value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formatted} ৳`;
  }
}