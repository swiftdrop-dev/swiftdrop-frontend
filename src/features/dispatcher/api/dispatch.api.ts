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
    const body = {
      courierId: payload.courierId,
      dispatcherNotes: payload.dispatcherNotes,
    };
    const res = await apiClient.post<{ success: boolean; data: DispatchJob }>(
      `/dispatch/jobs/${jobId}/assign`,
      body
    );
    return res.data.data;
  },

  autoDispatch: async (jobId?: string): Promise<DispatchJob> => {
    await apiClient.post<{ success: boolean; data: number }>(
      '/dispatch/jobs/auto-dispatch'
    );
    if (jobId) {
      try {
        return await dispatchApi.getJobById(jobId);
      } catch {
        // Fallback if job is already picked up or query failed
      }
    }
    return { id: jobId || '' } as DispatchJob;
  },

  getJobById: async (jobId: string): Promise<DispatchJob> => {
    const res = await apiClient.get<{ success: boolean; data: DispatchJob }>(`/dispatch/jobs/${jobId}`);
    return res.data.data;
  },

  getJobByTrackingNumber: async (trackingNumber: string): Promise<DispatchJob> => {
    const res = await apiClient.get<{ success: boolean; data: DispatchJob }>(
      `/dispatch/jobs/tracking/${trackingNumber}`
    );
    return res.data.data;
  },

  getJobByParcelId: async (parcelId: string): Promise<DispatchJob> => {
    try {
      const res = await apiClient.get<{ success: boolean; data: DispatchJob }>(
        `/dispatch/jobs/by-parcel/${parcelId}`
      );
      return res.data.data;
    } catch {
      // Fallback
      return { id: '', parcelId } as DispatchJob;
    }
  },

  respondToOffer: async (jobId: string, payload: CourierDecisionPayload): Promise<DispatchJob> => {
    const body = {
      accept: payload.accepted,
      reason: payload.reason,
    };
    const res = await apiClient.post<{ success: boolean; data: DispatchJob }>(
      `/dispatch/courier/jobs/${jobId}/decision`,
      body
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
    const body = {
      courierId: payload.courierId,
      courierName: payload.courierName,
      courierPhone: payload.courierPhone,
      vehicleType: payload.vehicleType,
      isAvailable: payload.isAvailable,
      isOnline: true,
      currentLatitude: payload.currentLatitude,
      currentLongitude: payload.currentLongitude,
      activeDeliveriesCount: payload.activeDeliveries || 0,
    };
    await apiClient.post('/dispatch/projections/couriers/sync', body);
  },
};

