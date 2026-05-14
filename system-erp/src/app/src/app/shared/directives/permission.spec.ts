import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionDirective } from './permission';

@Component({
  standalone: true,
  imports: [PermissionDirective],
  template: `<div *appPermission="'admin'">Admin Content</div>`
})
class TestComponent {}

describe('PermissionDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toBeTruthy();
  });
});