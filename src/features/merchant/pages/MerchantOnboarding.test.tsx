import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import MerchantOnboarding from "./MerchantOnboarding";
import { merchantTestWrapper } from "../test-utils";
import { previewIntegration } from "../integration/merchant-integration";
it("shows business registration fields without enabling preview submission", async () => {
  const { Wrapper } = merchantTestWrapper(previewIntegration("new"));
  render(<MerchantOnboarding />, { wrapper: Wrapper });
  expect(await screen.findByLabelText("Business name")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Submit application" }),
  ).toBeDisabled();
});
it("shows pending approval instead of another application form", async () => {
  const { Wrapper } = merchantTestWrapper(previewIntegration("pending"));
  render(<MerchantOnboarding />, { wrapper: Wrapper });
  expect(await screen.findByText("PENDING")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Submit application" }),
  ).not.toBeInTheDocument();
});
