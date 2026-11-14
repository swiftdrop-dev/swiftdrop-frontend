import { render, screen, fireEvent } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { MerchantPagination } from "./MerchantPagination";
it("shows a useful empty range with both controls disabled", () => {
  render(<MerchantPagination page={0} size={20} total={0} onPage={vi.fn()} />);
  expect(screen.getByText(/No records/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});
it("shows the current range and keeps next/previous behavior", () => {
  const onPage = vi.fn();
  render(<MerchantPagination page={1} size={20} total={45} onPage={onPage} />);
  expect(screen.getByText(/21–40 of 45/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(onPage).toHaveBeenCalledWith(2);
});
