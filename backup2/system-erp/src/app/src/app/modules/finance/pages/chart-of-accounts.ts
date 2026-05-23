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
import { HasPermissionDirective } from '../../../shared/directives/has-permission';

@Component({
  selector: 'app-chart-of-accounts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    AccountFormComponent,
    ConfirmDialogComponent,
    CurrencyPipe,
    HasPermissionDirective
  ],
  templateUrl: './chart-of-accounts.html',
  styleUrls: ['./chart-of-accounts.css']
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
  searchQuery     = signal('');
  selectedType    = signal('');
  selectedStatus  = signal('');
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
    const query = this.searchQuery().toLowerCase();
    const type = this.selectedType();
    const status = this.selectedStatus();

    if (query) {
      list = list.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.code.toLowerCase().includes(query) ||
        a.type.toLowerCase().includes(query)
      );
    }

    if (type) {
      list = list.filter(a => a.type === type);
    }

    if (status) {
      list = list.filter(a =>
        status === 'active' ? a.is_active : !a.is_active
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
    this.searchQuery.set('');
    this.selectedType.set('');
    this.selectedStatus.set('');
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