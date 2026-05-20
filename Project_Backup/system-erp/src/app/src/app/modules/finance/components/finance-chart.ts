import {
  Component, Input, OnInit, OnChanges,
  ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-finance-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-chart.html',
  styles: [`
    .bar-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 200px;
      padding: 0 8px;
      gap: 8px;
    }
    .bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      height: 100%;
    }
    .bars {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      flex: 1;
      width: 100%;
      justify-content: center;
    }
    .bar {
      border-radius: 4px 4px 0 0;
      min-width: 12px;
      max-width: 24px;
      flex: 1;
      transition: height 0.5s ease;
      cursor: pointer;
      &:hover { opacity: 0.8; }
    }
    .bar--primary   { background: #2563a8; }
    .bar--secondary { background: #e8a020; }
    .bar-label {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 6px;
      text-align: center;
    }
    .donut-chart {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 16px;
    }
    .donut-ring {
      width: 120px; height: 120px;
      border-radius: 50%;
      background: conic-gradient(
        #2563a8 0% 45%,
        #e8a020 45% 70%,
        #166534 70% 85%,
        #991b1b 85% 100%
      );
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .donut-hole {
      width: 80px; height: 80px;
      background: #fff;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .donut-total {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .donut-label {
      font-size: 10px;
      color: #94a3b8;
    }
    .donut-legend { flex: 1; }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 12.5px;
    }
    .legend-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-label { flex: 1; color: #64748b; }
    .legend-value { font-weight: 600; color: #0f172a; }
    .line-chart { padding: 8px 0; }
  `]
})
export class FinanceChartComponent implements OnChanges {
  @Input() title    = '';
  @Input() subtitle = '';
  @Input() type: 'bar' | 'donut' | 'line' = 'bar';
  @Input() chartData: {
    label:   string;
    value:   number;
    value2?: number;
    color?:  string;
  }[] = [];

  maxValue = 0;

  ngOnChanges(): void {
    const allValues = this.chartData.flatMap(d =>
      d.value2 !== undefined
        ? [d.value, d.value2]
        : [d.value]
    );
    this.maxValue = Math.max(...allValues, 1);
  }

  get totalValue(): number {
    return this.chartData.reduce((s, d) => s + d.value, 0);
  }

  getBarHeight(value: number): number {
    return (value / this.maxValue) * 90;
  }

  getPercent(value: number): string {
    return ((value / this.totalValue) * 100).toFixed(1);
  }

  getPointX(i: number): number {
    const padding = 60;
    const width   = 540;
    return padding + (i / (this.chartData.length - 1)) * width;
  }

  getPointY(value: number): number {
    const maxY   = 160;
    const minY   = 40;
    const height = maxY - minY;
    return maxY - (value / this.maxValue) * height;
  }

  getLinePoints(): string {
    return this.chartData
      .map((d, i) => `${this.getPointX(i)},${this.getPointY(d.value)}`)
      .join(' ');
  }

  getAreaPoints(): string {
    const linePoints = this.chartData
      .map((d, i) => `${this.getPointX(i)},${this.getPointY(d.value)}`)
      .join(' ');
    const lastX = this.getPointX(this.chartData.length - 1);
    const firstX = this.getPointX(0);
    return `${linePoints} ${lastX},160 ${firstX},160`;
  }
}