import { apiClient } from '../../../lib/api-client';
import type {
  AssignedDeliveriesResponse,
  CourierParcelStatusUpdateRequest,
  CourierParcelStatusUpdateResponse,
  DispatchJobOffer,
  CourierDecisionRequest,
} from '../types/delivery.types';

export interface AssignedDeliveriesParams {
  page: number;
  size: number;
}

export const COURIER_DELIVERIES_API_BASE_URL =
  import.meta.env.VITE_COURIER_DELIVERIES_API_BASE_URL
  || import.meta.env.VITE_API_BASE_URL
  || '/api/v1';
const ASSIGNED_DELIVERIES_PATH = '/parcels/me/assigned-deliveries';

export const courierDeliveriesApi = {
  getAssignedDeliveries: async ({ page, size }: AssignedDeliveriesParams): Promise<AssignedDeliveriesResponse> => {
    const response = await apiClient.get<AssignedDeliveriesResponse>(ASSIGNED_DELIVERIES_PATH, {
      baseURL: COURIER_DELIVERIES_API_BASE_URL,
      params: { page, size },
    });
    return response.data;
  },
  updateParcelStatus: async (parcelId: string, request: CourierParcelStatusUpdateRequest): Promise<CourierParcelStatusUpdateResponse> => {
    const response = await apiClient.patch<CourierParcelStatusUpdateResponse>(
      '/parcels/' + encodeURIComponent(parcelId) + '/status', request,
      { baseURL: COURIER_DELIVERIES_API_BASE_URL },
    );
    return response.data;
  },
  getJobOffers: async (): Promise<DispatchJobOffer[]> => {
    const response = await apiClient.get<{ success: boolean; data: DispatchJobOffer[] }>(
      '/dispatch/courier/jobs/my-jobs'
    );
    return response.data?.data ?? [];
  },
  respondToJobOffer: async (jobId: string, decision: CourierDecisionRequest): Promise<unknown> => {
    const response = await apiClient.post(
      `/dispatch/courier/jobs/${encodeURIComponent(jobId)}/decision`,
      decision
    );
    return response.data;
  },
};
