import { apiClient } from '../../../lib/api-client';
import type {
  DashboardKpis,
  ParcelVolumeReport,
  StatusDistributionReport,
  DeliveryPerformanceReport,
  CourierPerformanceReport,
} from '../types/reports.types';

export const reportsApi = {
  getDashboardKpis: async (): Promise<DashboardKpis> => {
    const res = await apiClient.get<DashboardKpis>('/reports/dashboard-kpis');
    return res.data;
  },

  getParcelVolume: async (days = 7): Promise<ParcelVolumeReport> => {
    const res = await apiClient.get<ParcelVolumeReport>(`/reports/parcel-volume?days=${days}`);
    return res.data;
  },

  getStatusDistribution: async (): Promise<StatusDistributionReport> => {
    const res = await apiClient.get<StatusDistributionReport>('/reports/status-distribution');
    return res.data;
  },

  getDeliveryPerformance: async (): Promise<DeliveryPerformanceReport> => {
    const res = await apiClient.get<DeliveryPerformanceReport>('/reports/delivery-performance');
    return res.data;
  },

  getCourierPerformance: async (): Promise<CourierPerformanceReport> => {
    const res = await apiClient.get<CourierPerformanceReport>('/reports/courier-performance');
    return res.data;
  },
};
