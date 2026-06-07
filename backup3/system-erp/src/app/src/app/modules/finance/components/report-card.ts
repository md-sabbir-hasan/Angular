import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';



@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './report-card.html',
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