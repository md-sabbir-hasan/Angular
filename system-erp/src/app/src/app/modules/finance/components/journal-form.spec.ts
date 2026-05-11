import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalForm } from './journal-form';

describe('JournalForm', () => {
  let component: JournalForm;
  let fixture: ComponentFixture<JournalForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalForm],
    }).compileComponents();

    fixture = TestBed.createComponent(JournalForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
