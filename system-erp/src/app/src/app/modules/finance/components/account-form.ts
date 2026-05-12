import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Account, AccountFormData, AccountType, ACCOUNT_TYPE_LABELS } from '../models/account.model';
import { ModalComponent } from '../../../shared/components/modal';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="editAccount ? 'Edit Account' : 'New Account'"
      icon="bi-diagram-3"
      size="md"
      [showFooter]="true"
      (closed)="onCancel()">

      <form (ngSubmit)="onSubmit()" #form="ngForm">

        <!-- Account Code -->
        <div class="form-group">
          <label>Account Code <span class="required">*</span></label>
          <input
            type="text"
            class="form-control"
            placeholder="e.g. 1001"
            [(ngModel)]="formData.code"
            name="code"
            required/>
          <div class="form-hint">
            Use standard chart of accounts numbering
          </div>
        </div>

        <!-- Account Name -->
        <div class="form-group">
          <label>Account Name <span class="required">*</span></label>
          <input
            type="text"
            class="form-control"
            placeholder="e.g. Cash in Hand"
            [(ngModel)]="formData.name"
            name="name"
            required/>
        </div>

        <!-- Account Type -->
        <div class="form-group">
          <label>Account Type <span class="required">*</span></label>
          <select
            class="form-select"
            [(ngModel)]="formData.type"
            name="type"
            required>
            <option value="">Select type...</option>
            @for (type of accountTypes; track type.value) {
              <option [value]="type.value">{{ type.label }}</option>
            }
          </select>
        </div>

        <!-- Parent Account -->
        <div class="form-group">
          <label>Parent Account</label>
          <select
            class="form-select"
            [(ngModel)]="formData.parent_id"
            name="parent_id">
            <option [value]="null">None (Top Level)</option>
            @for (acc of parentAccounts; track acc.id) {
              <option [value]="acc.id">
                {{ acc.code }} — {{ acc.name }}
              </option>
            }
          </select>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label>Description</label>
          <textarea
            class="form-control"
            placeholder="Optional description..."
            [(ngModel)]="formData.description"
            name="description"
            rows="2">
          </textarea>
        </div>

        <!-- Active Status -->
        <div class="form-group">
          <label class="form-check-erp">
            <input
              type="checkbox"
              [(ngModel)]="formData.is_active"
              name="is_active"/>
            <span>Account is Active</span>
          </label>
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
          [disabled]="loading()"
          (click)="onSubmit()">
          @if (loading()) {
            <span class="spinner-sm"></span>
            Saving...
          } @else {
            <i class="bi bi-check-lg"></i>
            {{ editAccount ? 'Update' : 'Create' }} Account
          }
        </button>
      </div>

    </app-modal>
  `
})
export class AccountFormComponent implements OnInit {
  @Input() isOpen       = false;
  @Input() editAccount: Account | null = null;
  @Input() allAccounts: Account[]      = [];
  @Output() saved       = new EventEmitter<AccountFormData>();
  @Output() cancelled   = new EventEmitter<void>();

  loading = signal(false);

  formData: AccountFormData = {
    code:        '',
    name:        '',
    type:        'asset',
    parent_id:   null,
    is_active:   true,
    description: ''
  };

  accountTypes = Object.entries(ACCOUNT_TYPE_LABELS).map(
    ([value, label]) => ({ value: value as AccountType, label })
  );

  get parentAccounts(): Account[] {
    return this.allAccounts.filter(
      a => a.id !== this.editAccount?.id
    );
  }

  ngOnInit(): void {
    if (this.editAccount) {
      this.formData = {
        code:        this.editAccount.code,
        name:        this.editAccount.name,
        type:        this.editAccount.type,
        parent_id:   this.editAccount.parent_id,
        is_active:   this.editAccount.is_active,
        description: this.editAccount.description ?? ''
      };
    }
  }

  onSubmit(): void {
    if (!this.formData.code || !this.formData.name || !this.formData.type) {
      return;
    }
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
      code:        '',
      name:        '',
      type:        'asset',
      parent_id:   null,
      is_active:   true,
      description: ''
    };
  }
}