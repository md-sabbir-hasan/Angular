import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading';


export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  // Skip loading indicator for small requests
  const skipLoading = req.headers.has('X-Skip-Loading');
  if (skipLoading) return next(req);

  loading.show();

  return next(req).pipe(
    finalize(() => loading.hide())
  );
};