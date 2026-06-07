import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account } from '../models/account.model';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';


@Component({
  selector: 'app-account-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './account-table.html',
  styleUrls: ['./account-table.css']
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