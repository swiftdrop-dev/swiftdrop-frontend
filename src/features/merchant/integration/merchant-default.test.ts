import { renderHook } from "@testing-library/react";
import { it, expect } from "vitest";
import { useMerchantIntegration } from "./merchant-integration";
it("defaults to unavailable without mock-success fallbacks", async () => {
  const { result } = renderHook(useMerchantIntegration);
  expect(result.current.mode).toBe("unavailable");
  expect(result.current.managementReady).toBe(false);
  expect(result.current.ordersReady).toBe(false);
  await expect(result.current.profile.get()).rejects.toThrow("not enabled");
  await expect(
    result.current.orders.list({ page: 0, size: 20 }),
  ).rejects.toThrow("not enabled");
});
