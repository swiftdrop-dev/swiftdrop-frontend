export type DispatchStatus =
  | 'UNASSIGNED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type DispatchPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type DispatchMode = 'AUTOMATIC' | 'MANUAL';
export type VehicleType = 'BIKE' | 'MOTORCYCLE' | 'CAR' | 'VAN' | 'TRUCK';
export type AssignmentDecision = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TIMEOUT' | 'CANCELLED';
export type AssignmentMode = 'AUTOMATIC' | 'MANUAL';

export interface DispatchJobSummary {
  id: string;
  parcelId: string;
  trackingNumber: string;
  priority: DispatchPriority;
  dispatchStatus: DispatchStatus;
  pickupZoneCode: string;
  destinationZoneCode: string;
  pickupCity: string;
  pickupDistrict: string;
  destinationCity: string;
  destinationDistrict: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  requiredVehicleType: VehicleType;
  totalFee: number;
  createdAt: string;
}

export interface CourierCandidate {
  courierId: string;
  courierName: string;
  courierPhone: string;
  vehicleType: VehicleType;
  currentLatitude: number;
  currentLongitude: number;
  distanceKm: number;
  estimatedArrivalMinutes: number;
  rating: number;
  activeDeliveries: number;
  isAvailable: boolean;
}

export interface DispatchAssignment {
  id: string;
  jobId: string;
  courierId: string;
  courierName: string;
  courierPhone: string;
  assignmentMode: AssignmentMode;
  decision: AssignmentDecision;
  distanceKm: number;
  offeredAt: string;
  expiresAt: string;
  respondedAt?: string;
  notes?: string;
}

export interface DispatchJob {
  id: string;
  parcelId: string;
  trackingNumber: string;
  priority: DispatchPriority;
  dispatchStatus: DispatchStatus;
  dispatchMode: DispatchMode;
  assignedCourierId?: string;
  assignedCourierName?: string;
  assignedCourierPhone?: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddressLine1: string;
  pickupCity: string;
  pickupDistrict: string;
  pickupZoneCode: string;
  destinationLatitude: number;
  destinationLongitude: number;
  destinationAddressLine1: string;
  destinationCity: string;
  destinationDistrict: string;
  destinationZoneCode: string;
  packageWeightKg: number;
  requiredVehicleType: VehicleType;
  activeAssignmentId?: string;
  assignments: DispatchAssignment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  completedAt?: string;
}

export interface DispatchZone {
  id: string;
  zoneCode: string;
  zoneName: string;
  city: string;
  district: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  isActive: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ManualAssignPayload {
  courierId: string;
  dispatcherNotes?: string;
  offerTtlSeconds?: number;
}

export interface CourierDecisionPayload {
  accepted: boolean;
  reason?: string;
}
