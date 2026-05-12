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
  template: `
    <app-modal
      [isOpen]="isOpen"
      title="New Invoice"
      icon="bi-receipt"
      size="xl"
      [showFooter]="true"
      (closed)="onCancel()">

      <form (ngSubmit)="onSubmit()">

        <div class="row g-3 mb-16">

          <!-- Customer -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Customer <span class="required">*</span></label>
              <select
                class="form-select"
                [(ngModel)]="formData.customer_id"
                name="customer_id"
                required>
                <option value="">Select customer...</option>
                @for (p of customers; track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Currency -->
          <div class="col-md-3">
            <div class="form-group">
              <label>Currency</label>
              <select
                class="form-select"
                [(ngModel)]="formData.currency"
                name="currency">
                <option value="BDT">BDT (৳)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <!-- Invoice Date -->
          <div class="col-md-3">
            <div class="form-group">
              <label>Invoice Date <span class="required">*</span></label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="formData.invoice_date"
                name="invoice_date"
                required/>
            </div>
          </div>

          <!-- Due Date -->
          <div class="col-md-3">
            <div class="form-group">
              <label>Due Date <span class="required">*</span></label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="formData.due_date"
                name="due_date"
                required/>
            </div>
          </div>

          <!-- Discount -->
          <div class="col-md-3">
            <div class="form-group">
              <label>Discount (৳)</label>
              <input
                type="number"
                class="form-control"
                placeholder="0.00"
                [(ngModel)]="formData.discount_amount"
                name="discount_amount"
                min="0"
                (ngModelChange)="recalculate()"/>
            </div>
          </div>

        </div>

        <!-- Line Items -->
        <div class="form-group">
          <div class="d-flex justify-content-between align-items-center mb-8">
            <label class="mb-0">
              Invoice Items <span class="required">*</span>
            </label>
            <button
              type="button"
              class="btn-outline-erp btn-outline-erp--sm"
              (click)="addLine()">
              <i class="bi bi-plus"></i> Add Line
            </button>
          </div>

          <div class="table-wrapper">
            <table class="erp-table">
              <thead>
                <tr>
                  <th style="min-width:200px">Description</th>
                  <th style="width:80px">Qty</th>
                  <th style="width:120px">Unit Price (৳)</th>
                  <th style="width:80px">VAT %</th>
                  <th style="width:120px" class="text-right">Total (৳)</th>
                  <th style="width:50px"></th>
                </tr>
              </thead>
              <tbody>
                @for (line of formData.items; track $index; let i = $index) {
                  <tr>
                    <td>
                      <input
                        type="text"
                        class="form-control form-control-sm"
                        placeholder="Item description"
                        [(ngModel)]="line.description"
                        [name]="'desc_' + i"/>
                    </td>
                    <td>
                      <input
                        type="number"
                        class="form-control form-control-sm"
                        placeholder="1"
                        [(ngModel)]="line.quantity"
                        [name]="'qty_' + i"
                        min="0"
                        (ngModelChange)="recalculate()"/>
                    </td>
                    <td>
                      <input
                        type="number"
                        class="form-control form-control-sm"
                        placeholder="0.00"
                        [(ngModel)]="line.unit_price"
                        [name]="'price_' + i"
                        min="0"
                        (ngModelChange)="recalculate()"/>
                    </td>
                    <td>
                      <select
                        class="form-select form-select-sm"
                        [(ngModel)]="line.vat_rate"
                        [name]="'vat_' + i"
                        (ngModelChange)="recalculate()">
                        <option [value]="0">0%</option>
                        <option [value]="5">5%</option>
                        <option [value]="10">10%</option>
                        <option [value]="15">15%</option>
                      </select>
                    </td>
                    <td class="text-right">
                      <span class="col-amount">
                        ৳{{ getLineTotal(line) | number:'1.2-2' }}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        class="btn-icon btn-icon--danger"
                        [disabled]="formData.items.length === 1"
                        (click)="removeLine(i)">
                        <i class="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totals -->
        <div class="row justify-content-end mt-16">
          <div class="col-md-5">
            <div class="summary-box">
              <div class="summary-row">
                <span class="label">Subtotal</span>
                <span class="value">
                  ৳{{ subtotal() | number:'1.2-2' }}
                </span>
              </div>
              <div class="summary-row">
                <span class="label">Discount</span>
                <span class="value text-danger">
                  -৳{{ (formData.discount_amount || 0) | number:'1.2-2' }}
                </span>
              </div>
              <div class="summary-row">
                <span class="label">VAT</span>
                <span class="value">
                  ৳{{ vatTotal() | number:'1.2-2' }}
                </span>
              </div>
              <div class="summary-row summary-row--total">
                <span class="label">Total</span>
                <span class="value">
                  ৳{{ grandTotal() | number:'1.2-2' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="form-group mt-16">
          <label>Notes</label>
          <textarea
            class="form-control"
            placeholder="Payment terms, notes..."
            [(ngModel)]="formData.notes"
            name="notes"
            rows="2">
          </textarea>
        </div>

      </form>

      <!-- Footer -->
      <div slot="footer" class="d-flex gap-8 w-full">
        <button
          class="btn-outline-erp flex-1"
          (click)="onCancel()">
          <i class="bi bi-x"></i> Cancel
        </button>
        <button
          class="btn-primary-erp flex-1"
          [disabled]="loading() || !formData.customer_id"
          (click)="onSubmit()">
          @if (loading()) {
            <span class="spinner-sm"></span>
            Creating...
          } @else {
            <i class="bi bi-receipt"></i>
            Create Invoice
          }
        </button>
      </div>

    </app-modal>
  `,
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