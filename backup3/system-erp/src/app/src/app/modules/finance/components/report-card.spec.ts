import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCardComponent } from './report-card';

describe('ReportCardComponent', () => {
  let component: ReportCardComponent;
  let fixture: ComponentFixture<ReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
