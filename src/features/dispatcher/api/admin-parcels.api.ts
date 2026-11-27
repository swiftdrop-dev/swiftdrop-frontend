import { apiClient } from '../../../lib/api-client';
import type { ParcelBookingResponse } from '../../customer/services/customer-parcel.api';

export interface AdminParcelSummary {
  totalParcels: number;
  pending: number;
  inTransit: number;
  delivered: number;
  failed: number;
  totalRevenue: number;
  statusCounts: Record<string, number>;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const adminParcelsApi = {
  getAllParcels: async (params?: {
    query?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<SpringPage<ParcelBookingResponse>> => {
    const q = new URLSearchParams();
    if (params?.query) q.append('query', params.query);
    if (params?.status && params.status !== 'all') q.append('status', params.status);
    if (params?.page !== undefined) q.append('page', params.page.toString());
    if (params?.size !== undefined) q.append('size', params.size.toString());
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    const res = await apiClient.get<SpringPage<ParcelBookingResponse>>(`/parcels/admin/all${queryStr}`);
    return res.data;
  },

  getSummary: async (): Promise<AdminParcelSummary> => {
    const res = await apiClient.get<AdminParcelSummary>('/parcels/admin/summary');
    return res.data;
  },
};
