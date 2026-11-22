import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import MerchantOrders from "./MerchantOrders";
import { merchantTestWrapper } from "../test-utils";
import { previewIntegration } from "../integration/merchant-integration";
it("delegates pagination and filters to the service", async () => {
  const api = previewIntegration("approved");
  const original = api.orders.list;
  api.orders.list = vi.fn(original);
  const { Wrapper } = merchantTestWrapper(api);
  render(<MerchantOrders />, { wrapper: Wrapper });
  expect(await screen.findByText("SAMPLE-ORDER")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Status"), {
    target: { value: "DELIVERED" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
  await waitFor(() =>
    expect(api.orders.list).toHaveBeenCalledWith(
      expect.objectContaining({ status: "DELIVERED", page: 0 }),
      expect.anything(),
    ),
  );
  expect(await screen.findByText("No records found")).toBeInTheDocument();
});
