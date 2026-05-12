import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FormInputComponent),
    multi: true
  }],
  template: `
    <div class="form-group" [class.has-error]="hasError">
      @if (label) {
        <label>
          {{ label }}
          @if (required) { <span class="required">*</span> }
        </label>
      }

      @if (type === 'select') {
        <select
          class="form-select"
          [disabled]="disabled"
          [(ngModel)]="value"
          (ngModelChange)="onChange($event)"
          (blur)="onTouched()">
          @if (placeholder) {
            <option value="">{{ placeholder }}</option>
          }
          @for (opt of options; track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
      } @else if (type === 'textarea') {
        <textarea
          class="form-control"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [rows]="rows"
          [(ngModel)]="value"
          (ngModelChange)="onChange($event)"
          (blur)="onTouched()">
        </textarea>
      } @else {
        <div [class.input-currency]="prefix">
          @if (prefix) {
            <span class="currency-prefix">{{ prefix }}</span>
          }
          <input
            class="form-control"
            [type]="type"
            [placeholder]="placeholder"
            [disabled]="disabled"
            [(ngModel)]="value"
            (ngModelChange)="onChange($event)"
            (blur)="onTouched()" />
        </div>
      }

      @if (hint && !hasError) {
        <div class="form-hint">{{ hint }}</div>
      }
      @if (hasError && errorMessage) {
        <div class="form-error">
          <i class="bi bi-exclamation-circle"></i>
          {{ errorMessage }}
        </div>
      }
    </div>
  `
})
export class FormInputComponent implements ControlValueAccessor {
  @Input() label        = '';
  @Input() type         = 'text';
  @Input() placeholder  = '';
  @Input() hint         = '';
  @Input() prefix       = '';
  @Input() required     = false;
  @Input() disabled     = false;
  @Input() hasError     = false;
  @Input() errorMessage = '';
  @Input() rows         = 3;
  @Input() options: { value: string; label: string }[] = [];

  value: unknown = '';

  onChange  = (_: unknown) => {};
  onTouched = () => {};

  writeValue(val: unknown): void      { this.value = val; }
  registerOnChange(fn: (v: unknown) => void): void  { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.disabled = disabled; }
}