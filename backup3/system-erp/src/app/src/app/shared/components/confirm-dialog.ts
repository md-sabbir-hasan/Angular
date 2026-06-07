import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.css']
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