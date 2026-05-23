import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission';

/**
 * Functional Role Guard
 * Checks if the user has the required permission defined in the route data
 * Example:
 * {
 *   path: 'journal',
 *   canActivate: [authGuard, roleGuard],
 *   data: { permission: 'journal:view' }
 * }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  // Get required permission from route data
  const requiredPermission = route.data['permission'] as string;

  // If no permission is required, allow access
  if (!requiredPermission) {
    return true;
  }

  // Check if user has the permission
  if (permissionService.hasPermission(requiredPermission)) {
    return true;
  }

  // If no permission, redirect to access denied page
  router.navigate(['/access-denied']);
  return false;
};