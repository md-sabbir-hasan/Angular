import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';



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