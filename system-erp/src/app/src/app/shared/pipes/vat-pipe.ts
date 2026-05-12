import { Pipe, PipeTransform } from '@angular/core';
import { calculateVat } from '../../core/utils/currency.util';

@Pipe({
  name: 'vatAmount',
  standalone: true
})
export class VatPipe implements PipeTransform {
  transform(amount: number, rate: number = 15): number {
    return calculateVat(amount, rate);
  }
}