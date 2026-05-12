import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';



@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="stat-card" [ngClass]="variant">
      <div class="stat-card__label">{{ label }}</div>
      <div class="stat-card__value">
        @if (isCurrency) {
          {{ value | currency }}
        } @else {
          {{ value }}
        }
      </div>
      @if (change !== null) {
        <div
          class="stat-card__change"
          [ngClass]="change >= 0 ? 'up' : 'down'">
          <i class="bi"
            [ngClass]="change >= 0
              ? 'bi-arrow-up-right'
              : 'bi-arrow-down-right'">
          </i>
          {{ change >= 0 ? '+' : '' }}{{ change | number:'1.1-1' }}%
          vs last period
        </div>
      }
      @if (subtitle) {
        <div class="stat-card__change neutral">
          {{ subtitle }}
        </div>
      }
      <div class="stat-card__icon">
        <i class="bi" [ngClass]="icon"></i>
      </div>
    </div>
  `
})
export class ReportCardComponent {
  @Input() label      = '';
  @Input() value: number | string = 0;
  @Input() icon       = 'bi-graph-up';
  @Input() variant    = '';
  @Input() isCurrency = true;
  @Input() change: number | null = null;
  @Input() subtitle   = '';
}