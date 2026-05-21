import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceChartComponent } from './finance-chart';

describe('FinanceChartComponent', () => {
  let component: FinanceChartComponent;
  let fixture: ComponentFixture<FinanceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
