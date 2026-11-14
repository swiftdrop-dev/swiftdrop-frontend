import { apiClient } from '../../../lib/api-client';
import type {
  DispatchJob,
  DispatchJobSummary,
  CourierCandidate,
  PageResponse,
  ManualAssignPayload,
  CourierDecisionPayload,
} from '../types/dispatch.types';

export const dispatchApi = {
  getUnassignedQueue: async (zoneCode?: string, page = 0, size = 20): Promise<PageResponse<DispatchJobSummary>> => {
    const params = new URLSearchParams();
    if (zoneCode) params.append('zoneCode', zoneCode);
    params.append('page', page.toString());
    params.append('size', size.toString());

    const res = await apiClient.get<{ success: boolean; data: PageResponse<DispatchJobSummary> }>(
      `/dispatch/jobs/unassigned?${params.toString()}`
    );
    return res.data.data;
  },

  getCandidates: async (jobId: string, maxRadiusKm?: number): Promise<CourierCandidate[]> => {
    const params = maxRadiusKm ? `?maxRadiusKm=${maxRadiusKm}` : '';
    const res = await apiClient.get<{ success: boolean; data: CourierCandidate[] }>(
      `/dispatch/jobs/${jobId}/candidates${params}`
    );
    return res.data.data;
  },

  manualAssign: async (jobId: string, payload: ManualAssignPayload): Promise<DispatchJob> => {
    const res = await apiClient.post<{ success: boolean; data: DispatchJob }>(
      `/dispatch/jobs/${jobId}/assign-manual`,
      payload
    );
    return res.data.data;
  },

  autoDispatch: async (jobId: string): Promise<DispatchJob> => {
    const res = await apiClient.post<{ success: boolean; data: DispatchJob }>(
      `/dispatch/jobs/${jobId}/auto-dispatch`
    );
    return res.data.data;
  },

  getJobById: async (jobId: string): Promise<DispatchJob> => {
    const res = await apiClient.get<{ success: boolean; data: DispatchJob }>(`/dispatch/jobs/${jobId}`);
    return res.data.data;
  },

  getJobByParcelId: async (parcelId: string): Promise<DispatchJob> => {
    const res = await apiClient.get<{ success: boolean; data: DispatchJob }>(
      `/dispatch/jobs/by-parcel/${parcelId}`
    );
    return res.data.data;
  },

  respondToOffer: async (jobId: string, payload: CourierDecisionPayload): Promise<DispatchJob> => {
    const res = await apiClient.post<{ success: boolean; data: DispatchJob }>(
      `/dispatch/jobs/${jobId}/courier-response`,
      payload
    );
    return res.data.data;
  },

  updateCourierProjection: async (payload: {
    courierId: string;
    courierName: string;
    courierPhone: string;
    vehicleType: string;
    isAvailable: boolean;
    currentLatitude: number;
    currentLongitude: number;
    rating?: number;
    activeDeliveries?: number;
  }): Promise<void> => {
    await apiClient.put('/dispatch/couriers/projection', payload);
  },
};
