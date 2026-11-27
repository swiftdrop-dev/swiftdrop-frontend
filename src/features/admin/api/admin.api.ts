import { apiClient } from '../../../lib/api-client';
import type { UserAdmin, UserStats, PageResponse } from '../types/admin.types';

export const adminUserApi = {
  getUsers: async (
    query?: string,
    role?: string,
    status?: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<UserAdmin>> => {
    const params = new URLSearchParams();
    if (query && query.trim()) params.append('query', query.trim());
    if (role && role !== 'ALL') params.append('role', role.toLowerCase());
    if (status && status !== 'ALL') params.append('status', status.toLowerCase());
    params.append('page', page.toString());
    params.append('size', size.toString());

    const res = await apiClient.get<PageResponse<UserAdmin>>(`/auth/admin/users?${params.toString()}`);
    return res.data;
  },

  getUserById: async (userId: string): Promise<UserAdmin> => {
    const res = await apiClient.get<UserAdmin>(`/auth/admin/users/${userId}`);
    return res.data;
  },

  updateUserStatus: async (userId: string, active: boolean): Promise<UserAdmin> => {
    const res = await apiClient.patch<UserAdmin>(`/auth/admin/users/${userId}/status`, { active });
    return res.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<UserAdmin> => {
    const res = await apiClient.put<UserAdmin>(`/auth/admin/users/${userId}/role`, { role });
    return res.data;
  },

  getUserStats: async (): Promise<UserStats> => {
    const res = await apiClient.get<UserStats>('/auth/admin/stats');
    return res.data;
  },
};
