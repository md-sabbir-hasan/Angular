import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage';


export const authGuard: CanActivateFn = (route, state) => {
  const storage = inject(StorageService);
  const router  = inject(Router);

  if (storage.isLoggedIn()) {
    return true;
  }

  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};