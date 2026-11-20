import { apiClient } from '../../../lib/api-client';
import { COURIER_DELIVERIES_API_BASE_URL } from './deliveries.api';
import type {
  DeliveryCompletionResponse,
  DeliveryPhotoProofResponse,
  OtpChallengeReceipt,
  OtpVerificationResponse,
} from '../types/proof-of-delivery.types';

const parcelPath = (parcelId: string) => `/parcels/${encodeURIComponent(parcelId)}`;

export const proofOfDeliveryApi = {
  requestOtp: async (parcelId: string): Promise<OtpChallengeReceipt> => {
    const response = await apiClient.post<OtpChallengeReceipt>(
      `${parcelPath(parcelId)}/delivery-otp`,
      undefined,
      { baseURL: COURIER_DELIVERIES_API_BASE_URL },
    );
    return response.data;
  },

  verifyOtp: async (parcelId: string, challengeId: string, code: string): Promise<OtpVerificationResponse> => {
    const response = await apiClient.post<OtpVerificationResponse>(
      `${parcelPath(parcelId)}/delivery-otp/verify`,
      { challengeId, code },
      { baseURL: COURIER_DELIVERIES_API_BASE_URL },
    );
    return response.data;
  },

  uploadPhoto: async (parcelId: string, assignmentId: number, photo: File): Promise<DeliveryPhotoProofResponse> => {
    const formData = new FormData();
    formData.append('photo', photo);
    const response = await apiClient.post<DeliveryPhotoProofResponse>(
      `${parcelPath(parcelId)}/delivery-photo`,
      formData,
      {
        baseURL: COURIER_DELIVERIES_API_BASE_URL,
        params: { assignmentId },
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  },

  completeDelivery: async (
    parcelId: string,
    challengeId: string,
    photoProofId: string,
  ): Promise<DeliveryCompletionResponse> => {
    const response = await apiClient.post<DeliveryCompletionResponse>(
      `${parcelPath(parcelId)}/complete`,
      { challengeId, photoProofId },
      { baseURL: COURIER_DELIVERIES_API_BASE_URL },
    );
    return response.data;
  },
};
