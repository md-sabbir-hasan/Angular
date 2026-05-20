import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { StatusPipe } from '../../../shared/pipes/status-pipe';
import { ModalComponent } from '../../../shared/components/modal';
import { ExpenseService } from '../services/expense';
import { NotificationService } from '../../../core/services/notification';
import { EXPENSE_STATUS_LABELS, ExpenseClaim, ExpenseFormData } from '../models/expense.model';
import { formatDate, today } from '../../../core/utils/date.util';
import { HasPermissionDirective } from '../../../shared/directives/has-permission';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    ConfirmDialogComponent,
    CurrencyPipe,
    StatusPipe,
    ModalComponent,
    HasPermissionDirective
  ],
  templateUrl: './expenses.html',
  styles: [`
    .mb-20 { margin-bottom: 20px; }
    .mb-16 { margin-bottom: 16px; }
    .gap-8 { gap: 8px; }
    .flex-1 { flex: 1; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .result-count { font-size: 12px; color: #64748b; font-weight: 500; }

    .emp-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .emp-avatar {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: #e8f0fa;
      color: #2563a8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .emp-name {
      font-size: 13.5px;
      font-weight: 500;
      color: #0f172a;
    }
    .btn-icon--success:hover {
      background: #dcfce7;
      color: #166534;
      border-color: #bbf7d0;
    }
  `]
})
export class ExpensesComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  public notification   = inject(NotificationService);

  loading     = signal(false);
  claims      = signal<ExpenseClaim[]>([]);
  showForm    = signal(false);
  showConfirm = signal(false);
  claimToDelete = signal<ExpenseClaim | null>(null);

  searchQuery    = signal('');
  selectedStatus = signal('');
  fromDate       = signal('');
  toDate         = signal('');
  currentPage    = signal(1);
  pageSize       = 10;

  formatDate = formatDate;

  newClaim: ExpenseFormData = {
    employee_name: '',
    claim_date:    today(),
    total_amount:  0,
    notes:         ''
  };

  statusOptions = Object.entries(EXPENSE_STATUS_LABELS).map(
    ([value, label]) => ({ value, label })
  );

  // ── Computed ─────────────────────────────────────────────
  summary = computed(() =>
    this.expenseService.getSummary(this.claims())
  );

  filteredClaims = computed(() => {
    let list = this.claims();
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();
    const from = this.fromDate();
    const to = this.toDate();

    if (query) {
      list = list.filter(c =>
        c.claim_number.toLowerCase().includes(query) ||
        c.employee_name.toLowerCase().includes(query)
      );
    }

    if (status) {
      list = list.filter(c => c.status === status);
    }

    if (from) {
      list = list.filter(c => c.claim_date >= from);
    }

    if (to) {
      list = list.filter(c => c.claim_date <= to);
    }

    return list;
  });

  paginatedClaims = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredClaims().slice(start, start + this.pageSize);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredClaims().length / this.pageSize) || 1
  );

  pages = computed(() => {
    const total = this.totalPages();
    const curr  = this.currentPage();
    const start = Math.max(1, curr - 2);
    const end   = Math.min(total, start + 4);
    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  });

  get startItem(): number {
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(
      this.currentPage() * this.pageSize,
      this.filteredClaims().length
    );
  }

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.loading.set(true);
    this.expenseService.getAll().subscribe({
      next:  (data) => {
        this.claims.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSave(): void {
    this.expenseService.create(this.newClaim).subscribe({
      next: (created) => {
        this.claims.update(list => [created, ...list]);
        this.showForm.set(false);
        this.resetNewClaim();
      }
    });
  }

  updateStatus(
    claim: ExpenseClaim,
    status: ExpenseClaim['status']
  ): void {
    this.expenseService.updateStatus(claim.id, status).subscribe({
      next: (updated) => {
        this.claims.update(list =>
          list.map(c =>
            c.id === updated.id ? { ...c, status: updated.status } : c
          )
        );
      }
    });
  }

  confirmDelete(claim: ExpenseClaim): void {
    this.claimToDelete.set(claim);
    this.showConfirm.set(true);
  }

  onDelete(): void {
    const claim = this.claimToDelete();
    if (!claim) return;

    this.expenseService.delete(claim.id).subscribe({
      next: () => {
        this.claims.update(list =>
          list.filter(c => c.id !== claim.id)
        );
        this.showConfirm.set(false);
        this.claimToDelete.set(null);
      }
    });
  }

  resetNewClaim(): void {
    this.newClaim = {
      employee_name: '',
      claim_date:    today(),
      total_amount:  0,
      notes:         ''
    };
  }

  onSearch(): void { this.currentPage.set(1); }
  applyFilters(): void { this.currentPage.set(1); }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.fromDate.set('');
    this.toDate.set('');
    this.currentPage.set(1);
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages())
      this.currentPage.update(p => p + 1);
  }

  goToPage(p: number): void { this.currentPage.set(p); }

  exportExpenses(): void {
    const data = this.filteredClaims();
    const csv  = [
      ['Claim #','Employee','Date','Amount','Status'].join(','),
      ...data.map(c => [
        c.claim_number,
        `"${c.employee_name}"`,
        c.claim_date,
        c.total_amount,
        c.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = 'expense-claims.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}