export type MerchantStatus = "PENDING" | "APPROVED" | "REJECTED";
export interface MerchantProfileFields {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  pickupStreet: string;
  pickupCity: string;
  pickupDistrict: string;
}
export interface MerchantOnboarding extends MerchantProfileFields {
  businessName: string;
  registrationNumber: string;
}
export interface MerchantProfile extends MerchantOnboarding {
  id: string;
  status: MerchantStatus;
  reviewReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export type MerchantScope = "orders:read" | "orders:write";
export interface ApiKeyMetadata {
  id: string;
  name: string;
  publicId: string;
  scopes: MerchantScope[];
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  replacementId: string | null;
  state: "ACTIVE" | "EXPIRED" | "REVOKED";
}
export interface ApiKeyIssue {
  name: string;
  scopes: MerchantScope[];
  expiresAt?: string;
}
export interface ApiKeyIssued {
  credential: ApiKeyMetadata;
  apiKey: string;
}
export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}
