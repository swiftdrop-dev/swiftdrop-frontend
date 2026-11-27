import { describe, it, expect } from "vitest";
import { previewIntegration } from "./merchant-integration";
describe("read-only preview boundary", () => {
  it("does not enable live access or mutations", async () => {
    const api = previewIntegration("approved");
    expect(api.managementReady).toBe(false);
    expect(api.ordersReady).toBe(false);
    await expect(
      api.credentials.issue({ name: "Key", scopes: ["orders:read"] }),
    ).rejects.toThrow("not enabled");
    await expect(api.credentials.rotate("id")).rejects.toThrow("not enabled");
    await expect(api.credentials.revoke("id")).rejects.toThrow("not enabled");
  });
  it.each([
    ["approved", "APPROVED"],
    ["pending", "PENDING"],
    ["rejected", "REJECTED"],
  ])("represents %s explicitly as sample data", async (state, expected) => {
    expect((await previewIntegration(state).profile.get())?.status).toBe(
      expected,
    );
  });
  it("represents onboarding as no business profile", async () => {
    expect(await previewIntegration("new").profile.get()).toBeNull();
  });
});
