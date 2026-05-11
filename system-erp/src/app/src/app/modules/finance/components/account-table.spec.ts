import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTable } from './account-table';

describe('AccountTable', () => {
  let component: AccountTable;
  let fixture: ComponentFixture<AccountTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountTable],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
