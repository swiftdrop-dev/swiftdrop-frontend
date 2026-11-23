import { apiClient } from '../../../lib/api-client';

export interface CreateParcelBookingRequest {
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  pickupAddress: string;
  description?: string;
  weightKg: number;
  parcelSize?: string;
  fragile?: boolean;
  paymentMethod?: string;
  totalFee?: number;
}

export interface ParcelBookingResponse {
  id: string;
  trackingNumber: string;
  status: string;
  senderId: string;
  senderName?: string;
  senderPhone?: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  pickupAddress: string;
  weightKg: number;
  parcelSize?: string;
  description?: string;
  fragile?: boolean;
  totalFee: number | null;
  feeStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  courierId?: string | null;
  estimatedDeliveryDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerParcelPageResponse {
  content: ParcelBookingResponse[];
  page: number;
  size: number;
  hasNext: boolean;
}

export const PARCEL_API_BASE_URL =
  import.meta.env.VITE_PARCEL_API_BASE_URL
  || import.meta.env.VITE_API_BASE_URL
  || '/api/v1';

export const customerParcelApi = {
  bookParcel: async (request: CreateParcelBookingRequest): Promise<ParcelBookingResponse> => {
    const response = await apiClient.post<ParcelBookingResponse>('/parcels', request, {
      baseURL: PARCEL_API_BASE_URL,
    });
    return response.data;
  },

  getMyParcels: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<CustomerParcelPageResponse> => {
    const response = await apiClient.get<CustomerParcelPageResponse>('/parcels/customer/me', {
      baseURL: PARCEL_API_BASE_URL,
      params,
    });
    return response.data;
  },

  getParcelById: async (id: string): Promise<ParcelBookingResponse> => {
    const response = await apiClient.get<ParcelBookingResponse>(`/parcels/${encodeURIComponent(id)}`, {
      baseURL: PARCEL_API_BASE_URL,
    });
    return response.data;
  },

  getParcelByTrackingNumber: async (trackingNumber: string): Promise<ParcelBookingResponse> => {
    const response = await apiClient.get<ParcelBookingResponse>(`/parcels/track/${encodeURIComponent(trackingNumber)}`, {
      baseURL: PARCEL_API_BASE_URL,
    });
    return response.data;
  },
};
