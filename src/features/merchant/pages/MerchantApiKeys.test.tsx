import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import MerchantApiKeys from "./MerchantApiKeys";
import { merchantTestWrapper } from "../test-utils";
import { previewIntegration } from "../integration/merchant-integration";
it("shows metadata but never enables preview generation or rotation", async () => {
  const { Wrapper } = merchantTestWrapper();
  render(<MerchantApiKeys />, { wrapper: Wrapper });
  expect(await screen.findByText("Sample integration")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Generate API key" }),
  ).toBeDisabled();
  expect(screen.getByRole("button", { name: "Rotate" })).toBeDisabled();
});
it("rotates only after confirmation and never caches the returned secret", async () => {
  const api = previewIntegration("approved");
  api.managementReady = true;
  api.credentials.rotate = vi
    .fn()
    .mockResolvedValue({
      credential: { id: "replacement" },
      apiKey: "test-only-replacement",
    });
  const { Wrapper, cache } = merchantTestWrapper(api);
  render(<MerchantApiKeys />, { wrapper: Wrapper });
  fireEvent.click(await screen.findByRole("button", { name: "Rotate" }));
  expect(api.credentials.rotate).not.toHaveBeenCalled();
  expect(
    screen.getByText(/old key stops working immediately/),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  expect(
    await screen.findByDisplayValue("test-only-replacement"),
  ).toBeInTheDocument();
  expect(
    JSON.stringify(
      cache
        .getQueryCache()
        .getAll()
        .map((query) => query.state.data),
    ),
  ).not.toContain("test-only-replacement");
  expect(cache.getMutationCache().getAll()).toHaveLength(0);
});
it("revokes with owner access even when approval is pending", async () => {
  const api = previewIntegration("pending");
  api.managementReady = true;
  api.credentials.revoke = vi.fn().mockResolvedValue(undefined);
  const { Wrapper } = merchantTestWrapper(api);
  render(<MerchantApiKeys />, { wrapper: Wrapper });
  fireEvent.click(await screen.findByRole("button", { name: "Revoke" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  await waitFor(() =>
    expect(api.credentials.revoke).toHaveBeenCalledWith("sample-metadata"),
  );
});
