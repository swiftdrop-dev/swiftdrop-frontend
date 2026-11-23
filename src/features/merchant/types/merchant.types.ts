export type MerchantStatus = 'DRAFT' | 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type PricingTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'ENTERPRISE';
export type BusinessType =
  | 'INDIVIDUAL'
  | 'SOLE_PROPRIETORSHIP'
  | 'PARTNERSHIP'
  | 'PRIVATE_LIMITED'
  | 'PUBLIC_LIMITED'
  | 'RETAIL'
  | 'OTHER';
export type ContactType = 'PRIMARY' | 'FINANCE' | 'OPERATIONS' | 'TECHNICAL';
export type DocumentType =
  | 'BUSINESS_REGISTRATION'
  | 'TAX_CERTIFICATE'
  | 'DIRECTOR_ID'
  | 'PROOF_OF_ADDRESS'
  | 'BANK_STATEMENT'
  | 'OTHER';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type SettlementCycle = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface MerchantContact {
  id: string;
  contactType: ContactType;
  contactName: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface MerchantAddress {
  id: string;
  hubName: string;
  addressLabel?: string;
  addressLine1: string;
  streetAddress?: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  contactPerson?: string;
  contactPhone: string;
  isPrimaryPickup: boolean;
}

export interface MerchantBankAccount {
  id: string;
  bankName: string;
  branchName: string;
  branchCode?: string;
  accountNumber?: string;
  maskedAccountNumber?: string;
  accountHolderName: string;
  settlementCycle: SettlementCycle;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface MerchantDocument {
  id: string;
  documentType: DocumentType;
  documentName: string;
  fileName?: string;
  fileUrl: string;
  fileSize?: number;
  fileSizeBytes?: number;
  mimeType?: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt?: string;
  uploadedAt?: string;
}

export interface MerchantApiCredential {
  id: string;
  keyPrefix: string;
  environment: string;
  status: string;
  expiresAt?: string;
  createdAt: string;
}

export interface ApiKeyCreatedResponse {
  id: string;
  keyPrefix: string;
  rawApiKey: string;
  environment: string;
  expiresAt?: string;
}

export interface MerchantAuditLog {
  id: string;
  action: string;
  performedByUserId?: string;
  performedByRole: string;
  notes?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface MerchantProfile {
  id: string;
  userId: string;
  businessName: string;
  tradeName?: string;
  registrationNumber: string;
  taxIdentificationNumber?: string;
  taxId?: string;
  businessType: BusinessType;
  status: MerchantStatus;
  pricingTier: PricingTier;
  webhookUrl?: string;
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactEmail: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  pickupStreet: string;
  pickupCity: string;
  pickupDistrict: string;
  reviewReason?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  addresses: MerchantAddress[];
  bankAccount?: MerchantBankAccount;
  bankAccounts?: MerchantBankAccount[];
  documents: MerchantDocument[];
  apiCredentials: MerchantApiCredential[];
}

export interface RegisterMerchantPayload {
  businessName: string;
  tradeName?: string;
  registrationNumber: string;
  taxIdentificationNumber?: string;
  taxId?: string;
  businessType: BusinessType;
  primaryContactName?: string;
  primaryContactPhone?: string;
  primaryContactEmail?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface UpdateMerchantProfilePayload {
  businessName?: string;
  tradeName?: string;
  taxIdentificationNumber?: string;
  taxId?: string;
  businessType?: BusinessType;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface AddAddressPayload {
  hubName: string;
  addressLabel?: string;
  addressLine1: string;
  streetAddress?: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  contactPerson?: string;
  contactPhone: string;
  isPrimaryPickup?: boolean;
}

export interface SetBankAccountPayload {
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolderName: string;
  settlementCycle: SettlementCycle;
}

export interface UploadDocumentPayload {
  documentType: DocumentType;
  documentName: string;
  fileName?: string;
  fileUrl: string;
  fileSize?: number;
  fileSizeBytes?: number;
  mimeType?: string;
}

export interface GenerateApiKeyPayload {
  label?: string;
  environment?: string;
  expiryDays?: number;
  expiresInDays?: number;
}

export interface UpdateWebhookPayload {
  webhookUrl: string;
  webhookSecret?: string;
}

export interface ApproveMerchantPayload {
  notes?: string;
  pricingTier?: PricingTier;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

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

export type MerchantScope = 'orders:read' | 'orders:write';

export interface ApiKeyMetadata {
  id: string;
  name: string;
  publicId: string;
  scopes: MerchantScope[];
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  replacementId: string | null;
  state: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
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
