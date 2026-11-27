import type { Parcel } from "../../../types/global.types";
import { pricingService } from "../../../services/pricing.service";

/**
 * Downloads the official delivery receipt PDF generated and streamed by the backend pricing-service.
 */
export async function downloadReceipt(parcel: Parcel): Promise<void> {
  await pricingService.downloadReceiptPdf(parcel.trackingNumber);
}