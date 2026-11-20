import type { AxiosRequestConfig } from "axios";
/** M1 must supply verified human identity and transport; demo AuthContext is not sufficient. */
export interface MerchantSessionAccess {
  accountId: string;
  requestConfig(): Promise<AxiosRequestConfig>;
}
