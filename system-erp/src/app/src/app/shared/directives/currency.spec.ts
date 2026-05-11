import { Currency } from './currency';

describe('Currency', () => {
  it('should create an instance', () => {
    const directive = new Currency();
    expect(directive).toBeTruthy();
  });
});
