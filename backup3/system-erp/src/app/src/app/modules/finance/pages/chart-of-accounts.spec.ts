import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartOfAccountsComponent } from './chart-of-accounts';

describe('ChartOfAccountsComponent', () => {
  let component: ChartOfAccountsComponent;
  let fixture: ComponentFixture<ChartOfAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartOfAccountsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartOfAccountsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
