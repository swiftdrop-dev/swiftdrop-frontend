import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import MerchantProfile from "./MerchantProfile";
import { merchantTestWrapper } from "../test-utils";
import { previewIntegration } from "../integration/merchant-integration";
it("keeps legal identity read-only and preview saves disabled", async () => {
  const { Wrapper } = merchantTestWrapper();
  render(<MerchantProfile />, { wrapper: Wrapper });
  expect(await screen.findByLabelText("Business name")).toHaveAttribute(
    "readonly",
  );
  expect(screen.getByRole("button", { name: "Save profile" })).toBeDisabled();
});
it("shows rejection reasons", async () => {
  const { Wrapper } = merchantTestWrapper(previewIntegration("rejected"));
  render(<MerchantProfile />, { wrapper: Wrapper });
  expect(await screen.findByText(/Sample reason/)).toBeInTheDocument();
  expect(screen.getByText("REJECTED")).toBeInTheDocument();
});
