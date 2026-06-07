import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTableComponent } from './account-table';

describe('AccountTableComponent', () => {
  let component: AccountTableComponent;
  let fixture: ComponentFixture<AccountTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
