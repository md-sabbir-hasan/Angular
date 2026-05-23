import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appCurrency]',
  standalone: true
})
export class CurrencyDirective {

  constructor(
    private el: ElementRef<HTMLInputElement>
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {

    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/[^0-9.]/g, '');

    const parts = value.split('.');

    // Prevent multiple decimal points
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit decimal places to 2
    if (parts[1]?.length > 2) {
      value = parts[0] + '.' + parts[1].slice(0, 2);
    }

    input.value = value;
  }

  @HostListener('blur')
  onBlur(): void {

    const input = this.el.nativeElement;

    const num = parseFloat(input.value);

    if (!isNaN(num)) {
      input.value = num.toFixed(2);
    }
  }
}