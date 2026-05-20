import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'amount' | 'date' | 'badge' | 'actions';
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-wrapper">
      <table class="erp-table">
        <thead>
          <tr>
            @for (col of columns; track col.key) {
              <th
                [class.sortable]="col.sortable"
                [class.text-right]="col.align === 'right'"
                [class.text-center]="col.align === 'center'"
                (click)="col.sortable && onSort(col.key)">
                {{ col.label }}
                @if (col.sortable && sortKey === col.key) {
                  <i class="bi"
                    [ngClass]="sortOrder === 'asc'
                      ? 'bi-sort-up'
                      : 'bi-sort-down'">
                  </i>
                }
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading) {
            @for (row of skeletonRows; track row) {
              <tr>
                @for (col of columns; track col.key) {
                  <td>
                    <div class="skeleton"
                      style="height:14px; border-radius:4px;">
                    </div>
                  </td>
                }
              </tr>
            }
          } @else if (data.length === 0) {
            <tr>
              <td [attr.colspan]="columns.length">
                <div class="table-empty">
                  <i class="bi bi-inbox"></i>
                  <p>{{ emptyMessage }}</p>
                </div>
              </td>
            </tr>
          } @else {
            <ng-content></ng-content>
          }
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    @if (data.length > 0 && showPagination) {
      <div class="erp-pagination">
        <span class="page-info">
          Showing {{ startItem }}–{{ endItem }} of {{ total }} entries
        </span>
        <div class="page-controls">
          <button (click)="onPage(1)" [disabled]="currentPage === 1">
            <i class="bi bi-chevron-double-left"></i>
          </button>
          <button (click)="onPage(currentPage - 1)" [disabled]="currentPage === 1">
            <i class="bi bi-chevron-left"></i>
          </button>
          @for (p of pages; track p) {
            <button
              [class.active]="p === currentPage"
              (click)="onPage(p)">
              {{ p }}
            </button>
          }
          <button
            (click)="onPage(currentPage + 1)"
            [disabled]="currentPage === totalPages">
            <i class="bi bi-chevron-right"></i>
          </button>
          <button
            (click)="onPage(totalPages)"
            [disabled]="currentPage === totalPages">
            <i class="bi bi-chevron-double-right"></i>
          </button>
        </div>
      </div>
    }
  `
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: unknown[]        = [];
  @Input() loading                = false;
  @Input() total                  = 0;
  @Input() currentPage            = 1;
  @Input() pageSize               = 10;
  @Input() showPagination         = true;
  @Input() emptyMessage           = 'No records found';

  @Output() sortChanged = new EventEmitter<{ key: string; order: string }>();
  @Output() pageChanged = new EventEmitter<number>();

  sortKey   = '';
  sortOrder = 'asc';

  get skeletonRows(): number[] {
    return Array(5).fill(0).map((_, i) => i);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize) || 1;
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.total);
  }

  get pages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end   = Math.min(this.totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  onSort(key: string): void {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey   = key;
      this.sortOrder = 'asc';
    }
    this.sortChanged.emit({ key: this.sortKey, order: this.sortOrder });
  }

  onPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChanged.emit(page);
    }
  }
}