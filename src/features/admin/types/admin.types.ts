import type { UserRole } from '../../../types/global.types';

export interface UserAdmin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  status: 'ACTIVE' | 'DEACTIVATED';
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  deactivatedUsers: number;
  customers: number;
  merchants: number;
  couriers: number;
  dispatchers: number;
  admins: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
