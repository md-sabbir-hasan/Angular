import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  Account,
  AccountFormData,
  AccountType,
  ACCOUNT_TYPE_LABELS,
} from '../models/account.model';
import { ModalComponent } from '../../../shared/components/modal';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  templateUrl: './account-form.html',
})
export class AccountFormComponent implements OnInit {
  @Input() isOpen = false;
  @Input() editAccount: Account | null = null;
  @Input() allAccounts: Account[] = [];
  @Output() saved = new EventEmitter<AccountFormData>();
  @Output() cancelled = new EventEmitter<void>();

  loading = signal(false);

  formData: AccountFormData = {
    code: '',
    name: '',
    type: 'asset',
    parent_id: null,
    is_active: true,
    description: '',
  };

  accountTypes = Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => ({
    value: value as AccountType,
    label,
  }));

  get parentAccounts(): Account[] {
    return this.allAccounts.filter((a) => a.id !== this.editAccount?.id);
  }

  ngOnInit(): void {
    if (this.editAccount) {
      this.formData = {
        code: this.editAccount.code,
        name: this.editAccount.name,
        type: this.editAccount.type,
        parent_id: this.editAccount.parent_id,
        is_active: this.editAccount.is_active,
        description: this.editAccount.description ?? '',
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
      code: '',
      name: '',
      type: 'asset',
      parent_id: null,
      is_active: true,
      description: '',
    };
  }
}
