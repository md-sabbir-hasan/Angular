import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styles: [`
    .coming-soon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 40px;
    }
    .cs-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 48px;
      text-align: center;
      max-width: 480px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    .cs-icon {
      width: 80px;
      height: 80px;
      background: #f1f5f9;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      color: #64748b;
      margin: 0 auto 24px;
    }
    h2 {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    p {
      font-size: 14px;
      color: #64748b;
      line-height: 1.7;
      margin-bottom: 24px;
    }
    .cs-features {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 28px;
      text-align: left;
    }
    .cs-feature {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13.5px;
      color: #64748b;
      i { color: #166534; font-size: 14px; }
    }
  `]
})
export class DashboardComponent {}