import type { AxiosRequestConfig } from "axios";
/** Deliberately unavailable until the browser-to-M5 authentication architecture is approved. */
export interface MerchantOrderAccess {
  requestConfig(): Promise<AxiosRequestConfig>;
}
