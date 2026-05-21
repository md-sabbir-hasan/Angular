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
  templateUrl: './journal-form.html',
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