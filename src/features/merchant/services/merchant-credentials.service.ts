import type { AxiosInstance } from "axios";
import type { MerchantSessionAccess } from "../integration/MerchantSessionAccess";
import type {
  ApiKeyIssue,
  ApiKeyIssued,
  ApiKeyMetadata,
  Page,
} from "../types/merchant.types";
import { safeRequest } from "./merchant-api-error";
export function createCredentialsService(
  client: AxiosInstance,
  session: MerchantSessionAccess,
) {
  const path = "/merchant/me/api-keys";
  return {
    list: (page: number, size: number) =>
      safeRequest(
        async () =>
          (
            await client.get<Page<ApiKeyMetadata>>(path, {
              ...(await session.requestConfig()),
              params: { page, size },
            })
          ).data,
      ),
    issue: (data: ApiKeyIssue) =>
      safeRequest(
        async () =>
          (
            await client.post<ApiKeyIssued>(
              path,
              data,
              await session.requestConfig(),
            )
          ).data,
      ),
    rotate: (id: string, expiresAt?: string) =>
      safeRequest(
        async () =>
          (
            await client.post<ApiKeyIssued>(
              `${path}/${encodeURIComponent(id)}/rotate`,
              { expiresAt },
              await session.requestConfig(),
            )
          ).data,
      ),
    revoke: (id: string) =>
      safeRequest(async () => {
        await client.post(
          `${path}/${encodeURIComponent(id)}/revoke`,
          undefined,
          await session.requestConfig(),
        );
      }),
  };
}
