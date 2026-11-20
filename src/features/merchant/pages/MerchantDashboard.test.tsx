import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import MerchantDashboard from "./MerchantDashboard";
import { merchantTestWrapper } from "../test-utils";
it("shows supported total and recent orders without invented revenue metrics", async () => {
  const { Wrapper } = merchantTestWrapper();
  render(<MerchantDashboard />, { wrapper: Wrapper });
  expect(await screen.findByText("SAMPLE-ORDER")).toBeInTheDocument();
  expect(screen.getByText("Total merchant orders")).toBeInTheDocument();
  expect(screen.queryByText("Revenue Collected")).not.toBeInTheDocument();
  expect(screen.queryByText("94.2%")).not.toBeInTheDocument();
});
