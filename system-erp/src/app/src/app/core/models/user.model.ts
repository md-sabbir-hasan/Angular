export type UserRole = 'admin' | 'accountant' | 'viewer' | 'manager';

export interface User {
  id: string;
  company_name: string;
  full_name: string;
  email: string;
  phone: string;
  password?: string;
  bin_number: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  avatar?: string;
}

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  company_name: string;
  bin_number: string;
  token: string;
}

export interface UserPermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canApprove: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
    canApprove: true
  },
  manager: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canExport: true,
    canApprove: true
  },
  accountant: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canExport: true,
    canApprove: false
  },
  viewer: {
    canCreate: false,
    canRead: true,
    canUpdate: false,
    canDelete: false,
    canExport: false,
    canApprove: false
  }
};