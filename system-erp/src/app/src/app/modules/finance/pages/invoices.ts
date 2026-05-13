import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { InvoiceFormComponent } from '../components/invoice-form';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { StatusPipe } from '../../../shared/pipes/status-pipe';
import { InvoiceService } from '../services/invoice';
import { NotificationService } from '../../../core/services/notification';
import { Invoice, InvoiceFormData } from '../models/invoice.model';
import { formatDate } from '../../../core/utils/date.util';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';


@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    InvoiceFormComponent,
    ConfirmDialogComponent,
    CurrencyPipe,
    StatusPipe
  ],
  template: `
    <div class="fade-in">

      <!-- Page Header -->
      <app-page-header
        title="Invoices"
        subtitle="Manage sales invoices and billing"
        [breadcrumbs]="[
          { label: 'Finance', route: '/finance/dashboard' },
          { label: 'Invoices' }
        ]">
        <button
          class="btn-outline-erp"
          (click)="exportInvoices()">
          <i class="bi bi-download"></i>
          Export
        </button>
        <button
          class="btn-primary-erp"
          (click)="openForm()">
          <i class="bi bi-plus-lg"></i>
          New Invoice
        </button>
      </app-page-header>

      <!-- Summary Cards -->
      <div class="stats-grid mb-20">
        <div class="stat-card stat-card--revenue">
          <div class="stat-card__label">Total Invoiced</div>
          <div class="stat-card__value">
            {{ summary().totalAmount | bdtCurrency }}
          </div>
          <div class="stat-card__change neutral">
            {{ summary().total }} invoices total
          </div>
          <div class="stat-card__icon">
            <i class="bi bi-receipt"></i>
          </div>
        </div>

        <div class="stat-card stat-card--cash">
          <div class="stat-card__label">Amount Collected</div>
          <div class="stat-card__value">
            {{ summary().paidAmount | bdtCurrency }}
          </div>
          <div class="stat-card__change up">
            <i class="bi bi-arrow-up-right"></i>
            {{ summary().paid }} paid
          </div>
          <div class="stat-card__icon">
            <i class="bi bi-check-circle"></i>
          </div>
        </div>

        <div class="stat-card stat-card--receivable">
          <div class="stat-card__label">Outstanding</div>
          <div class="stat-card__value">
            {{ summary().pendingAmount | bdtCurrency }}
          </div>
          <div class="stat-card__change neutral">
            {{ summary().pending }} pending
          </div>
          <div class="stat-card__icon">
            <i class="bi bi-hourglass-split"></i>
          </div>
        </div>

        <div class="stat-card stat-card--payable">
          <div class="stat-card__label">Overdue</div>
          <div class="stat-card__value">
            {{ summary().overdue }}
          </div>
          <div class="stat-card__change down">
            <i class="bi bi-exclamation-triangle"></i>
            Needs attention
          </div>
          <div class="stat-card__icon">
            <i class="bi bi-clock-history"></i>
          </div>
        </div>
      </div>

      <!-- Status tabs -->
      <div class="status-tabs mb-16">
        @for (tab of statusTabs; track tab.value) {
          <button
            class="status-tab"
            [class.active]="selectedStatus === tab.value"
            (click)="filterByStatus(tab.value)">
            {{ tab.label }}
            <span class="tab-count">
              {{ getStatusCount(tab.value) }}
            </span>
          </button>
        }
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
                  placeholder="Search invoice, customer..."
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearch()"/>
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
              @if (searchQuery || fromDate || toDate) {
                <button
                  class="btn-outline-erp btn-outline-erp--sm"
                  (click)="resetFilters()">
                  <i class="bi bi-x-circle"></i>
                  Clear
                </button>
              }
              <span class="result-count">
                {{ filteredInvoices().length }} invoices
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="erp-card">
        <div class="table-wrapper">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Due Date</th>
                <th class="text-right">Subtotal</th>
                <th class="text-right">VAT</th>
                <th class="text-right">Total</th>
                <th class="text-right">Paid</th>
                <th class="text-right">Balance</th>
                <th class="text-center">Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    @for (j of [1,2,3,4,5,6,7,8,9,10,11]; track j) {
                      <td>
                        <div class="skeleton"
                          style="height:14px;border-radius:4px">
                        </div>
                      </td>
                    }
                  </tr>
                }
              } @else if (paginatedInvoices().length === 0) {
                <tr>
                  <td colspan="11">
                    <div class="table-empty">
                      <i class="bi bi-receipt"></i>
                      <p>No invoices found</p>
                      <small>Create your first invoice</small>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (inv of paginatedInvoices(); track inv.id) {
                  <tr [class.overdue-row]="inv.status === 'overdue'">
                    <td>
                      <span class="col-code inv-number">
                        {{ inv.invoice_number }}
                      </span>
                    </td>
                    <td>
                      <div class="customer-name">
                        {{ inv.customer_name }}
                      </div>
                    </td>
                    <td>
                      <span class="col-date">
                        {{ formatDate(inv.invoice_date) }}
                      </span>
                    </td>
                    <td>
                      <span
                        class="col-date"
                        [class.text-danger]="
                          inv.status === 'overdue'
                        ">
                        {{ formatDate(inv.due_date) }}
                      </span>
                    </td>
                    <td class="text-right">
                      <span class="col-amount">
                        {{ inv.subtotal | bdtCurrency }}
                      </span>
                    </td>
                    <td class="text-right">
                      <span class="col-amount text-warning-color">
                        {{ inv.vat_amount | bdtCurrency }}
                      </span>
                    </td>
                    <td class="text-right">
                      <span class="col-amount fw-600">
                        {{ inv.total_amount | bdtCurrency }}
                      </span>
                    </td>
                    <td class="text-right">
                      <span class="col-amount text-success-color">
                        {{ inv.paid_amount | bdtCurrency }}
                      </span>
                    </td>
                    <td class="text-right">
                      <span
                        class="col-amount"
                        [class.text-danger]="
                          (inv.total_amount - inv.paid_amount) > 0
                        ">
                        {{
                          (inv.total_amount - inv.paid_amount)
                          | bdtCurrency
                        }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span
                        class="badge-status"
                        [ngClass]="inv.status">
                        {{ inv.status | statusLabel }}
                      </span>
                    </td>
                    <td>
                      <div class="action-group">
                        <button
                          class="btn-icon btn-icon--primary"
                          title="View"
                          (click)="viewInvoice(inv)">
                          <i class="bi bi-eye"></i>
                        </button>
                        @if (inv.status === 'draft') {
                          <button
                            class="btn-icon"
                            title="Send"
                            (click)="updateStatus(inv, 'sent')">
                            <i class="bi bi-send"></i>
                          </button>
                        }
                        @if (
                          inv.status === 'sent' ||
                          inv.status === 'partial' ||
                          inv.status === 'overdue'
                        ) {
                          <button
                            class="btn-icon btn-icon--success"
                            title="Mark Paid"
                            (click)="updateStatus(inv, 'paid')">
                            <i class="bi bi-check-lg"></i>
                          </button>
                        }
                        @if (inv.status === 'draft') {
                          <button
                            class="btn-icon btn-icon--danger"
                            title="Delete"
                            (click)="confirmDelete(inv)">
                            <i class="bi bi-trash3"></i>
                          </button>
                        }
                        <button
                          class="btn-icon"
                          title="Print"
                          (click)="printInvoice(inv)">
                          <i class="bi bi-printer"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (filteredInvoices().length > pageSize) {
          <div class="erp-pagination">
            <span class="page-info">
              Showing {{ startItem }}–{{ endItem }}
              of {{ filteredInvoices().length }} invoices
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

      <!-- Invoice Preview Modal -->
      @if (selectedInvoice()) {
        <div class="modal-backdrop fade show"
          (click)="selectedInvoice.set(null)">
        </div>
        <div class="modal fade show d-block" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered modal-lg"
            (click)="$event.stopPropagation()">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="bi bi-receipt me-2"></i>
                  Invoice Preview
                </h5>
                <button
                  class="btn-close"
                  (click)="selectedInvoice.set(null)">
                </button>
              </div>
              <div class="modal-body p-0">
                <div class="invoice-preview">
                  <!-- Invoice header -->
                  <div class="invoice-preview__header">
                    <div>
                      <div class="inv-title">INVOICE</div>
                      <div class="inv-number">
                        {{ selectedInvoice()!.invoice_number }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div style="font-size:13px;opacity:.7">
                        Apex Finance Ltd
                      </div>
                      <div style="font-size:12px;opacity:.6">
                        BIN: 000999888-0201
                      </div>
                    </div>
                  </div>

                  <!-- Invoice body -->
                  <div class="invoice-preview__body">
                    <div class="inv-meta-grid">
                      <div>
                        <div class="inv-meta-label">Bill To</div>
                        <div class="inv-meta-value">
                          {{ selectedInvoice()!.customer_name }}
                        </div>
                      </div>
                      <div>
                        <div class="inv-meta-label">Invoice Date</div>
                        <div class="inv-meta-value">
                          {{ formatDate(selectedInvoice()!.invoice_date) }}
                        </div>
                      </div>
                      <div>
                        <div class="inv-meta-label">Due Date</div>
                        <div class="inv-meta-value">
                          {{ formatDate(selectedInvoice()!.due_date) }}
                        </div>
                      </div>
                      <div>
                        <div class="inv-meta-label">Status</div>
                        <span
                          class="badge-status"
                          [ngClass]="selectedInvoice()!.status">
                          {{ selectedInvoice()!.status | statusLabel }}
                        </span>
                      </div>
                    </div>

                    <div class="divider"></div>

                    <!-- Amounts -->
                    <div class="inv-amounts">
                      <div class="inv-amount-row">
                        <span>Subtotal</span>
                        <span>
                          {{ selectedInvoice()!.subtotal | bdtCurrency }}
                        </span>
                      </div>
                      <div class="inv-amount-row">
                        <span>Discount</span>
                        <span class="text-danger">
                          -{{ selectedInvoice()!.discount_amount
                            | bdtCurrency }}
                        </span>
                      </div>
                      <div class="inv-amount-row">
                        <span>VAT (15%)</span>
                        <span>
                          {{ selectedInvoice()!.vat_amount | bdtCurrency }}
                        </span>
                      </div>
                      <div class="inv-amount-row inv-amount-row--total">
                        <span>Total Amount</span>
                        <span>
                          {{ selectedInvoice()!.total_amount | bdtCurrency }}
                        </span>
                      </div>
                      <div class="inv-amount-row">
                        <span>Amount Paid</span>
                        <span class="text-success-color">
                          {{ selectedInvoice()!.paid_amount | bdtCurrency }}
                        </span>
                      </div>
                      <div class="inv-amount-row inv-amount-row--balance">
                        <span>Balance Due</span>
                        <span class="text-danger">
                          {{
                            (selectedInvoice()!.total_amount -
                            selectedInvoice()!.paid_amount)
                            | bdtCurrency
                          }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="invoice-preview__footer">
                    Mushak 6.3 — Tax Invoice |
                    Generated by FinanceERP
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button
                  class="btn-outline-erp"
                  (click)="selectedInvoice.set(null)">
                  Close
                </button>
                <button
                  class="btn-primary-erp"
                  (click)="printInvoice(selectedInvoice()!)">
                  <i class="bi bi-printer"></i>
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- New Invoice Form -->
      <app-invoice-form
        [isOpen]="showForm()"
        [customers]="customers()"
        (saved)="onSave($event)"
        (cancelled)="closeForm()"/>

      <!-- Confirm Delete -->
      <app-confirm-dialog
        [isOpen]="showConfirm()"
        title="Delete Invoice"
        [message]="
          'Are you sure you want to delete invoice ' +
          (invoiceToDelete()?.invoice_number ?? '') + '?'
        "
        confirmText="Delete Invoice"
        type="danger"
        (confirmed)="onDelete()"
        (cancelled)="showConfirm.set(false)"/>

    </div>
  `,
  styles: [`
    .mb-20 { margin-bottom: 20px; }
    .mb-16 { margin-bottom: 16px; }
    .me-2  { margin-right: 8px; }
    .p-0   { padding: 0; }
    .fw-600 { font-weight: 600; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-danger { color: #991b1b; }
    .text-success-color { color: #166534; }
    .text-warning-color { color: #854d0e; }
    .result-count { font-size: 12px; color: #64748b; font-weight: 500; }

    .status-tabs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .status-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      background: #fff;
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all .15s;

      &:hover { background: #f1f5f9; }

      &.active {
        background: #1a3a5c;
        color: #fff;
        border-color: #1a3a5c;
      }
    }

    .tab-count {
      background: rgba(255,255,255,0.2);
      padding: 1px 6px;
      border-radius: 10px;
      font-size: 11px;

      .status-tab:not(.active) & {
        background: #f1f5f9;
        color: #64748b;
      }
    }

    .overdue-row td {
      background: rgba(254, 226, 226, 0.3);
    }

    .inv-number {
      color: #2563a8 !important;
      font-weight: 600 !important;
    }

    .customer-name {
      font-size: 13.5px;
      font-weight: 500;
      color: #0f172a;
    }

    .btn-icon--success:hover {
      background: #dcfce7;
      color: #166534;
      border-color: #bbf7d0;
    }

    // Invoice Preview
    .invoice-preview {
      border-radius: 0;

      &__header {
        background: #1a3a5c;
        color: #fff;
        padding: 24px 28px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .inv-title {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -1px;
          opacity: 0.9;
        }

        .inv-number {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          opacity: 0.7;
          margin-top: 4px;
        }
      }

      &__body {
        padding: 24px 28px;
      }

      &__footer {
        padding: 12px 28px;
        background: #f8fafc;
        font-size: 12px;
        color: #94a3b8;
        border-top: 1px solid #e2e8f0;
        text-align: center;
      }
    }

    .inv-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }

    .inv-meta-label {
      font-size: 10px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .inv-meta-value {
      font-size: 13.5px;
      font-weight: 500;
      color: #0f172a;
    }

    .inv-amounts {
      max-width: 360px;
      margin-left: auto;
    }

    .inv-amount-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13.5px;
      border-bottom: 1px dashed #f1f5f9;
      color: #64748b;

      &:last-child { border-bottom: none; }

      &--total {
        font-weight: 700;
        font-size: 16px;
        color: #0f172a;
        padding: 10px 0;
        border-top: 2px solid #e2e8f0;
        border-bottom: 2px solid #e2e8f0;
        margin: 4px 0;
      }

      &--balance {
        font-weight: 700;
        font-size: 15px;
        color: #991b1b;
      }
    }

    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 16px 0;
    }
  `]
})
export class InvoicesComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private http           = inject(HttpClient);
  private notification   = inject(NotificationService);

  // State
  loading         = signal(false);
  invoices        = signal<Invoice[]>([]);
  customers       = signal<{ id: string; name: string }[]>([]);
  showForm        = signal(false);
  showConfirm     = signal(false);
  selectedInvoice = signal<Invoice | null>(null);
  invoiceToDelete = signal<Invoice | null>(null);

  // Filters
  searchQuery    = '';
  selectedStatus = '';
  fromDate       = '';
  toDate         = '';
  currentPage    = signal(1);
  pageSize       = 10;

  formatDate = formatDate;

  statusTabs = [
    { label: 'All',     value: '' },
    { label: 'Draft',   value: 'draft' },
    { label: 'Sent',    value: 'sent' },
    { label: 'Partial', value: 'partial' },
    { label: 'Paid',    value: 'paid' },
    { label: 'Overdue', value: 'overdue' }
  ];

  // ── Computed ─────────────────────────────────────────────
  summary = computed(() =>
    this.invoiceService.getSummary(this.invoices())
  );

  filteredInvoices = computed(() => {
    let list = this.invoices();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(i =>
        i.invoice_number.toLowerCase().includes(q) ||
        (i.customer_name ?? '').toLowerCase().includes(q)
      );
    }

    if (this.selectedStatus) {
      list = list.filter(i => i.status === this.selectedStatus);
    }

    if (this.fromDate) {
      list = list.filter(i => i.invoice_date >= this.fromDate);
    }

    if (this.toDate) {
      list = list.filter(i => i.invoice_date <= this.toDate);
    }

    return list;
  });

  paginatedInvoices = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredInvoices().slice(start, start + this.pageSize);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredInvoices().length / this.pageSize) || 1
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
      this.filteredInvoices().length
    );
  }

  ngOnInit(): void {
    this.loadInvoices();
    this.loadCustomers();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.invoiceService.getAll().subscribe({
      next:  (data) => {
        this.invoices.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadCustomers(): void {
    this.http.get<{ id: string; name: string; party_type: string }[]>(
      API_ENDPOINTS.PARTIES
    ).subscribe({
      next: (parties) => {
        this.customers.set(
          parties.filter(p =>
            p.party_type === 'customer' ||
            p.party_type === 'both'
          )
        );
      }
    });
  }

  // ── Status helpers ───────────────────────────────────────
  getStatusCount(status: string): number {
    if (!status) return this.invoices().length;
    return this.invoices().filter(i => i.status === status).length;
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage.set(1);
  }

  // ── CRUD ─────────────────────────────────────────────────
  openForm(): void {
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onSave(data: InvoiceFormData): void {
    this.invoiceService.create(data).subscribe({
      next: (created) => {
        this.invoices.update(list => [created, ...list]);
        this.closeForm();
        this.loadInvoices();
      }
    });
  }

  updateStatus(inv: Invoice, status: Invoice['status']): void {
    this.invoiceService.updateStatus(inv.id, status).subscribe({
      next: (updated) => {
        this.invoices.update(list =>
          list.map(i => i.id === updated.id ? { ...i, ...updated } : i)
        );
      }
    });
  }

  viewInvoice(inv: Invoice): void {
    this.selectedInvoice.set(inv);
  }

  confirmDelete(inv: Invoice): void {
    this.invoiceToDelete.set(inv);
    this.showConfirm.set(true);
  }

  onDelete(): void {
    const inv = this.invoiceToDelete();
    if (!inv) return;

    this.invoiceService.delete(inv.id).subscribe({
      next: () => {
        this.invoices.update(list =>
          list.filter(i => i.id !== inv.id)
        );
        this.showConfirm.set(false);
        this.invoiceToDelete.set(null);
      }
    });
  }

  printInvoice(inv: Invoice): void {
    this.notification.info('Print feature — use browser print');
    window.print();
  }

  // ── Filters ──────────────────────────────────────────────
  onSearch(): void {
    this.currentPage.set(1);
  }

  applyFilters(): void {
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery    = '';
    this.selectedStatus = '';
    this.fromDate       = '';
    this.toDate         = '';
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

  // ── Export ───────────────────────────────────────────────
  exportInvoices(): void {
    const data = this.filteredInvoices();
    const csv  = [
      [
        'Invoice #','Customer','Date',
        'Due Date','Total','Paid','Balance','Status'
      ].join(','),
      ...data.map(i => [
        i.invoice_number,
        `"${i.customer_name}"`,
        i.invoice_date,
        i.due_date,
        i.total_amount,
        i.paid_amount,
        i.total_amount - i.paid_amount,
        i.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = 'invoices.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}