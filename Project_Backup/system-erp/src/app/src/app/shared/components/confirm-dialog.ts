import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styles: [`
    .confirm-dialog {
      border: none;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .confirm-dialog__header {
      padding: 28px 24px 0;
      text-align: center;
    }
    .confirm-icon {
      width: 56px; height: 56px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 4px;
    }
    .confirm-icon.danger  { background: #fee2e2; color: #991b1b; }
    .confirm-icon.warning { background: #fef9c3; color: #854d0e; }
    .confirm-icon.info    { background: #e0f2fe; color: #075985; }
    .confirm-dialog__body {
      padding: 12px 24px 20px;
      text-align: center;
      h5 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
      p  { font-size: 13.5px; color: #64748b; margin: 0; }
    }
    .confirm-dialog__footer {
      padding: 0 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .btn-confirm-danger {
      padding: 9px 16px;
      background: #991b1b;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      transition: all .15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-confirm-danger:hover { background: #7f1d1d; }
    .btn-confirm-primary {
      padding: 9px 16px;
      background: #2563a8;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      transition: all .15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-confirm-primary:hover { background: #1a3a5c; }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen      = false;
  @Input() title       = 'Confirm Action';
  @Input() message     = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText  = 'Cancel';
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  get icon(): string {
    const icons = {
      danger:  'bi-trash3',
      warning: 'bi-exclamation-triangle',
      info:    'bi-question-circle'
    };
    return icons[this.type];
  }

  get iconClass(): string {
    return this.type;
  }

  get confirmBtnClass(): string {
    return this.type === 'danger'
      ? 'btn-confirm-danger'
      : 'btn-confirm-primary';
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}