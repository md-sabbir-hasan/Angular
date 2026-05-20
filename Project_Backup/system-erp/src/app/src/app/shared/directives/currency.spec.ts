import { ElementRef } from '@angular/core';

import { CurrencyDirective } from './currency';

describe('CurrencyDirective', () => {
  it('should create an instance', () => {

    const mockElementRef = new ElementRef(
      document.createElement('input')
    );

    const directive = new CurrencyDirective(mockElementRef);

    expect(directive).toBeTruthy();
  });
});