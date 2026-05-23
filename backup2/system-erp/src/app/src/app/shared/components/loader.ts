import { Component, inject } from '@angular/core';

import { LoadingService } from '../../core/services/loading';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
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
  styleUrls: ['./loader.css'],
})
export class LoaderComponent {
  loading = inject(LoadingService);
}
