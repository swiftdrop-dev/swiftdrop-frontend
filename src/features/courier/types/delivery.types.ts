/** Exact response record from GET /api/v1/parcels/me/assigned-deliveries. */
export interface AssignedDelivery {
  parcelId: string;
  assignmentId: number;
  trackingNumber: string;
  status: string;
  scheduledDate: string | null;
  assignedAt: string;
  recipientName: string | null;
  recipientPhone: string | null;
  deliveryAddress: string | null;
}

/** Paginated response from the authenticated Parcel Service endpoint. */
export interface AssignedDeliveriesResponse {
  content: AssignedDelivery[];
  page: number;
  size: number;
  hasNext: boolean;
}

export interface CourierParcelStatusUpdateRequest {
  status: 'in_transit' | 'failed';
  failureReason?: string;
}

export interface CourierParcelStatusUpdateResponse {
  parcelId: string;
  previousStatus: string;
  status: string;
  changedAt: string;
}
