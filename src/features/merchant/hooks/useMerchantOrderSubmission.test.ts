import { act, renderHook, waitFor } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { useMerchantOrderSubmission } from "./useMerchantOrderSubmission";
import { previewIntegration } from "../integration/merchant-integration";
import { merchantTestWrapper } from "../test-utils";
import { MerchantApiError } from "../services/merchant-api-error";
it("does not submit when live order access is disabled", async () => {
  const api = previewIntegration("approved");
  api.orders.create = vi.fn();
  const data = (await api.orders.list({ page: 0, size: 20 })).data[0].details;
  const { Wrapper } = merchantTestWrapper(api);
  const { result } = renderHook(useMerchantOrderSubmission, {
    wrapper: Wrapper,
  });
  await act(() => result.current.submit(data));
  expect(api.orders.create).not.toHaveBeenCalled();
});
it("retries explicitly with the same key and frozen payload without automatic retry", async () => {
  const api = previewIntegration("approved");
  api.ordersReady = true;
  api.orders.create = vi
    .fn()
    .mockRejectedValue(
      new MerchantApiError("REQUEST_IN_PROGRESS", "Processing", 409),
    );
  const data = (await api.orders.list({ page: 0, size: 20 })).data[0].details;
  const { Wrapper } = merchantTestWrapper(api);
  const { result } = renderHook(useMerchantOrderSubmission, {
    wrapper: Wrapper,
  });
  await act(() => result.current.submit(data));
  expect(api.orders.create).toHaveBeenCalledTimes(1);
  const reference = result.current.requestReference;
  data.description = "Changed after submission";
  act(() => result.current.retry());
  await waitFor(() => expect(api.orders.create).toHaveBeenCalledTimes(2));
  expect(api.orders.create).toHaveBeenLastCalledWith(
    expect.objectContaining({ description: "Sample parcel" }),
    reference,
  );
});
it("blocks the retry action after an uncertain outcome", async () => {
  const api = previewIntegration("approved");
  api.ordersReady = true;
  api.orders.create = vi
    .fn()
    .mockRejectedValue(
      new MerchantApiError("OUTCOME_UNCERTAIN", "Reconcile", 503),
    );
  const data = (await api.orders.list({ page: 0, size: 20 })).data[0].details;
  const { Wrapper } = merchantTestWrapper(api);
  const { result } = renderHook(useMerchantOrderSubmission, {
    wrapper: Wrapper,
  });
  await act(() => result.current.submit(data));
  expect(result.current.locked).toBe(true);
  expect(result.current.retryAllowed).toBe(false);
});
