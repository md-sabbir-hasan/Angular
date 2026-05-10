import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalCreate } from './journal-create';

describe('JournalCreate', () => {
  let component: JournalCreate;
  let fixture: ComponentFixture<JournalCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(JournalCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
