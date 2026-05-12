import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop fade show"></div>
      <div
        class="modal fade show d-block"
        tabindex="-1"
        (click)="onBackdropClick($event)">
        <div
          class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          [ngClass]="sizeClass"
          (click)="$event.stopPropagation()">
          <div class="modal-content">

            <!-- Header -->
            <div class="modal-header">
              <h5 class="modal-title">
                @if (icon) {
                  <i class="bi me-2" [ngClass]="icon"></i>
                }
                {{ title }}
              </h5>
              @if (showClose) {
                <button
                  type="button"
                  class="btn-close"
                  (click)="close()">
                </button>
              }
            </div>

            <!-- Body -->
            <div class="modal-body">
              <ng-content></ng-content>
            </div>

            <!-- Footer -->
            @if (showFooter) {
              <div class="modal-footer">
                <ng-content select="[slot=footer]"></ng-content>
              </div>
            }

          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  @Input() isOpen     = false;
  @Input() title      = '';
  @Input() icon       = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showClose  = true;
  @Input() showFooter = true;
  @Input() closeOnBackdrop = true;

  @Output() closed = new EventEmitter<void>();

  get sizeClass(): string {
    const sizes = {
      sm: 'modal-sm',
      md: '',
      lg: 'modal-lg',
      xl: 'modal-xl'
    };
    return sizes[this.size];
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }
}