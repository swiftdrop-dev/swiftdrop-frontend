import { apiClient } from '../../../lib/api-client';
import type { CourierProfile } from '../types/courier.types';

const COURIER_API_BASE_URL =
  import.meta.env.VITE_COURIER_API_BASE_URL
  || import.meta.env.VITE_API_BASE_URL
  || '/api/v1';

export const courierApi = {
  getCurrentProfile: async (): Promise<CourierProfile> => {
    const response = await apiClient.get<CourierProfile>('/couriers/me', {
      baseURL: COURIER_API_BASE_URL,
    });
    return response.data;
  },

  updateAvailability: async (isAvailable: boolean): Promise<CourierProfile> => {
    const response = await apiClient.put<CourierProfile>(
      '/couriers/me/availability',
      { isAvailable },
      { baseURL: COURIER_API_BASE_URL },
    );
    return response.data;
  },

  getAllCouriers: async (): Promise<CourierProfile[]> => {
    const response = await apiClient.get<CourierProfile[]>('/couriers', {
      baseURL: COURIER_API_BASE_URL,
    });
    return response.data;
  },

  getCourierSummary: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get<Record<string, number>>('/couriers/summary', {
      baseURL: COURIER_API_BASE_URL,
    });
    return response.data;
  },
};

