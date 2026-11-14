export type MerchantStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type PricingTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'ENTERPRISE';
export type BusinessType =
  | 'SOLE_PROPRIETORSHIP'
  | 'PARTNERSHIP'
  | 'PRIVATE_LIMITED'
  | 'PUBLIC_LIMITED'
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
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  contactPerson: string;
  contactPhone: string;
  isPrimaryPickup: boolean;
}

export interface MerchantBankAccount {
  id: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolderName: string;
  settlementCycle: SettlementCycle;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface MerchantDocument {
  id: string;
  documentType: DocumentType;
  documentName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
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
  businessType: BusinessType;
  status: MerchantStatus;
  pricingTier: PricingTier;
  webhookUrl?: string;
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactEmail: string;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  addresses: MerchantAddress[];
  bankAccount?: MerchantBankAccount;
  documents: MerchantDocument[];
  apiCredentials: MerchantApiCredential[];
}

export interface RegisterMerchantPayload {
  businessName: string;
  tradeName?: string;
  registrationNumber: string;
  taxIdentificationNumber?: string;
  businessType: BusinessType;
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactEmail: string;
}

export interface UpdateMerchantProfilePayload {
  businessName?: string;
  tradeName?: string;
  taxIdentificationNumber?: string;
  businessType?: BusinessType;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface AddAddressPayload {
  hubName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  contactPerson: string;
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
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
}

export interface GenerateApiKeyPayload {
  environment?: string;
  expiryDays?: number;
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
