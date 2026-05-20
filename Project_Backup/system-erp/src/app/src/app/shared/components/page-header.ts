import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './page-header.html',
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .page-header__actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }
    .bc-item {
      color: #64748b;
      text-decoration: none;
      &:hover { color: #2563a8; }
      &.active { color: #0f172a; font-weight: 500; }
    }
    .bc-sep {
      color: #94a3b8;
      font-size: 10px;
    }
    .page-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.3px;
    }
    .page-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 4px 0 0;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title       = '';
  @Input() subtitle    = '';
  @Input() breadcrumbs: BreadcrumbItem[] = [];
}