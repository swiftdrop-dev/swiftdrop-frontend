import { apiClient } from '../../../lib/api-client';
import type {
  MerchantProfile,
  RegisterMerchantPayload,
  UpdateMerchantProfilePayload,
  AddAddressPayload,
  MerchantAddress,
  SetBankAccountPayload,
  MerchantBankAccount,
  UploadDocumentPayload,
  MerchantDocument,
  GenerateApiKeyPayload,
  ApiKeyCreatedResponse,
  MerchantApiCredential,
  MerchantAuditLog,
  UpdateWebhookPayload,
  PageResponse,
  PricingTier,
} from '../types/merchant.types';

export const merchantApi = {
  // Onboarding
  register: async (payload: RegisterMerchantPayload): Promise<MerchantProfile> => {
    const res = await apiClient.post<{ success: boolean; data: MerchantProfile }>(
      '/merchants/onboarding/register',
      payload
    );
    return res.data.data;
  },

  getMyProfile: async (): Promise<MerchantProfile> => {
    const res = await apiClient.get<{ success: boolean; data: MerchantProfile }>(
      '/merchants/onboarding/my-profile'
    );
    return res.data.data;
  },

  getProfile: async (merchantId: string): Promise<MerchantProfile> => {
    const res = await apiClient.get<{ success: boolean; data: MerchantProfile }>(
      `/merchants/onboarding/${merchantId}`
    );
    return res.data.data;
  },

  updateProfile: async (merchantId: string, payload: UpdateMerchantProfilePayload): Promise<MerchantProfile> => {
    const res = await apiClient.put<{ success: boolean; data: MerchantProfile }>(
      `/merchants/onboarding/${merchantId}`,
      payload
    );
    return res.data.data;
  },

  addAddress: async (merchantId: string, payload: AddAddressPayload): Promise<MerchantAddress> => {
    const res = await apiClient.post<{ success: boolean; data: MerchantAddress }>(
      `/merchants/onboarding/${merchantId}/addresses`,
      payload
    );
    return res.data.data;
  },

  setBankAccount: async (merchantId: string, payload: SetBankAccountPayload): Promise<MerchantBankAccount> => {
    const res = await apiClient.post<{ success: boolean; data: MerchantBankAccount }>(
      `/merchants/onboarding/${merchantId}/bank-account`,
      payload
    );
    return res.data.data;
  },

  uploadDocument: async (merchantId: string, payload: UploadDocumentPayload): Promise<MerchantDocument> => {
    const res = await apiClient.post<{ success: boolean; data: MerchantDocument }>(
      `/merchants/onboarding/${merchantId}/documents`,
      payload
    );
    return res.data.data;
  },

  submitForReview: async (merchantId: string): Promise<MerchantProfile> => {
    const res = await apiClient.post<{ success: boolean; data: MerchantProfile }>(
      `/merchants/onboarding/${merchantId}/submit`
    );
    return res.data.data;
  },

  // Credentials
  generateApiKey: async (merchantId: string, payload: GenerateApiKeyPayload = {}): Promise<ApiKeyCreatedResponse> => {
    const res = await apiClient.post<{ success: boolean; data: ApiKeyCreatedResponse }>(
      `/merchants/${merchantId}/credentials/api-keys`,
      payload
    );
    return res.data.data;
  },

  listApiKeys: async (merchantId: string): Promise<MerchantApiCredential[]> => {
    const res = await apiClient.get<{ success: boolean; data: MerchantApiCredential[] }>(
      `/merchants/${merchantId}/credentials/api-keys`
    );
    return res.data.data;
  },

  revokeApiKey: async (merchantId: string, credentialId: string): Promise<void> => {
    await apiClient.delete(`/merchants/${merchantId}/credentials/api-keys/${credentialId}`);
  },

  updateWebhook: async (merchantId: string, payload: UpdateWebhookPayload): Promise<void> => {
    await apiClient.put(`/merchants/${merchantId}/credentials/webhook`, payload);
  },
};

export const adminMerchantApi = {
  getMerchants: async (
    status?: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<MerchantProfile>> => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());

    const res = await apiClient.get<{ success: boolean; data: PageResponse<MerchantProfile> }>(
      `/merchants/admin?${params.toString()}`
    );
    return res.data.data;
  },

  getMerchantById: async (merchantId: string): Promise<MerchantProfile> => {
    const res = await apiClient.get<{ success: boolean; data: MerchantProfile }>(
      `/merchants/admin/${merchantId}`
    );
    return res.data.data;
  },

  approveMerchant: async (
    merchantId: string,
    notes?: string,
    pricingTier: PricingTier = 'STANDARD'
  ): Promise<{ merchant: MerchantProfile; initialApiKey?: ApiKeyCreatedResponse }> => {
    const res = await apiClient.post<{
      success: boolean;
      data: MerchantProfile;
    }>(`/merchants/admin/${merchantId}/approve`, {
      notes,
      pricingTier,
    });
    return { merchant: res.data.data };
  },

  rejectMerchant: async (merchantId: string, reason: string): Promise<MerchantProfile> => {
    const res = await apiClient.post<{ success: boolean; data: MerchantProfile }>(
      `/merchants/admin/${merchantId}/reject`,
      null,
      { params: { reason } }
    );
    return res.data.data;
  },

  verifyDocument: async (
    docId: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
  ): Promise<MerchantDocument> => {
    const res = await apiClient.put<{ success: boolean; data: MerchantDocument }>(
      `/merchants/admin/documents/${docId}/verify`,
      null,
      { params: { status, rejectionReason } }
    );
    return res.data.data;
  },

  getAuditLogs: async (merchantId: string): Promise<MerchantAuditLog[]> => {
    const res = await apiClient.get<{ success: boolean; data: MerchantAuditLog[] }>(
      `/merchants/admin/${merchantId}/audit-logs`
    );
    return res.data.data;
  },
};
