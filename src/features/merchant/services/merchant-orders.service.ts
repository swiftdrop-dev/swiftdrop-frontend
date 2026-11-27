import type { AxiosInstance } from "axios";
import type { MerchantOrderAccess } from "../integration/MerchantOrderAccess";
import type {
  MerchantOrder,
  MerchantOrderCreate,
  OrderQuery,
} from "../types/merchant-order.types";
import type { Page } from "../types/merchant.types";
import { safeRequest } from "./merchant-api-error";
export function createOrdersService(
  client: AxiosInstance,
  access: MerchantOrderAccess,
) {
  return {
    list: (query: OrderQuery, signal?: AbortSignal) =>
      safeRequest(
        async () =>
          (
            await client.get<Page<MerchantOrder>>("/merchant/orders", {
              ...(await access.requestConfig()),
              params: query,
              signal,
            })
          ).data,
      ),
    detail: (id: string) =>
      safeRequest(
        async () =>
          (
            await client.get<MerchantOrder>(
              `/merchant/orders/${encodeURIComponent(id)}`,
              await access.requestConfig(),
            )
          ).data,
      ),
    create: (data: MerchantOrderCreate, key: string) =>
      safeRequest(async () => {
        const config = await access.requestConfig();
        return (
          await client.post<MerchantOrder>("/merchant/orders", data, {
            ...config,
            headers: { ...config.headers, "Idempotency-Key": key },
          })
        ).data;
      }),
  };
}
