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
import { HasPermissionDirective } from '../../../shared/directives/has-permission';

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
    StatusPipe,
    HasPermissionDirective
  ],
  templateUrl: './journal-entry.html',
  styleUrls: ['./journal-entry.css']
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
  searchQuery    = signal('');
  selectedStatus = signal('');
  selectedType   = signal('');
  fromDate       = signal('');
  toDate         = signal('');
  currentPage    = signal(1);
  pageSize       = 10;

  journalTypes = Object.entries(JOURNAL_TYPE_LABELS).map(
    ([value, label]) => ({ value, label })
  );

  formatDate = formatDate;

  // ── Computed ─────────────────────────────────────────────
  filteredEntries = computed(() => {
    let list = this.entries();
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();
    const type = this.selectedType();
    const from = this.fromDate();
    const to = this.toDate();

    if (query) {
      list = list.filter(e =>
        e.reference.toLowerCase().includes(query) ||
        e.narration.toLowerCase().includes(query)
      );
    }

    if (status) {
      list = list.filter(e => e.status === status);
    }

    if (type) {
      list = list.filter(e => e.type === type);
    }

    if (from) {
      list = list.filter(e => e.entry_date >= from);
    }

    if (to) {
      list = list.filter(e => e.entry_date <= to);
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
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.selectedType.set('');
    this.fromDate.set('');
    this.toDate.set('');
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