import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalList } from './journal-list';

describe('JournalList', () => {
  let component: JournalList;
  let fixture: ComponentFixture<JournalList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalList],
    }).compileComponents();

    fixture = TestBed.createComponent(JournalList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
