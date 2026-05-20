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
  templateUrl: './form-input.html',
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