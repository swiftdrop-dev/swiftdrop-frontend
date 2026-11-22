export interface CourierProfile {
  id: string;
  name: string;
  vehicleType: string | null;
  vehiclePlate: string | null;
  rating: number | null;
  available: boolean | null;
  deliveriesToday: number | null;
  totalDeliveries: number | null;
}
