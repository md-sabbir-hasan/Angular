import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal';
import { InvoiceFormData, InvoiceItemForm } from '../models/invoice.model';
import { calculateVat } from '../../../core/utils/currency.util';
import { today, addDays } from '../../../core/utils/date.util';

interface Party { id: string; name: string; }

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './invoice-form.html',
  styles: [`
    .mb-8  { margin-bottom: 8px; }
    .mb-16 { margin-bottom: 16px; }
    .mt-16 { margin-top: 16px; }
    .gap-8 { gap: 8px; }
    .flex-1 { flex: 1; }
    .text-danger { color: #991b1b; }
    .form-control-sm { padding: 5px 8px; font-size: 13px; }
    .form-select-sm  { padding: 5px 8px; font-size: 13px; }
  `]
})
export class InvoiceFormComponent implements OnInit {
  @Input() isOpen    = false;
  @Input() customers: Party[] = [];
  @Output() saved    = new EventEmitter<InvoiceFormData>();
  @Output() cancelled = new EventEmitter<void>();

  loading = signal(false);

  formData: InvoiceFormData = {
    customer_id:     '',
    invoice_date:    today(),
    due_date:        addDays(today(), 30),
    currency:        'BDT',
    discount_amount: 0,
    items:           [this.emptyLine()],
    notes:           ''
  };

  ngOnInit(): void {
    this.formData.invoice_date = today();
    this.formData.due_date     = addDays(today(), 30);
  }

  emptyLine(): InvoiceItemForm {
    return {
      description: '',
      quantity:    1,
      unit_price:  0,
      vat_rate:    15
    };
  }

  addLine(): void {
    this.formData.items.push(this.emptyLine());
  }

  removeLine(i: number): void {
    this.formData.items.splice(i, 1);
  }

  getLineTotal(line: InvoiceItemForm): number {
    const sub = (line.quantity || 0) * (line.unit_price || 0);
    const vat = calculateVat(sub, line.vat_rate || 0);
    return sub + vat;
  }

  subtotal(): number {
    return this.formData.items.reduce(
      (s, l) => s + (l.quantity || 0) * (l.unit_price || 0), 0
    );
  }

  vatTotal(): number {
    return this.formData.items.reduce(
      (s, l) => s + calculateVat(
        (l.quantity || 0) * (l.unit_price || 0),
        l.vat_rate || 0
      ), 0
    );
  }

  grandTotal(): number {
    return this.subtotal() -
      (this.formData.discount_amount || 0) +
      this.vatTotal();
  }

  recalculate(): void {
    // Trigger change detection
  }

  onSubmit(): void {
    if (!this.formData.customer_id) return;
    this.loading.set(true);
    this.saved.emit(this.formData);
    setTimeout(() => this.loading.set(false), 500);
  }

  onCancel(): void {
    this.cancelled.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.formData = {
      customer_id:     '',
      invoice_date:    today(),
      due_date:        addDays(today(), 30),
      currency:        'BDT',
      discount_amount: 0,
      items:           [this.emptyLine()],
      notes:           ''
    };
  }
}