import { Component, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal';
import { JournalFormData, JournalLineForm, JOURNAL_TYPE_LABELS, JournalType } from '../models/journal-entry.model';
import { Account } from '../models/account.model';
import { journalIsBalanced } from '../../../core/utils/validation.util';
import { today } from '../../../core/utils/date.util';

@Component({
  selector: 'app-journal-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      title="New Journal Entry"
      icon="bi-journal-text"
      size="xl"
      [showFooter]="true"
      (closed)="onCancel()">

      <form (ngSubmit)="onSubmit('draft')">

        <div class="row g-3 mb-16">

          <!-- Date -->
          <div class="col-md-3">
            <div class="form-group">
              <label>Entry Date <span class="required">*</span></label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="formData.entry_date"
                name="entry_date"
                required/>
            </div>
          </div>

          <!-- Type -->
          <div class="col-md-3">
            <div class="form-group">
              <label>Journal Type</label>
              <select
                class="form-select"
                [(ngModel)]="formData.type"
                name="type">
                @for (t of journalTypes; track t.value) {
                  <option [value]="t.value">{{ t.label }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Narration -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Narration <span class="required">*</span></label>
              <input
                type="text"
                class="form-control"
                placeholder="Description of this journal entry"
                [(ngModel)]="formData.narration"
                name="narration"
                required/>
            </div>
          </div>

        </div>

        <!-- Journal Lines -->
        <div class="form-group">
          <div class="d-flex justify-content-between align-items-center mb-8">
            <label class="mb-0">
              Debit / Credit Lines
              <span class="required">*</span>
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
                  <th style="min-width:220px">Account</th>
                  <th style="width:140px" class="text-right">
                    Debit (৳)
                  </th>
                  <th style="width:140px" class="text-right">
                    Credit (৳)
                  </th>
                  <th style="min-width:160px">Narration</th>
                  <th style="width:50px"></th>
                </tr>
              </thead>
              <tbody>
                @for (line of formData.lines; track $index; let i = $index) {
                  <tr>
                    <td>
                      <select
                        class="form-select form-select-sm"
                        [(ngModel)]="line.account_id"
                        [name]="'account_' + i">
                        <option value="">Select account...</option>
                        @for (acc of accounts; track acc.id) {
                          <option [value]="acc.id">
                            {{ acc.code }} — {{ acc.name }}
                          </option>
                        }
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        class="form-control form-control-sm text-right"
                        placeholder="0.00"
                        [(ngModel)]="line.debit"
                        [name]="'debit_' + i"
                        min="0"
                        (ngModelChange)="onDebitChange(i)"/>
                    </td>
                    <td>
                      <input
                        type="number"
                        class="form-control form-control-sm text-right"
                        placeholder="0.00"
                        [(ngModel)]="line.credit"
                        [name]="'credit_' + i"
                        min="0"
                        (ngModelChange)="onCreditChange(i)"/>
                    </td>
                    <td>
                      <input
                        type="text"
                        class="form-control form-control-sm"
                        placeholder="Line note"
                        [(ngModel)]="line.narration"
                        [name]="'narration_' + i"/>
                    </td>
                    <td>
                      <button
                        type="button"
                        class="btn-icon btn-icon--danger"
                        [disabled]="formData.lines.length <= 2"
                        (click)="removeLine(i)">
                        <i class="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <td>
                    <strong>Totals</strong>
                  </td>
                  <td class="text-right">
                    <strong class="text-mono">
                      ৳{{ totalDebit() | number:'1.2-2' }}
                    </strong>
                  </td>
                  <td class="text-right">
                    <strong class="text-mono">
                      ৳{{ totalCredit() | number:'1.2-2' }}
                    </strong>
                  </td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Balance indicator -->
          <div
            class="balance-indicator mt-8"
            [ngClass]="isBalanced() ? 'balanced' : 'unbalanced'">
            <span>
              <i class="bi"
                [ngClass]="isBalanced()
                  ? 'bi-check-circle-fill'
                  : 'bi-exclamation-triangle-fill'">
              </i>
              {{ isBalanced()
                ? 'Entry is balanced ✓'
                : 'Entry is NOT balanced — Debit must equal Credit'
              }}
            </span>
            @if (!isBalanced()) {
              <span class="text-mono">
                Difference:
                ৳{{ difference() | number:'1.2-2' }}
              </span>
            }
          </div>
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
          class="btn-success-erp flex-1"
          [disabled]="loading() || !isBalanced()"
          (click)="onSubmit('draft')">
          <i class="bi bi-floppy"></i> Save Draft
        </button>
        <button
          class="btn-primary-erp flex-1"
          [disabled]="loading() || !isBalanced()"
          (click)="onSubmit('posted')">
          @if (loading()) {
            <span class="spinner-sm"></span>
            Posting...
          } @else {
            <i class="bi bi-send-check"></i>
            Post Entry
          }
        </button>
      </div>

    </app-modal>
  `,
  styles: [`
    .mb-8  { margin-bottom: 8px; }
    .mb-16 { margin-bottom: 16px; }
    .mt-8  { margin-top: 8px; }
    .gap-8 { gap: 8px; }
    .flex-1 { flex: 1; }
    .text-right { text-align: right; }
    .form-control-sm { padding: 5px 8px; font-size: 13px; }
    .form-select-sm  { padding: 5px 8px; font-size: 13px; }
    tfoot td {
      padding: 10px 14px;
      background: #f8fafc;
      border-top: 2px solid #e2e8f0;
    }
    .balance-indicator {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
    }
    .balance-indicator.balanced {
      background: #dcfce7;
      color: #166534;
    }
    .balance-indicator.unbalanced {
      background: #fee2e2;
      color: #991b1b;
    }
    .btn-success-erp {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 18px;
      background: #dcfce7;
      color: #166534;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all .15s;
      &:hover { background: #bbf7d0; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
  `]
})
export class JournalFormComponent implements OnInit {
  @Input() isOpen    = false;
  @Input() accounts: Account[] = [];
  @Output() saved    = new EventEmitter<JournalFormData & { status: string }>();
  @Output() cancelled = new EventEmitter<void>();

  loading = signal(false);

  journalTypes = Object.entries(JOURNAL_TYPE_LABELS).map(
    ([value, label]) => ({ value: value as JournalType, label })
  );

  formData: JournalFormData = {
    entry_date: today(),
    type:       'general',
    narration:  '',
    lines:      [this.emptyLine(), this.emptyLine()]
  };

  ngOnInit(): void {
    this.formData.entry_date = today();
  }

  emptyLine(): JournalLineForm {
    return { account_id: '', debit: 0, credit: 0, narration: '' };
  }

  addLine(): void {
    this.formData.lines.push(this.emptyLine());
  }

  removeLine(i: number): void {
    if (this.formData.lines.length > 2) {
      this.formData.lines.splice(i, 1);
    }
  }

  onDebitChange(i: number): void {
    if (this.formData.lines[i].debit > 0) {
      this.formData.lines[i].credit = 0;
    }
  }

  onCreditChange(i: number): void {
    if (this.formData.lines[i].credit > 0) {
      this.formData.lines[i].debit = 0;
    }
  }

  totalDebit(): number {
    return this.formData.lines.reduce(
      (s, l) => s + (l.debit || 0), 0
    );
  }

  totalCredit(): number {
    return this.formData.lines.reduce(
      (s, l) => s + (l.credit || 0), 0
    );
  }

  isBalanced(): boolean {
    return this.totalDebit() > 0 &&
      journalIsBalanced(this.formData.lines);
  }

  difference(): number {
    return Math.abs(this.totalDebit() - this.totalCredit());
  }

  onSubmit(status: string): void {
    if (!this.isBalanced()) return;
    this.loading.set(true);
    this.saved.emit({ ...this.formData, status });
    setTimeout(() => this.loading.set(false), 500);
  }

  onCancel(): void {
    this.cancelled.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.formData = {
      entry_date: today(),
      type:       'general',
      narration:  '',
      lines:      [this.emptyLine(), this.emptyLine()]
    };
  }
}