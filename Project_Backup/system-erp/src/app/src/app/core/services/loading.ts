import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading = signal<boolean>(false);
  private _loadingText = signal<string>('Loading...');
  private requestCount = 0;

  // Expose as readonly signals
  readonly isLoading = this._loading.asReadonly();
  readonly loadingText = this._loadingText.asReadonly();

  show(text: string = 'Loading...'): void {
    this.requestCount++;
    this._loadingText.set(text);
    this._loading.set(true);
  }

  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this._loading.set(false);
    }
  }

  forceHide(): void {
    this.requestCount = 0;
    this._loading.set(false);
  }
}