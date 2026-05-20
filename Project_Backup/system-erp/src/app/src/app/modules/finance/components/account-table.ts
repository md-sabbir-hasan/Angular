import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account } from '../models/account.model';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';


@Component({
  selector: 'app-account-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './account-table.html',
  styles: [`
    .account-name { font-size: 13.5px; font-weight: 500; color: #0f172a; }
    .account-desc { font-size: 11.5px; color: #94a3b8; margin-top: 2px; }
    .text-success { color: #166534 !important; }
    .text-danger  { color: #991b1b !important; }
  `]
})
export class AccountTableComponent {
  @Input() accounts: Account[] = [];
  @Input() loading             = false;
  @Output() edit   = new EventEmitter<Account>();
  @Output() delete = new EventEmitter<Account>();

  isCredit(type: string): boolean {
    return ['liability', 'equity', 'revenue'].includes(type);
  }
}