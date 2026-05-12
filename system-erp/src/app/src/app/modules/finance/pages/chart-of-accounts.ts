import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { AccountFormComponent } from '../components/account-form';
import { AccountTableComponent } from '../components/account-table';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { AccountService } from '../services/account';
import { Account, AccountFormData } from '../models/account.model';


@Component({
  selector: 'app-chart-of-accounts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    AccountFormComponent,
    AccountTableComponent,
    ConfirmDialogComponent,
    CurrencyPipe
  ],
  template: `
    <div class="fade-in">

      <!-- Page Header -->
      <app-page-header
        title="Chart of Accounts"
        subtitle="Manage your general ledger accounts"
        [breadcrumbs]="[
          { label: 'Finance', route: '/finance/dashboard' },
          { label: 'Chart of Accounts' }
        ]">
        <button
          class="btn-outline-erp"
          (click)="exportAccounts()">
          <i class="bi bi-download"></i>
          Export
        </button>
        <button
          class="btn-primary-erp"
          (click)="openForm()">
          <i class="bi bi-plus-lg"></i>
          New Account
        </button>
      </app-page-header>

      <!-- Summary Cards -->
      <div class="stats-grid mb-20">
        @for (type of accountTypes; track type.key) {
          <div
            class="account-type-card"
            [class.active]="selectedType() === type.key"
            (click)="filterByType(type.key)">
            <div class="atc-icon" [style.background]="type.bg" [style.color]="type.color">
              <i class="bi" [ngClass]="type.icon"></i>
            </div>
            <div class="atc-body">
              <div class="atc-label">{{ type.label }}</div>
              <div class="atc-value">
                {{ getTypeTotal(type.key) | bdtCurrency }}
              </div>
              <div class="atc-count">
                {{ getTypeCount(type.key) }} accounts
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Filter Bar -->
      <div class="erp-card mb-16">
        <div class="erp-card__body">
          <div class="filter-bar">
            <div class="filter-bar__left">

              <!-- Search -->
              <div class="search-box">
                <i class="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Search accounts..."
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearch()"/>
              </div>

              <!-- Type filter -->
              <select
                class="form-select"
                style="width:160px;height:36px"
                [(ngModel)]="selectedType"
                (ngModelChange)="onTypeFilter()">
                <option value="">All Types</option>
                @for (type of accountTypes; track type.key) {
                  <option [value]="type.key">{{ type.label }}</option>
                }
              </select>

              <!-- Status filter -->
              <select
                class="form-select"
                style="width:140px;height:36px"
                [(ngModel)]="selectedStatus"
                (ngModelChange)="applyFilters()">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

            </div>
            <div class="filter-bar__right">
              <!-- Reset -->
              @if (searchQuery || selectedType() || selectedStatus) {
                <button
                  class="btn-outline-erp btn-outline-erp--sm"
                  (click)="resetFilters()">
                  <i class="bi bi-x-circle"></i>
                  Clear Filters
                </button>
              }
              <span class="result-count">
                {{ filteredAccounts().length }} accounts
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Accounts Table -->
      <div class="erp-card">
        <app-account-table
          [accounts]="paginatedAccounts()"
          [loading]="loading()"
          (edit)="onEdit($event)"
          (delete)="onDeleteConfirm($event)"/>

        <!-- Pagination -->
        @if (filteredAccounts().length > pageSize) {
          <div class="erp-pagination">
            <span class="page-info">
              Showing {{ startItem }}–{{ endItem }}
              of {{ filteredAccounts().length }} accounts
            </span>
            <div class="page-controls">
              <button
                (click)="prevPage()"
                [disabled]="currentPage() === 1">
                <i class="bi bi-chevron-left"></i>
              </button>
              @for (p of pages(); track p) {
                <button
                  [class.active]="p === currentPage()"
                  (click)="goToPage(p)">
                  {{ p }}
                </button>
              }
              <button
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Account Form Modal -->
      <app-account-form
        [isOpen]="showForm()"
        [editAccount]="selectedAccount()"
        [allAccounts]="accounts()"
        (saved)="onSave($event)"
        (cancelled)="closeForm()"/>

      <!-- Confirm Delete -->
      <app-confirm-dialog
        [isOpen]="showConfirm()"
        title="Delete Account"
        [message]="
          'Are you sure you want to delete ' +
          (accountToDelete()?.name ?? '') +
          '? This action cannot be undone.'
        "
        confirmText="Delete Account"
        type="danger"
        (confirmed)="onDelete()"
        (cancelled)="showConfirm.set(false)"/>

    </div>
  `,
  styles: [`
    .mb-20 { margin-bottom: 20px; }
    .mb-16 { margin-bottom: 16px; }

    .account-type-card {
      display: flex;
      align-items: center;
      gap: 14px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      cursor: pointer;
      transition: all .2s;

      &:hover {
        border-color: #2563a8;
        box-shadow: 0 4px 12px rgba(37,99,168,0.1);
        transform: translateY(-2px);
      }

      &.active {
        border-color: #2563a8;
        background: #e8f0fa;
      }
    }

    .atc-icon {
      width: 44px; height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .atc-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .atc-value {
      font-family: 'DM Mono', monospace;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 2px 0;
    }

    .atc-count {
      font-size: 11px;
      color: #94a3b8;
    }

    .result-count {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }
  `]
})
export class ChartOfAccountsComponent implements OnInit {
  private accountService = inject(AccountService);

  // State
  loading         = signal(false);
  accounts        = signal<Account[]>([]);
  showForm        = signal(false);
  showConfirm     = signal(false);
  selectedAccount = signal<Account | null>(null);
  accountToDelete = signal<Account | null>(null);
  selectedType    = signal('');
  selectedStatus  = '';
  searchQuery     = '';
  currentPage     = signal(1);
  pageSize        = 10;

  accountTypes = [
    {
      key:   'asset',
      label: 'Assets',
      icon:  'bi-bank',
      bg:    '#e0f2fe',
      color: '#075985'
    },
    {
      key:   'liability',
      label: 'Liabilities',
      icon:  'bi-credit-card',
      bg:    '#fee2e2',
      color: '#991b1b'
    },
    {
      key:   'equity',
      label: 'Equity',
      icon:  'bi-pie-chart',
      bg:    '#fef9c3',
      color: '#854d0e'
    },
    {
      key:   'revenue',
      label: 'Revenue',
      icon:  'bi-graph-up-arrow',
      bg:    '#dcfce7',
      color: '#166534'
    },
    {
      key:   'expense',
      label: 'Expenses',
      icon:  'bi-receipt',
      bg:    '#f5f3ff',
      color: '#6d28d9'
    }
  ];

  // Computed filtered list
  filteredAccounts = computed(() => {
    let list = this.accounts();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q)
      );
    }

    if (this.selectedType()) {
      list = list.filter(a => a.type === this.selectedType());
    }

    if (this.selectedStatus) {
      list = list.filter(a =>
        this.selectedStatus === 'active'
          ? a.is_active
          : !a.is_active
      );
    }

    return list;
  });

  // Paginated list
  paginatedAccounts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredAccounts().slice(start, start + this.pageSize);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredAccounts().length / this.pageSize) || 1
  );

  pages = computed(() => {
    const total = this.totalPages();
    const curr  = this.currentPage();
    const start = Math.max(1, curr - 2);
    const end   = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  get startItem(): number {
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(
      this.currentPage() * this.pageSize,
      this.filteredAccounts().length
    );
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading.set(true);
    this.accountService.getAll().subscribe({
      next:  (data) => {
        this.accounts.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // ── Type summary helpers ─────────────────────────────────
  getTypeTotal(type: string): number {
    return this.accounts()
      .filter(a => a.type === type)
      .reduce((s, a) => s + a.balance, 0);
  }

  getTypeCount(type: string): number {
    return this.accounts().filter(a => a.type === type).length;
  }

  // ── Filter actions ───────────────────────────────────────
  onSearch(): void {
    this.currentPage.set(1);
  }

  onTypeFilter(): void {
    this.currentPage.set(1);
  }

  applyFilters(): void {
    this.currentPage.set(1);
  }

  filterByType(type: string): void {
    this.selectedType.set(
      this.selectedType() === type ? '' : type
    );
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedType.set('');
    this.selectedStatus = '';
    this.currentPage.set(1);
  }

  // ── Pagination ───────────────────────────────────────────
  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  goToPage(p: number): void {
    this.currentPage.set(p);
  }

  // ── CRUD ─────────────────────────────────────────────────
  openForm(): void {
    this.selectedAccount.set(null);
    this.showForm.set(true);
  }

  onEdit(account: Account): void {
    this.selectedAccount.set(account);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedAccount.set(null);
  }

  onSave(data: AccountFormData): void {
    const selected = this.selectedAccount();

    if (selected) {
      // Update
      this.accountService.update(selected.id, data).subscribe({
        next: (updated) => {
          this.accounts.update(list =>
            list.map(a => a.id === updated.id ? updated : a)
          );
          this.closeForm();
        }
      });
    } else {
      // Create
      this.accountService.create(data).subscribe({
        next: (created) => {
          this.accounts.update(list => [...list, created]);
          this.closeForm();
        }
      });
    }
  }

  onDeleteConfirm(account: Account): void {
    this.accountToDelete.set(account);
    this.showConfirm.set(true);
  }

  onDelete(): void {
    const account = this.accountToDelete();
    if (!account) return;

    this.accountService.delete(account.id).subscribe({
      next: () => {
        this.accounts.update(list =>
          list.filter(a => a.id !== account.id)
        );
        this.showConfirm.set(false);
        this.accountToDelete.set(null);
      }
    });
  }

  exportAccounts(): void {
    const data = this.filteredAccounts();
    const csv  = [
      ['Code', 'Name', 'Type', 'Balance', 'Status'].join(','),
      ...data.map(a => [
        a.code,
        `"${a.name}"`,
        a.type,
        a.balance,
        a.is_active ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = 'chart-of-accounts.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}