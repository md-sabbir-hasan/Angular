import { TestBed } from '@angular/core/testing';

import { Journals } from './journals';

describe('Journals', () => {
  let service: Journals;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Journals);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
