import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { JournalFormComponent } from '../components/journal-form';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { StatusPipe } from '../../../shared/pipes/status-pipe';
import { NotificationService } from '../../../core/services/notification';
import { JOURNAL_TYPE_LABELS, JournalEntry, JournalFormData } from '../models/journal-entry.model';
import { Account } from '../models/account.model';
import { formatDate } from '../../../core/utils/date.util';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';

@Component({
  selector: 'app-journal-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    JournalFormComponent,
    ConfirmDialogComponent,
    CurrencyPipe,
    StatusPipe
  ],
  template: `
    <div class="fade-in">

      <!-- Page Header -->
      <app-page-header
        title="Journal Entries"
        subtitle="Double-entry bookkeeping records"
        [breadcrumbs]="[
          { label: 'Finance', route: '/finance/dashboard' },
          { label: 'Journal Entry' }
        ]">
        <button
          class="btn-outline-erp"
          (click)="exportJournal()">
          <i class="bi bi-download"></i>
          Export
        </button>
        <button
          class="btn-primary-erp"
          (click)="showForm.set(true)">
          <i class="bi bi-plus-lg"></i>
          New Entry
        </button>
      </app-page-header>

      <!-- Summary Cards -->
      <div class="row g-3 mb-20">
        <div class="col-6 col-md-3">
          <div class="je-stat-card">
            <div class="je-stat-icon" style="background:#e8f0fa;color:#2563a8">
              <i class="bi bi-journal-text"></i>
            </div>
            <div class="je-stat-body">
              <div class="je-stat-value">{{ totalEntries() }}</div>
              <div class="je-stat-label">Total Entries</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="je-stat-card">
            <div class="je-stat-icon" style="background:#dcfce7;color:#166534">
              <i class="bi bi-check-circle"></i>
            </div>
            <div class="je-stat-body">
              <div class="je-stat-value">{{ postedEntries() }}</div>
              <div class="je-stat-label">Posted</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="je-stat-card">
            <div class="je-stat-icon" style="background:#fef9c3;color:#854d0e">
              <i class="bi bi-pencil-square"></i>
            </div>
            <div class="je-stat-body">
              <div class="je-stat-value">{{ draftEntries() }}</div>
              <div class="je-stat-label">Drafts</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="je-stat-card">
            <div class="je-stat-icon" style="background:#f5f3ff;color:#6d28d9">
              <i class="bi bi-currency-exchange"></i>
            </div>
            <div class="je-stat-body">
              <div class="je-stat-value">
                {{ totalDebitAmount() | bdtCurrency }}
              </div>
              <div class="je-stat-label">Total Debits</div>
            </div>
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
                  placeholder="Search reference, narration..."
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearch()"/>
              </div>
              <select
                class="form-select"
                style="width:150px;height:36px"
                [(ngModel)]="selectedStatus"
                (ngModelChange)="applyFilters()">
                <option value="">All Status</option>
                <option value="posted">Posted</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                class="form-select"
                style="width:150px;height:36px"
                [(ngModel)]="selectedType"
                (ngModelChange)="applyFilters()">
                <option value="">All Types</option>
                @for (t of journalTypes; track t.value) {
                  <option [value]="t.value">{{ t.label }}</option>
                }
              </select>
              <input
                type="date"
                class="form-control"
                style="width:150px;height:36px"
                [(ngModel)]="fromDate"
                (ngModelChange)="applyFilters()"
                placeholder="From date"/>
              <input
                type="date"
                class="form-control"
                style="width:150px;height:36px"
                [(ngModel)]="toDate"
                (ngModelChange)="applyFilters()"
                placeholder="To date"/>
            </div>
            <div class="filter-bar__right">
              @if (searchQuery || selectedStatus || selectedType || fromDate || toDate) {
                <button
                  class="btn-outline-erp btn-outline-erp--sm"
                  (click)="resetFilters()">
                  <i class="bi bi-x-circle"></i>
                  Clear
                </button>
              }
              <span class="result-count">
                {{ filteredEntries().length }} entries
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Journal Table -->
      <div class="erp-card">
        <div class="table-wrapper">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Type</th>
                <th>Narration</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Credit</th>
                <th class="text-center">Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    @for (j of [1,2,3,4,5,6,7,8]; track j) {
                      <td>
                        <div class="skeleton"
                          style="height:14px;border-radius:4px">
                        </div>
                      </td>
                    }
                  </tr>
                }
              } @else if (paginatedEntries().length === 0) {
                <tr>
                  <td colspan="8">
                    <div class="table-empty">
                      <i class="bi bi-journal-x"></i>
                      <p>No journal entries found</p>
                      <small>Create your first journal entry</small>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (entry of paginatedEntries(); track entry.id) {
                  <tr>
                    <td>
                      <span class="col-code">
                        {{ entry.reference }}
                      </span>
                    </td>
                    <td>
                      <span class="col-date">
                        {{ formatDate(entry.entry_date) }}
                      </span>
                    </td>
                    <td>
                      <span class="badge-type asset">
                        {{ getTypeLabel(entry.type) }}
                      </span>
                    </td>
                    <td>
                      <span style="font-size:13px;color:#0f172a">
                        {{ entry.narration }}
                      </span>
                    </td>
                    <td class="text-right">
                      <span class="col-amount text-success-color">
                        {{ getEntryDebit(entry.id) | bdtCurrency }}
                      </span>
                    </td>
                    <td class="text-right">
                      <span class="col-amount text-primary-color">
                        {{ getEntryCredit(entry.id) | bdtCurrency }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span
                        class="badge-status"
                        [ngClass]="entry.status">
                        {{ entry.status | statusLabel }}
                      </span>
                    </td>
                    <td>
                      <div class="action-group">
                        <button
                          class="btn-icon btn-icon--primary"
                          title="View Lines"
                          (click)="viewLines(entry)">
                          <i class="bi bi-eye"></i>
                        </button>
                        @if (entry.status === 'draft') {
                          <button
                            class="btn-icon btn-icon--success"
                            title="Post Entry"
                            (click)="postEntry(entry)">
                            <i class="bi bi-send-check"></i>
                          </button>
                          <button
                            class="btn-icon btn-icon--danger"
                            title="Delete"
                            (click)="confirmDelete(entry)">
                            <i class="bi bi-trash3"></i>
                          </button>
                        }
                        @if (entry.status === 'posted') {
                          <button
                            class="btn-icon"
                            title="Reverse Entry"
                            (click)="reverseEntry(entry)">
                            <i class="bi bi-arrow-counterclockwise"></i>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>

                  <!-- Expandable lines -->
                  @if (expandedEntry() === entry.id) {
                    <tr class="lines-row">
                      <td colspan="8">
                        <div class="lines-panel">
                          <div class="lines-header">
                            <i class="bi bi-list-ul"></i>
                            Journal Lines —
                            {{ entry.reference }}
                          </div>
                          <table class="lines-table">
                            <thead>
                              <tr>
                                <th>Account</th>
                                <th class="text-right">Debit (৳)</th>
                                <th class="text-right">Credit (৳)</th>
                                <th>Narration</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for (
                                line of getLinesForEntry(entry.id);
                                track line.id
                              ) {
                                <tr>
                                  <td>
                                    {{ getAccountName(line.account_id) }}
                                  </td>
                                  <td class="text-right text-mono">
                                    @if (line.debit > 0) {
                                      {{ line.debit | bdtCurrency }}
                                    }
                                  </td>
                                  <td class="text-right text-mono">
                                    @if (line.credit > 0) {
                                      {{ line.credit | bdtCurrency }}
                                    }
                                  </td>
                                  <td style="color:#64748b;font-size:13px">
                                    {{ line.narration }}
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  }
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (filteredEntries().length > pageSize) {
          <div class="erp-pagination">
            <span class="page-info">
              Showing {{ startItem }}–{{ endItem }}
              of {{ filteredEntries().length }} entries
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

      <!-- Journal Form Modal -->
      <app-journal-form
        [isOpen]="showForm()"
        [accounts]="accounts()"
        (saved)="onSave($event)"
        (cancelled)="showForm.set(false)"/>

      <!-- Confirm Delete -->
      <app-confirm-dialog
        [isOpen]="showConfirm()"
        title="Delete Journal Entry"
        message="Are you sure? This entry will be permanently deleted."
        confirmText="Delete Entry"
        type="danger"
        (confirmed)="onDelete()"
        (cancelled)="showConfirm.set(false)"/>

    </div>
  `,
  styles: [`
    .mb-20 { margin-bottom: 20px; }
    .mb-16 { margin-bottom: 16px; }
    .text-success-color { color: #166534; }
    .text-primary-color { color: #2563a8; }
    .text-mono { font-family: 'DM Mono', monospace; }

    .je-stat-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
    }

    .je-stat-icon {
      width: 40px; height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .je-stat-value {
      font-size: 18px;
      font-weight: 700;
      font-family: 'DM Mono', monospace;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .je-stat-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .result-count {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    .lines-row td {
      background: #f8fafc;
      padding: 0 !important;
    }

    .lines-panel {
      padding: 16px 20px;
      border-top: 2px solid #e2e8f0;
    }

    .lines-header {
      font-size: 13px;
      font-weight: 600;
      color: #2563a8;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .lines-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f1f5f9;
        padding: 8px 12px;
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      td {
        padding: 8px 12px;
        border-bottom: 1px solid #f1f5f9;
        color: #0f172a;
        vertical-align: middle;
      }

      tr:last-child td { border-bottom: none; }
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }

    .btn-icon--success:hover {
      background: #dcfce7;
      color: #166534;
      border-color: #bbf7d0;
    }
  `]
})
export class JournalEntryComponent implements OnInit {
  private http         = inject(HttpClient);
  private notification = inject(NotificationService);

  // State
  loading         = signal(false);
  entries         = signal<JournalEntry[]>([]);
  lines           = signal<{
    id: string;
    journal_entry_id: string;
    account_id: string;
    debit: number;
    credit: number;
    narration: string;
  }[]>([]);
  accounts        = signal<Account[]>([]);
  showForm        = signal(false);
  showConfirm     = signal(false);
  expandedEntry   = signal<string | null>(null);
  entryToDelete   = signal<JournalEntry | null>(null);

  // Filters
  searchQuery    = '';
  selectedStatus = '';
  selectedType   = '';
  fromDate       = '';
  toDate         = '';
  currentPage    = signal(1);
  pageSize       = 10;

  journalTypes = Object.entries(JOURNAL_TYPE_LABELS).map(
    ([value, label]) => ({ value, label })
  );

  formatDate = formatDate;

  // ── Computed ─────────────────────────────────────────────
  filteredEntries = computed(() => {
    let list = this.entries();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(e =>
        e.reference.toLowerCase().includes(q) ||
        e.narration.toLowerCase().includes(q)
      );
    }

    if (this.selectedStatus) {
      list = list.filter(e => e.status === this.selectedStatus);
    }

    if (this.selectedType) {
      list = list.filter(e => e.type === this.selectedType);
    }

    if (this.fromDate) {
      list = list.filter(e => e.entry_date >= this.fromDate);
    }

    if (this.toDate) {
      list = list.filter(e => e.entry_date <= this.toDate);
    }

    return list;
  });

  paginatedEntries = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredEntries().slice(start, start + this.pageSize);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredEntries().length / this.pageSize) || 1
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

  // Summary stats
  totalEntries   = computed(() => this.entries().length);
  postedEntries  = computed(() =>
    this.entries().filter(e => e.status === 'posted').length
  );
  draftEntries   = computed(() =>
    this.entries().filter(e => e.status === 'draft').length
  );
  totalDebitAmount = computed(() =>
    this.lines().reduce((s, l) => s + l.debit, 0)
  );

  get startItem(): number {
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(
      this.currentPage() * this.pageSize,
      this.filteredEntries().length
    );
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      entries:  this.http.get<JournalEntry[]>(
        API_ENDPOINTS.JOURNAL_ENTRIES
      ),
      lines:    this.http.get<any[]>(
        API_ENDPOINTS.JOURNAL_LINES
      ),
      accounts: this.http.get<Account[]>(
        API_ENDPOINTS.ACCOUNTS
      )
    }).subscribe({
      next: ({ entries, lines, accounts }) => {
        this.entries.set(entries);
        this.lines.set(lines);
        this.accounts.set(accounts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  getTypeLabel(type: string): string {
    return JOURNAL_TYPE_LABELS[type as keyof typeof JOURNAL_TYPE_LABELS]
      ?? type;
  }

  getAccountName(accountId: string): string {
    const acc = this.accounts().find(a => a.id === accountId);
    return acc ? `${acc.code} — ${acc.name}` : accountId;
  }

  getLinesForEntry(entryId: string) {
    return this.lines().filter(l => l.journal_entry_id === entryId);
  }

  getEntryDebit(entryId: string): number {
    return this.getLinesForEntry(entryId)
      .reduce((s, l) => s + l.debit, 0);
  }

  getEntryCredit(entryId: string): number {
    return this.getLinesForEntry(entryId)
      .reduce((s, l) => s + l.credit, 0);
  }

  // ── View lines ───────────────────────────────────────────
  viewLines(entry: JournalEntry): void {
    this.expandedEntry.set(
      this.expandedEntry() === entry.id ? null : entry.id
    );
  }

  // ── Post entry ───────────────────────────────────────────
  postEntry(entry: JournalEntry): void {
    this.http.patch(
      `${API_ENDPOINTS.JOURNAL_ENTRIES}/${entry.id}`,
      { status: 'posted' }
    ).subscribe({
      next: () => {
        this.entries.update(list =>
          list.map(e =>
            e.id === entry.id
              ? { ...e, status: 'posted' as const }
              : e
          )
        );
        this.notification.success(
          `${entry.reference} posted successfully`
        );
      }
    });
  }

  // ── Reverse entry ────────────────────────────────────────
  reverseEntry(entry: JournalEntry): void {
    this.notification.info(
      'Reversal entry feature coming soon'
    );
  }

  // ── Save new entry ───────────────────────────────────────
  onSave(data: JournalFormData & { status: string }): void {
    const year = new Date().getFullYear();
    const seq  = String(Date.now()).slice(-4);
    const ref  = `JE-${year}-${seq}`;

    const payload = {
      id:         `je-${Date.now()}`,
      tenant_id:  't1',
      reference:  ref,
      entry_date: data.entry_date,
      type:       data.type,
      status:     data.status,
      narration:  data.narration,
      created_by: 'user-001'
    };

    this.http.post<JournalEntry>(
      API_ENDPOINTS.JOURNAL_ENTRIES, payload
    ).subscribe({
      next: (created) => {
        // Save journal lines
        data.lines.forEach((line, i) => {
          const linePayload = {
            id:               `jl-${Date.now()}-${i}`,
            journal_entry_id: created.id,
            account_id:       line.account_id,
            debit:            line.debit,
            credit:           line.credit,
            narration:        line.narration
          };
          this.http.post(
            API_ENDPOINTS.JOURNAL_LINES, linePayload
          ).subscribe();
          this.lines.update(list => [...list, linePayload]);
        });

        this.entries.update(list => [created, ...list]);
        this.showForm.set(false);
        this.notification.success(
          `Journal entry ${ref} created`
        );
      }
    });
  }

  // ── Delete ───────────────────────────────────────────────
  confirmDelete(entry: JournalEntry): void {
    this.entryToDelete.set(entry);
    this.showConfirm.set(true);
  }

  onDelete(): void {
    const entry = this.entryToDelete();
    if (!entry) return;

    this.http.delete(
      `${API_ENDPOINTS.JOURNAL_ENTRIES}/${entry.id}`
    ).subscribe({
      next: () => {
        this.entries.update(list =>
          list.filter(e => e.id !== entry.id)
        );
        this.showConfirm.set(false);
        this.entryToDelete.set(null);
        this.notification.success('Entry deleted');
      }
    });
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
    this.selectedType   = '';
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
  exportJournal(): void {
    const data = this.filteredEntries();
    const csv  = [
      ['Reference','Date','Type','Status','Narration'].join(','),
      ...data.map(e => [
        e.reference,
        e.entry_date,
        e.type,
        e.status,
        `"${e.narration}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = 'journal-entries.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}