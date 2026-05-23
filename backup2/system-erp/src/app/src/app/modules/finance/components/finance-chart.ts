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
  styleUrls: ['./finance-chart.css']
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