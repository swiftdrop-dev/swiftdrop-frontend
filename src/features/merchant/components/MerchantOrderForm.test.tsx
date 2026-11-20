import { render, screen, fireEvent } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { MerchantOrderForm } from "./MerchantOrderForm";
import { orderSchema } from "../validation/merchant-order.schemas";
import { onboardingSchema, apiKeySchema } from "../validation/merchant.schemas";
it("validates required fields before submitting", async () => {
  const submit = vi.fn();
  render(
    <MerchantOrderForm
      disabled={false}
      locked={false}
      pending={false}
      onSubmit={submit}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Create order" }));
  expect(
    (await screen.findAllByText("This field is required.")).length,
  ).toBeGreaterThan(0);
  expect(submit).not.toHaveBeenCalled();
});
it("keeps unavailable order submission disabled", () => {
  render(
    <MerchantOrderForm
      disabled
      locked={false}
      pending={false}
      onSubmit={vi.fn()}
    />,
  );
  expect(screen.getByRole("button", { name: "Create order" })).toBeDisabled();
});
it("rejects invalid onboarding and unsupported key scopes", () => {
  expect(onboardingSchema.safeParse({}).success).toBe(false);
  expect(
    apiKeySchema.safeParse({ name: "key", scopes: ["admin"] }).success,
  ).toBe(false);
  expect(orderSchema.safeParse({ weightKg: -1 }).success).toBe(false);
});
