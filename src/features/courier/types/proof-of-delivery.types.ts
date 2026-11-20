export interface OtpChallengeReceipt {
  challengeId: string;
  expiresAt: string;
  resendAvailableAt: string;
  destinationMasked: string;
}

export type OtpVerificationOutcome = 'VERIFIED' | 'INVALID' | 'EXPIRED' | 'EXHAUSTED';

export interface OtpVerificationResponse {
  challengeId: string;
  outcome: OtpVerificationOutcome;
  verifiedAt: string | null;
}

export interface DeliveryPhotoProofResponse {
  proofId: string;
  format: string;
  byteSize: number;
  uploadedAt: string;
}

export interface DeliveryCompletionResponse {
  parcelId: string;
  status: 'delivered';
  completedAt: string;
}
