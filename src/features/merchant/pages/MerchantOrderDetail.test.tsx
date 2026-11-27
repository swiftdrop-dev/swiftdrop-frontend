import { render, screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { it, expect } from "vitest";
import MerchantOrderDetail from "./MerchantOrderDetail";
import { merchantTestWrapper } from "../test-utils";
it("loads canonical order details without fabricated timeline or payment success", async () => {
  const { Wrapper } = merchantTestWrapper(
    undefined,
    "/merchant/orders/00000000-0000-0000-0000-000000000001",
  );
  render(
    <Routes>
      <Route path="/merchant/orders/:id" element={<MerchantOrderDetail />} />
    </Routes>,
    { wrapper: Wrapper },
  );
  expect(await screen.findByText("SAMPLE-TRACK")).toBeInTheDocument();
  expect(screen.getByText("Canonical parcel ID")).toBeInTheDocument();
  expect(screen.queryByText("Payment successful")).not.toBeInTheDocument();
});
