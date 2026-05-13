import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { LedgerService } from '../services/ledger';
import { AccountService } from '../services/account';
import { Account } from '../models/account.model';
import { LedgerEntry } from '../models/ledger.model';
import { formatDate } from '../../../core/utils/date.util';


@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    CurrencyPipe
  ],
  template: `
    <div class="fade-in">

      <!-- Page Header -->
      <app-page-header
        title="General Ledger"
        subtitle="Account-wise transaction history"
        [breadcrumbs]="[
          { label: 'Finance', route: '/finance/dashboard' },
          { label: 'Ledger' }
        ]">
        <button
          class="btn-outline-erp"
          (click)="exportLedger()">
          <i class="bi bi-download"></i>
          Export
        </button>
      </app-page-header>

      <!-- Filter Card -->
      <div class="erp-card mb-16">
        <div class="erp-card__body">
          <div class="filter-bar">
            <div class="filter-bar__left">

              <!-- Account selector -->
              <div class="form-group mb-0">
                <select
                  class="form-select"
                  style="width:260px;height:36px"
                  [(ngModel)]="selectedAccountId"
                  (ngModelChange)="onAccountChange()">
                  <option value="">Select account to view...</option>
                  @for (acc of accounts(); track acc.id) {
                    <option [value]="acc.id">
                      {{ acc.code }} — {{ acc.name }}
                    </option>
                  }
                </select>
              </div>

              <input
                type="date"
                class="form-control"
                style="width:150px;height:36px"
                [(ngModel)]="fromDate"
                (ngModelChange)="applyFilters()"/>

              <input
                type="date"
                class="form-control"
                style="width:150px;height:36px"
                [(ngModel)]="toDate"
                (ngModelChange)="applyFilters()"/>

            </div>
            <div class="filter-bar__right">
              @if (selectedAccountId) {
                <button
                  class="btn-outline-erp btn-outline-erp--sm"
                  (click)="resetFilters()">
                  <i class="bi bi-x-circle"></i>
                  Clear
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Account Summary Card -->
      @if (selectedAccount()) {
        <div class="erp-card mb-16">
          <div class="erp-card__body">
            <div class="ledger-summary">
              <div class="ls-item">
                <div class="ls-label">Account</div>
                <div class="ls-value primary">
                  {{ selectedAccount()!.code }}
                  — {{ selectedAccount()!.name }}
                </div>
              </div>
              <div class="ls-item">
                <div class="ls-label">Type</div>
                <span
                  class="badge-type"
                  [ngClass]="selectedAccount()!.type">
                  {{ selectedAccount()!.type | titlecase }}
                </span>
              </div>
              <div class="ls-item">
                <div class="ls-label">Total Debit</div>
                <div class="ls-value success">
                  {{ totalDebit() | bdtCurrency }}
                </div>
              </div>
              <div class="ls-item">
                <div class="ls-label">Total Credit</div>
                <div class="ls-value primary">
                  {{ totalCredit() | bdtCurrency }}
                </div>
              </div>
              <div class="ls-item">
                <div class="ls-label">Net Balance</div>
                <div
                  class="ls-value"
                  [class.success]="netBalance() >= 0"
                  [class.danger]="netBalance() < 0">
                  {{ netBalance() | bdtCurrency }}
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Ledger Table -->
      <div class="erp-card">
        @if (!selectedAccountId) {
          <div class="table-empty">
            <i class="bi bi-book"></i>
            <p>Select an account to view its ledger</p>
            <small>
              Choose from the dropdown above
            </small>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="erp-table ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Journal Ref</th>
                  <th class="text-right">Debit (৳)</th>
                  <th class="text-right">Credit (৳)</th>
                  <th class="text-right">Balance (৳)</th>
                </tr>
              </thead>
              <tbody>
                <!-- Opening balance row -->
                <tr class="opening-row">
                  <td colspan="3">
                    <strong>Opening Balance</strong>
                  </td>
                  <td></td>
                  <td></td>
                  <td class="text-right">
                    <strong class="text-mono">৳0.00</strong>
                  </td>
                </tr>

                @if (loading()) {
                  @for (i of [1,2,3,4,5]; track i) {
                    <tr>
                      @for (j of [1,2,3,4,5,6]; track j) {
                        <td>
                          <div class="skeleton"
                            style="height:14px;border-radius:4px">
                          </div>
                        </td>
                      }
                    </tr>
                  }
                } @else if (filteredEntries().length === 0) {
                  <tr>
                    <td colspan="6">
                      <div class="table-empty">
                        <i class="bi bi-inbox"></i>
                        <p>No transactions found</p>
                      </div>
                    </td>
                  </tr>
                } @else {
                  @for (
                    entry of filteredEntries();
                    track entry.id;
                    let i = $index
                  ) {
                    <tr
                      [class.debit-row]="entry.debit > 0"
                      [class.credit-row]="entry.credit > 0">
                      <td>
                        <span class="col-date">
                          {{ formatDate(entry.date) }}
                        </span>
                      </td>
                      <td>
                        <span style="font-size:13.5px">
                          {{ entry.description }}
                        </span>
                      </td>
                      <td>
                        <span class="col-code">
                          {{ entry.journal_entry_id }}
                        </span>
                      </td>
                      <td class="text-right">
                        @if (entry.debit > 0) {
                          <span class="col-amount text-success-color">
                            {{ entry.debit | bdtCurrency }}
                          </span>
                        }
                      </td>
                      <td class="text-right">
                        @if (entry.credit > 0) {
                          <span class="col-amount text-primary-color">
                            {{ entry.credit | bdtCurrency }}
                          </span>
                        }
                      </td>
                      <td class="text-right">
                        <span class="col-amount balance-col">
                          {{ getRunningBalance(i) | bdtCurrency }}
                        </span>
                      </td>
                    </tr>
                  }
                }

                <!-- Closing balance -->
                @if (filteredEntries().length > 0) {
                  <tr class="closing-row">
                    <td colspan="3">
                      <strong>Closing Balance</strong>
                    </td>
                    <td class="text-right">
                      <strong class="text-mono text-success-color">
                        {{ totalDebit() | bdtCurrency }}
                      </strong>
                    </td>
                    <td class="text-right">
                      <strong class="text-mono text-primary-color">
                        {{ totalCredit() | bdtCurrency }}
                      </strong>
                    </td>
                    <td class="text-right">
                      <strong class="text-mono">
                        {{ netBalance() | bdtCurrency }}
                      </strong>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .mb-16 { margin-bottom: 16px; }
    .mb-0  { margin-bottom: 0; }
    .text-right { text-align: right; }
    .text-success-color { color: #166534; }
    .text-primary-color { color: #2563a8; }

    .ledger-summary {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    .ls-item { min-width: 120px; }

    .ls-label {
      font-size: 10px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .ls-value {
      font-family: 'DM Mono', monospace;
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;

      &.primary { color: #2563a8; }
      &.success { color: #166534; }
      &.danger  { color: #991b1b; }
    }

    .opening-row td,
    .closing-row td {
      background: #f8fafc;
      font-weight: 600;
      border-top: 2px solid #e2e8f0;
      padding: 10px 14px;
    }

    .opening-row td { border-top: none; border-bottom: 1px solid #e2e8f0; }

    .debit-row td  { background: rgba(220,252,231,0.2); }
    .credit-row td { background: rgba(224,242,254,0.2); }
    .balance-col   { font-weight: 600; color: #0f172a; }
  `]
})
export class LedgerComponent implements OnInit {
  private ledgerService  = inject(LedgerService);
  private accountService = inject(AccountService);

  loading           = signal(false);
  accounts          = signal<Account[]>([]);
  entries           = signal<LedgerEntry[]>([]);
  selectedAccountId = '';
  fromDate          = '';
  toDate            = '';

  formatDate = formatDate;

  selectedAccount = computed(() =>
    this.accounts().find(a => a.id === this.selectedAccountId) ?? null
  );

  filteredEntries = computed(() => {
    let list = this.entries();

    if (this.fromDate) {
      list = list.filter(e => e.date >= this.fromDate);
    }

    if (this.toDate) {
      list = list.filter(e => e.date <= this.toDate);
    }

    return list.sort((a, b) => a.date.localeCompare(b.date));
  });

  totalDebit = computed(() =>
    this.filteredEntries().reduce((s, e) => s + e.debit, 0)
  );

  totalCredit = computed(() =>
    this.filteredEntries().reduce((s, e) => s + e.credit, 0)
  );

  netBalance = computed(() =>
    this.totalDebit() - this.totalCredit()
  );

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAll().subscribe({
      next: (data) => this.accounts.set(data)
    });
  }

  onAccountChange(): void {
    if (!this.selectedAccountId) {
      this.entries.set([]);
      return;
    }

    this.loading.set(true);
    this.ledgerService
      .getByAccount(this.selectedAccountId)
      .subscribe({
        next:  (data) => {
          this.entries.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  applyFilters(): void {}

  resetFilters(): void {
    this.selectedAccountId = '';
    this.fromDate          = '';
    this.toDate            = '';
    this.entries.set([]);
  }

  getRunningBalance(index: number): number {
    const entries = this.filteredEntries();
    let balance   = 0;
    for (let i = 0; i <= index; i++) {
      balance += entries[i].debit - entries[i].credit;
    }
    return balance;
  }

  exportLedger(): void {
    if (!this.selectedAccountId) return;

    const acc  = this.selectedAccount();
    const data = this.filteredEntries();
    const csv  = [
      ['Date','Description','Journal Ref','Debit','Credit','Balance'].join(','),
      ...data.map((e, i) => [
        e.date,
        `"${e.description}"`,
        e.journal_entry_id,
        e.debit,
        e.credit,
        this.getRunningBalance(i)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `ledger-${acc?.code ?? 'account'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}