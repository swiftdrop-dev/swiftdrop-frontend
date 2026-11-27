import type { AxiosInstance } from "axios";
import type { MerchantSessionAccess } from "../integration/MerchantSessionAccess";
import type {
  MerchantOnboarding,
  MerchantProfile,
  MerchantProfileFields,
} from "../types/merchant.types";
import { safeRequest, MerchantApiError } from "./merchant-api-error";
export function createProfileService(
  client: AxiosInstance,
  session: MerchantSessionAccess,
) {
  return {
    get: () =>
      safeRequest(async (): Promise<MerchantProfile | null> => {
        const config = await session.requestConfig();
        try {
          return (await client.get<MerchantProfile>("/merchant/me", config))
            .data;
        } catch (error) {
          if (
            error &&
            typeof error === "object" &&
            "response" in error &&
            (
              error as {
                response?: { status: number; data?: { code?: string } };
              }
            ).response?.status === 404 &&
            (error as { response: { data?: { code?: string } } }).response.data
              ?.code === "MERCHANT_NOT_FOUND"
          )
            return null;
          throw error;
        }
      }),
    onboard: (data: MerchantOnboarding) =>
      safeRequest(
        async () =>
          (
            await client.post<MerchantProfile>(
              "/merchant/onboarding",
              data,
              await session.requestConfig(),
            )
          ).data,
      ),
    update: (data: MerchantProfileFields) =>
      safeRequest(
        async () =>
          (
            await client.patch<MerchantProfile>(
              "/merchant/me",
              data,
              await session.requestConfig(),
            )
          ).data,
      ),
  };
}
export function requireApproved(profile: MerchantProfile | null | undefined) {
  if (profile?.status !== "APPROVED")
    throw new MerchantApiError(
      "MERCHANT_NOT_APPROVED",
      "An approved merchant profile is required.",
      403,
    );
}
