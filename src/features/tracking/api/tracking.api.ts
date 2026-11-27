import { apiClient } from '../../../lib/api-client';

export interface TrackingTimelineItem {
  status: string;
  title: string;
  description: string | null;
  timestamp: string;
  location: string | null;
}

export interface PublicTrackingData {
  trackingNumber: string;
  status: string;
  pickupCity: string | null;
  pickupDistrict: string | null;
  deliveryCity: string | null;
  deliveryDistrict: string | null;
  timeline: TrackingTimelineItem[];
}

export interface CustomerTrackingData {
  trackingNumber: string;
  parcelId: string;
  status: string;
  senderName: string | null;
  senderPhone: string | null;
  recipientName: string | null;
  recipientPhone: string | null;
  recipientAddress: string | null;
  courierId: string | null;
  timeline: TrackingTimelineItem[];
}

export const trackingApi = {
  getPublicTracking: async (trackingNumber: string): Promise<PublicTrackingData> => {
    const response = await apiClient.get<PublicTrackingData>(
      `/tracking/public/${encodeURIComponent(trackingNumber.trim())}`
    );
    return response.data;
  },

  getCustomerTracking: async (trackingNumber: string): Promise<CustomerTrackingData> => {
    const response = await apiClient.get<CustomerTrackingData>(
      `/tracking/${encodeURIComponent(trackingNumber.trim())}`
    );
    return response.data;
  },
};
