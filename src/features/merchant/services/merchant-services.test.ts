import axios from "axios";
import { it, expect, vi } from "vitest";
import { createOrdersService } from "./merchant-orders.service";
import { createProfileService } from "./merchant-profile.service";
import { merchantError } from "./merchant-api-error";
import { previewIntegration } from "../integration/merchant-integration";
it("forwards idempotency header without user-controlled merchant identity", async () => {
  const client = axios.create();
  const post = vi
    .spyOn(client, "post")
    .mockResolvedValue({ data: { id: "parcel" } });
  const service = createOrdersService(client, {
    requestConfig: async () => ({
      headers: { Authorization: "test-only-session" },
    }),
  });
  const data = (
    await previewIntegration("approved").orders.list({ page: 0, size: 20 })
  ).data[0].details;
  await service.create(data, "request-1");
  expect(post).toHaveBeenCalledWith(
    "/merchant/orders",
    data,
    expect.objectContaining({
      headers: expect.objectContaining({ "Idempotency-Key": "request-1" }),
    }),
  );
  expect(data).not.toHaveProperty("merchantId");
});
it("normalizes errors without retaining credentials or server bodies", () => {
  const error = merchantError({
    isAxiosError: true,
    config: { headers: { "X-API-Key": "never-retain" } },
    response: {
      status: 503,
      data: { code: "OUTCOME_UNCERTAIN", message: "private server body" },
    },
  });
  expect(error.code).toBe("OUTCOME_UNCERTAIN");
  expect(JSON.stringify(error)).not.toContain("never-retain");
  expect(error.message).not.toContain("private server body");
});
it("only treats the specific authenticated profile 404 as no profile", async () => {
  const client = axios.create();
  const get = vi.spyOn(client, "get");
  const service = createProfileService(client, {
    accountId: "verified-account",
    requestConfig: async () => ({}),
  });
  get.mockRejectedValueOnce({
    isAxiosError: true,
    response: { status: 404, data: { code: "MERCHANT_NOT_FOUND" } },
  });
  expect(await service.get()).toBeNull();
  get.mockRejectedValueOnce({ isAxiosError: true, response: { status: 503 } });
  await expect(service.get()).rejects.toThrow("unavailable");
});
