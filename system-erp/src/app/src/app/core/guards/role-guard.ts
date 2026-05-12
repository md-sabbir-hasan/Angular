import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { NotificationService } from '../services/notification';


export const roleGuard: CanActivateFn = (route) => {
  const auth         = inject(AuthService);
  const router       = inject(Router);
  const notification = inject(NotificationService);

  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const userRole = auth.userRole();

  if (!userRole) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (userRole === 'admin' || requiredRoles.includes(userRole)) {
    return true;
  }

  notification.error('You do not have permission to access this page.');
  router.navigate(['/finance/dashboard']);
  return false;
};