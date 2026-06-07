import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth';
import { AppPermission, AppRole, ROLE_PERMISSIONS } from '../constants/permissions';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private auth = inject(AuthService);

  // Computed signal that returns permissions for current user role
  readonly userPermissions = computed(() => {
    const role = this.auth.userRole();
    if (!role) return [] as string[];
    
    // Safety check: ensure the role exists in the matrix
    const perms = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
    return (perms || []) as string[];
  });

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string | AppPermission): boolean {
    const permString = permission.toString();
    return this.userPermissions().includes(permString);
  }


  /**
   * Check if user has any of the given permissions
   */
  hasAnyPermission(permissions: string[] | AppPermission[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }

  /**
   * Check if user has all of the given permissions
   */
  hasAllPermissions(permissions: string[] | AppPermission[]): boolean {
    return permissions.every(p => this.hasPermission(p));
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: AppRole): boolean {
    return this.auth.userRole() === role;
  }

  // Convenient helpers as requested
  canView(module: string): boolean {
    return this.hasPermission(`${module}:view`);
  }

  canCreate(module: string): boolean {
    return this.hasPermission(`${module}:create`);
  }

  canEdit(module: string): boolean {
    return this.hasPermission(`${module}:edit`);
  }

  canDelete(module: string): boolean {
    return this.hasPermission(`${module}:delete`);
  }
}
