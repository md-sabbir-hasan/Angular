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
    ModalComponent
  ],
  template: `
    <div class="fade-in">

      <!-- Page Header -->
      <app-page-header
        title="Expense Claims"
        subtitle="Manage employee expense claims and reimbursements"
        [breadcrumbs]="[
          { label: 'Finance', route: '/finance/dashboard' },
          { label: 'Expenses' }
        ]">
        <button
          class="btn-outline-erp"
          (click)="exportExpenses()">
          <i class="bi bi-download"></i>
          Export
        </button>
        <button
          class="btn-primary-erp"
          (click)="showForm.set(true)">
          <i class="bi bi-plus-lg"></i>
          New Claim
        </button>
      </app-page-header>

      <!-- Summary Cards -->
      <div class="stats-grid mb-20">
        <div class="stat-card stat-card--expense">
          <div class="stat-card__label">Total Claims</div>
          <div class="stat-card__value">
            {{ summary().total }}
          </div>
          <div class="stat-card__change neutral">
            All time
          </div>
          <div class="stat-card__icon">
            <i class="bi bi-wallet2"></i>
          </div>
        </div>
        <div class="stat-card stat-card--vat">
          <div class="stat-card__label">Pending Approval</div>
          <div class="stat-card__value">
            {{ summary().pending }}
          </div>
          <div class="stat-card__change neutral">
            {{ summary().pendingAmount | bdtCurrency }}
          </div>
          <div class="stat-card__icon">
            <i class="bi bi-hourglass-split"></i>
          </div>
        </div>
        <div class="stat-card stat-card--revenue">
          <div class="stat-card__label">Approved</div>
          <div class="stat-card__value">
            {{ summary().approved }}
          </div>
          <div class="stat-card__change up">
            <i class="bi bi-check-circle"></i>
            Ready to pay
          </div>
          <div class="stat-card__icon">
            <i class="bi bi-check-circle"></i>
          </div>
        </div>
        <div class="stat-card stat-card--cash">
          <div class="stat-card__label">Total Amount</div>
          <div class="stat-card__value">
            {{ summary().totalAmount | bdtCurrency }}
          </div>
          <div class="stat-card__change neutral">
            All claims
          </div>
          <div class="stat-card__icon">
            <i class="bi bi-currency-exchange"></i>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="erp-card mb-16">
        <div class="erp-card__body">
          <div class="filter-bar">
            <div class="filter-bar__left">
              <div class="search-box">
                <i class="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Search claim, employee..."
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearch()"/>
              </div>
              <select
                class="form-select"
                style="width:160px;height:36px"
                [(ngModel)]="selectedStatus"
                (ngModelChange)="applyFilters()">
                <option value="">All Status</option>
                @for (s of statusOptions; track s.value) {
                  <option [value]="s.value">{{ s.label }}</option>
                }
              </select>
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
              @if (searchQuery || selectedStatus || fromDate || toDate) {
                <button
                  class="btn-outline-erp btn-outline-erp--sm"
                  (click)="resetFilters()">
                  <i class="bi bi-x-circle"></i>
                  Clear
                </button>
              }
              <span class="result-count">
                {{ filteredClaims().length }} claims
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Expenses Table -->
      <div class="erp-card">
        <div class="table-wrapper">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Claim #</th>
                <th>Employee</th>
                <th>Date</th>
                <th class="text-right">Amount</th>
                <th class="text-center">Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
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
              } @else if (paginatedClaims().length === 0) {
                <tr>
                  <td colspan="6">
                    <div class="table-empty">
                      <i class="bi bi-wallet2"></i>
                      <p>No expense claims found</p>
                      <small>Create a new claim to get started</small>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (claim of paginatedClaims(); track claim.id) {
                  <tr>
                    <td>
                      <span class="col-code">
                        {{ claim.claim_number }}
                      </span>
                    </td>
                    <td>
                      <div class="emp-info">
                        <div class="emp-avatar">
                          {{ claim.employee_name.charAt(0) }}
                        </div>
                        <div>
                          <div class="emp-name">
                            {{ claim.employee_name }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="col-date">
                        {{ formatDate(claim.claim_date) }}
                      </span>
                    </td>
                    <td class="text-right">
                      <span class="col-amount">
                        {{ claim.total_amount | bdtCurrency }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span
                        class="badge-status"
                        [ngClass]="claim.status">
                        {{ claim.status | statusLabel }}
                      </span>
                    </td>
                    <td>
                      <div class="action-group">
                        @if (claim.status === 'submitted') {
                          <button
                            class="btn-icon btn-icon--success"
                            title="Approve"
                            (click)="updateStatus(claim, 'approved')">
                            <i class="bi bi-check-lg"></i>
                          </button>
                          <button
                            class="btn-icon btn-icon--danger"
                            title="Reject"
                            (click)="updateStatus(claim, 'rejected')">
                            <i class="bi bi-x-lg"></i>
                          </button>
                        }
                        @if (claim.status === 'draft') {
                          <button
                            class="btn-icon btn-icon--primary"
                            title="Submit"
                            (click)="updateStatus(claim, 'submitted')">
                            <i class="bi bi-send"></i>
                          </button>
                        }
                        @if (claim.status === 'approved') {
                          <button
                            class="btn-icon btn-icon--success"
                            title="Mark Paid"
                            (click)="updateStatus(claim, 'paid')">
                            <i class="bi bi-cash"></i>
                          </button>
                        }
                        @if (
                          claim.status === 'draft' ||
                          claim.status === 'rejected'
                        ) {
                          <button
                            class="btn-icon btn-icon--danger"
                            title="Delete"
                            (click)="confirmDelete(claim)">
                            <i class="bi bi-trash3"></i>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (filteredClaims().length > pageSize) {
          <div class="erp-pagination">
            <span class="page-info">
              Showing {{ startItem }}–{{ endItem }}
              of {{ filteredClaims().length }} claims
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

      <!-- New Claim Modal -->
      <app-modal
        [isOpen]="showForm()"
        title="New Expense Claim"
        icon="bi-wallet2"
        size="md"
        [showFooter]="true"
        (closed)="showForm.set(false)">

        <div class="form-group">
          <label>Employee Name <span class="required">*</span></label>
          <input
            type="text"
            class="form-control"
            placeholder="Full name"
            [(ngModel)]="newClaim.employee_name"/>
        </div>
        <div class="form-group">
          <label>Claim Date <span class="required">*</span></label>
          <input
            type="date"
            class="form-control"
            [(ngModel)]="newClaim.claim_date"/>
        </div>
        <div class="form-group">
          <label>Total Amount (৳) <span class="required">*</span></label>
          <input
            type="number"
            class="form-control"
            placeholder="0.00"
            [(ngModel)]="newClaim.total_amount"
            min="0"/>
        </div>
        <div class="form-group">
          <label>Notes</label>
          <textarea
            class="form-control"
            rows="2"
            placeholder="Expense details..."
            [(ngModel)]="newClaim.notes">
          </textarea>
        </div>

        <div slot="footer" class="d-flex gap-8 w-full">
          <button
            class="btn-outline-erp flex-1"
            (click)="showForm.set(false)">
            Cancel
          </button>
          <button
            class="btn-primary-erp flex-1"
            [disabled]="
              !newClaim.employee_name ||
              !newClaim.total_amount
            "
            (click)="onSave()">
            <i class="bi bi-plus-lg"></i>
            Create Claim
          </button>
        </div>
      </app-modal>

      <!-- Confirm Delete -->
      <app-confirm-dialog
        [isOpen]="showConfirm()"
        title="Delete Expense Claim"
        message="Are you sure you want to delete this claim?"
        confirmText="Delete"
        type="danger"
        (confirmed)="onDelete()"
        (cancelled)="showConfirm.set(false)"/>

    </div>
  `,
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
  private notification   = inject(NotificationService);

  loading     = signal(false);
  claims      = signal<ExpenseClaim[]>([]);
  showForm    = signal(false);
  showConfirm = signal(false);
  claimToDelete = signal<ExpenseClaim | null>(null);

  searchQuery    = '';
  selectedStatus = '';
  fromDate       = '';
  toDate         = '';
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

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c =>
        c.claim_number.toLowerCase().includes(q) ||
        c.employee_name.toLowerCase().includes(q)
      );
    }

    if (this.selectedStatus) {
      list = list.filter(c => c.status === this.selectedStatus);
    }

    if (this.fromDate) {
      list = list.filter(c => c.claim_date >= this.fromDate);
    }

    if (this.toDate) {
      list = list.filter(c => c.claim_date <= this.toDate);
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
    this.searchQuery    = '';
    this.selectedStatus = '';
    this.fromDate       = '';
    this.toDate         = '';
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