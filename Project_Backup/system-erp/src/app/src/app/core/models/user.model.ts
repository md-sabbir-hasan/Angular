import { AppRole } from '../constants/permissions';

export interface User {
  id: string;
  full_name: string;
  email: string;
  password?: string;
  role: AppRole;
  company_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthUser extends Omit<User, 'password'> {
  token?: string;
}