import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading.isLoading()) {
      <div class="page-loader">
        <div class="loader-content">
          <div class="spinner"></div>
          <p class="loader-text">{{ loading.loadingText() }}</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-loader {
      position: fixed;
      inset: 0;
      background: rgba(255, 255, 255, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
    }
    .loader-content {
      text-align: center;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563a8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 12px;
    }
    .loader-text {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      font-family: 'DM Sans', sans-serif;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoaderComponent {
  loading = inject(LoadingService);
}